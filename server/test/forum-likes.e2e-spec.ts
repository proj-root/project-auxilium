import { randomUUID } from 'node:crypto';
import { RolesConfig } from '@auxilium/configs/roles';
import {
  api,
  closeDb,
  db,
  readLevel,
  setUserRole,
  signUpUser,
  truncateForum,
  truncateUsers,
  type TestUser,
} from './setup/test-helpers';

const PASSWORD = 'Str0ng@Passw0rd';

describe('Forum likes (e2e)', () => {
  let author: TestUser;
  let reader: TestUser;
  let superadmin: TestUser;

  let postId: string;
  let commentId: string;

  const createPost = async (user: TestUser, title: string) => {
    const res = await api()
      .post('/api/posts')
      .set('Cookie', user.cookie)
      .send({ title, content: 'body' });
    return res.body.data.postId as string;
  };

  const createComment = async (user: TestUser, onPost: string) => {
    const res = await api()
      .post('/api/comments')
      .set('Cookie', user.cookie)
      .send({ postId: onPost, text: 'a comment' });
    return res.body.data.commentId as string;
  };

  const countLikes = async (table: string, column: string, id: string) => {
    const { rows } = await db().query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${table} WHERE ${column} = $1`,
      [id],
    );
    return Number(rows[0]!.count);
  };

  beforeAll(async () => {
    await truncateUsers();

    author = await signUpUser({
      email: 'author@likes.test',
      password: PASSWORD,
      name: 'Ada Author',
    });
    reader = await signUpUser({
      email: 'reader@likes.test',
      password: PASSWORD,
      name: 'Rex Reader',
    });
    superadmin = await signUpUser({
      email: 'superadmin@likes.test',
      password: PASSWORD,
      name: 'Sam Superadmin',
    });

    await setUserRole(superadmin.userId, RolesConfig.SUPERADMIN);
  });

  beforeEach(async () => {
    await truncateForum();
    postId = await createPost(author, 'A likeable post');
    commentId = await createComment(author, postId);
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/posts/:postId/like', () => {
    it('likes a post and returns the settled counts', async () => {
      const res = await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'success',
        data: { likeCount: 1, likedByMe: true },
      });
    });

    it('is idempotent: liking twice leaves one row', async () => {
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);
      const second = await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(second.status).toBe(200);
      expect(second.body.data.likeCount).toBe(1);
      expect(await countLikes('forum_post_like', 'post_id', postId)).toBe(1);
    });

    it('counts each person once and reports likedByMe per viewer', async () => {
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', author.cookie);

      const asReader = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', reader.cookie);
      expect(asReader.body.data).toMatchObject({
        likeCount: 2,
        likedByMe: true,
      });

      const asStranger = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', superadmin.cookie);
      expect(asStranger.body.data).toMatchObject({
        likeCount: 2,
        likedByMe: false,
      });

      const anonymous = await api().get(`/api/posts/${postId}`);
      expect(anonymous.body.data).toMatchObject({
        likeCount: 2,
        likedByMe: false,
      });
    });

    it('rejects an unauthenticated request', async () => {
      const res = await api().post(`/api/posts/${postId}/like`);
      expect(res.status).toBe(401);
    });

    it('returns 400 for a malformed id and 404 for an unknown one', async () => {
      const malformed = await api()
        .post('/api/posts/not-a-uuid/like')
        .set('Cookie', reader.cookie);
      expect(malformed.status).toBe(400);

      const unknown = await api()
        .post(`/api/posts/${randomUUID()}/like`)
        .set('Cookie', reader.cookie);
      expect(unknown.status).toBe(404);
    });

    it('refuses to like a soft-deleted post', async () => {
      await api().delete(`/api/posts/${postId}`).set('Cookie', author.cookie);

      const res = await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:postId/like', () => {
    it('removes the like and returns the new count', async () => {
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      const res = await api()
        .delete(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ likeCount: 0, likedByMe: false });
      expect(await countLikes('forum_post_like', 'post_id', postId)).toBe(0);
    });

    it('is a no-op when the viewer never liked it', async () => {
      const res = await api()
        .delete(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ likeCount: 0, likedByMe: false });
    });

    it('leaves other people’s likes alone', async () => {
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', author.cookie);

      const res = await api()
        .delete(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);

      expect(res.body.data).toEqual({ likeCount: 1, likedByMe: false });
    });
  });

  describe('comment likes', () => {
    it('likes and unlikes a comment, surfacing the count on the thread', async () => {
      const liked = await api()
        .post(`/api/comments/${commentId}/like`)
        .set('Cookie', reader.cookie);

      expect(liked.status).toBe(200);
      expect(liked.body.data).toEqual({ likeCount: 1, likedByMe: true });

      const [comment] = await readLevel(postId, reader.cookie);
      expect(comment).toMatchObject({ likeCount: 1, likedByMe: true });

      const unliked = await api()
        .delete(`/api/comments/${commentId}/like`)
        .set('Cookie', reader.cookie);
      expect(unliked.body.data).toEqual({ likeCount: 0, likedByMe: false });
    });

    it('rejects an unauthenticated request', async () => {
      const res = await api().post(`/api/comments/${commentId}/like`);
      expect(res.status).toBe(401);
    });

    it('refuses to like a soft-deleted comment, and blanks its count', async () => {
      await api()
        .post(`/api/comments/${commentId}/like`)
        .set('Cookie', reader.cookie);
      await api()
        .delete(`/api/comments/${commentId}`)
        .set('Cookie', author.cookie);

      const res = await api()
        .post(`/api/comments/${commentId}/like`)
        .set('Cookie', reader.cookie);
      expect(res.status).toBe(404);

      // The tombstone keeps its place in the thread but reports no likes.
      const [tombstone] = await readLevel(postId, reader.cookie);
      expect(tombstone).toMatchObject({
        text: '[deleted]',
        likeCount: 0,
        likedByMe: false,
      });
    });

    it('sorts top-level comments by likes under sortBy=top', async () => {
      const popular = await createComment(reader, postId);

      await api()
        .post(`/api/comments/${popular}/like`)
        .set('Cookie', author.cookie);
      await api()
        .post(`/api/comments/${popular}/like`)
        .set('Cookie', superadmin.cookie);

      const res = await api()
        .get(`/api/comments?postId=${postId}&sortBy=top`)
        .set('Cookie', author.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.comments[0].commentId).toBe(popular);
      expect(res.body.data.comments[0].likeCount).toBe(2);
    });
  });

  describe('cascades', () => {
    it('drops post likes when the post is hard deleted', async () => {
      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', reader.cookie);
      await api()
        .post(`/api/comments/${commentId}/like`)
        .set('Cookie', reader.cookie);

      const res = await api()
        .delete(`/api/posts/${postId}/hard`)
        .set('Cookie', superadmin.cookie);
      expect(res.status).toBe(200);

      expect(await countLikes('forum_post_like', 'post_id', postId)).toBe(0);
      expect(
        await countLikes('forum_comment_like', 'comment_id', commentId),
      ).toBe(0);
    });
  });
});
