import { randomUUID } from 'node:crypto';
import { RolesConfig } from '@auxilium/configs/roles';
import { StatusConfig } from '@auxilium/configs/status';
import {
  api,
  closeDb,
  countComments,
  flattenTree,
  setUserRole,
  signUpUser,
  truncateForum,
  truncateUsers,
  type TestUser,
} from './setup/test-helpers';

const PASSWORD = 'Str0ng@Passw0rd';

describe('Forum comments and replies (e2e)', () => {
  let author: TestUser;
  let responder: TestUser;
  let admin: TestUser;

  let postId: string;

  const comment = (user: TestUser, body: object) =>
    api().post('/api/comments').set('Cookie', user.cookie).send(body);

  const createPost = async (user: TestUser, title: string) => {
    const res = await api()
      .post('/api/posts')
      .set('Cookie', user.cookie)
      .send({ title, content: 'body' });
    return res.body.data.postId as string;
  };

  /** Creates a comment and returns its id, failing loudly if the call errored. */
  const commentId = async (user: TestUser, body: object) => {
    const res = await comment(user, body);
    if (res.status !== 201) {
      throw new Error(
        `Expected 201 creating comment, got ${res.status}: ${JSON.stringify(res.body)}`,
      );
    }
    return res.body.data.commentId as string;
  };

  beforeAll(async () => {
    await truncateUsers();

    author = await signUpUser({
      email: 'author@comments.test',
      password: PASSWORD,
      name: 'Ada Author',
    });
    responder = await signUpUser({
      email: 'responder@comments.test',
      password: PASSWORD,
      name: 'Rory Responder',
    });
    admin = await signUpUser({
      email: 'admin@comments.test',
      password: PASSWORD,
      name: 'Amy Admin',
    });

    await setUserRole(admin.userId, RolesConfig.ADMIN);
  });

  beforeEach(async () => {
    await truncateForum();
    postId = await createPost(author, 'How do I claim CCA points?');
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/comments', () => {
    it('creates a comment with postId taken from the JSON payload', async () => {
      const res = await comment(responder, {
        postId,
        text: 'Go to the CCA portal.',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: 'success',
        message: 'Comment created successfully',
      });
      expect(res.body.data.postId).toBe(postId);
      expect(res.body.data.parentCommentId).toBeNull();
      expect(res.body.data.createdBy).toBe(responder.userId);
    });

    it('rejects an unauthenticated request', async () => {
      const res = await api()
        .post('/api/comments')
        .send({ postId, text: 'anon' });

      expect(res.status).toBe(401);
    });

    it.each([
      ['a malformed postId', { postId: 'not-a-uuid', text: 'x' }],
      ['a missing postId', { text: 'x' }],
    ])('rejects %s with 400', async (_label, body) => {
      const res = await comment(responder, body);
      expect(res.status).toBe(400);
    });

    it('rejects empty text with 400 rather than a database error', async () => {
      const res = await comment(responder, { postId, text: '' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for a post that does not exist', async () => {
      const res = await comment(responder, {
        postId: randomUUID(),
        text: 'x',
      });
      expect(res.status).toBe(404);
    });

    it('returns 404 for a soft-deleted post', async () => {
      await api().delete(`/api/posts/${postId}`).set('Cookie', author.cookie);

      const res = await comment(responder, { postId, text: 'too late' });
      expect(res.status).toBe(404);
    });
  });

  describe('replies', () => {
    it("lets a student reply to another person's comment", async () => {
      const parent = await commentId(author, { postId, text: 'A' });

      const res = await comment(responder, {
        postId,
        parentCommentId: parent,
        text: 'Replying to someone else',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.parentCommentId).toBe(parent);
      expect(res.body.data.createdBy).toBe(responder.userId);
    });

    it('nests replies to arbitrary depth', async () => {
      const a = await commentId(author, { postId, text: 'A' });
      const b = await commentId(responder, {
        postId,
        parentCommentId: a,
        text: 'B',
      });
      const c = await commentId(author, {
        postId,
        parentCommentId: b,
        text: 'C',
      });
      await commentId(responder, { postId, parentCommentId: c, text: 'D' });

      const res = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);

      expect(res.status).toBe(200);
      expect(flattenTree(res.body.data.comments)).toEqual([
        { text: 'A', depth: 0 },
        { text: 'B', depth: 1 },
        { text: 'C', depth: 2 },
        { text: 'D', depth: 3 },
      ]);
    });

    it('keeps sibling replies in chronological order', async () => {
      const parent = await commentId(author, { postId, text: 'parent' });
      await commentId(author, {
        postId,
        parentCommentId: parent,
        text: 'first',
      });
      await commentId(responder, {
        postId,
        parentCommentId: parent,
        text: 'second',
      });

      const res = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);

      expect(res.body.data.comments[0].replies.map((r: any) => r.text)).toEqual(
        ['first', 'second'],
      );
    });

    it('refuses a parent comment that belongs to a different post', async () => {
      const otherPostId = await createPost(author, 'Another thread');
      const parentOnOtherPost = await commentId(author, {
        postId: otherPostId,
        text: 'elsewhere',
      });

      const res = await comment(responder, {
        postId,
        parentCommentId: parentOnOtherPost,
        text: 'grafted',
      });

      expect(res.status).toBe(400);
      expect(await countComments(postId)).toBe(0);
    });

    it('returns 404 for a parent comment that does not exist', async () => {
      const res = await comment(responder, {
        postId,
        parentCommentId: randomUUID(),
        text: 'orphan',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('soft delete keeps threads intact', () => {
    it('tombstones a mid-thread comment and preserves its replies', async () => {
      const a = await commentId(author, { postId, text: 'A' });
      const b = await commentId(responder, {
        postId,
        parentCommentId: a,
        text: 'B',
      });
      await commentId(author, { postId, parentCommentId: b, text: 'C' });

      const deleted = await api()
        .delete(`/api/comments/${b}`)
        .set('Cookie', responder.cookie);
      expect(deleted.status).toBe(200);

      const res = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);

      expect(flattenTree(res.body.data.comments)).toEqual([
        { text: 'A', depth: 0 },
        { text: '[deleted]', depth: 1 },
        { text: 'C', depth: 2 },
      ]);

      const tombstone = res.body.data.comments[0].replies[0];
      expect(tombstone.statusId).toBe(StatusConfig.DELETED);
      expect(tombstone.creator).toBeNull();
    });
  });

  describe('authorisation', () => {
    it('lets only the author edit their comment', async () => {
      const id = await commentId(responder, { postId, text: 'mine' });

      const byAuthor = await api()
        .put(`/api/comments/${id}`)
        .set('Cookie', responder.cookie)
        .send({ text: 'edited' });
      expect(byAuthor.status).toBe(200);
      expect(byAuthor.body.data.text).toBe('edited');

      const byOther = await api()
        .put(`/api/comments/${id}`)
        .set('Cookie', author.cookie)
        .send({ text: 'hijacked' });
      expect(byOther.status).toBe(403);

      const byAdmin = await api()
        .put(`/api/comments/${id}`)
        .set('Cookie', admin.cookie)
        .send({ text: 'moderated' });
      expect(byAdmin.status).toBe(403);
    });

    it('lets the author or an admin delete, but not an unrelated student', async () => {
      const first = await commentId(responder, { postId, text: 'one' });
      const byOther = await api()
        .delete(`/api/comments/${first}`)
        .set('Cookie', author.cookie);
      expect(byOther.status).toBe(403);

      const byAuthor = await api()
        .delete(`/api/comments/${first}`)
        .set('Cookie', responder.cookie);
      expect(byAuthor.status).toBe(200);

      const second = await commentId(responder, { postId, text: 'two' });
      const byAdmin = await api()
        .delete(`/api/comments/${second}`)
        .set('Cookie', admin.cookie);
      expect(byAdmin.status).toBe(200);
    });
  });

  describe('GET /api/comments', () => {
    it('lists one post’s comments flat, with pagination metadata', async () => {
      const otherPostId = await createPost(author, 'Unrelated');
      await commentId(author, { postId: otherPostId, text: 'elsewhere' });

      const a = await commentId(author, { postId, text: 'A' });
      await commentId(responder, { postId, parentCommentId: a, text: 'B' });

      const res = await api()
        .get(`/api/comments?postId=${postId}`)
        .set('Cookie', author.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.pageCount).toBe(1);
      expect(res.body.data.comments.map((c: any) => c.text).sort()).toEqual([
        'A',
        'B',
      ]);
    });

    it('requires a postId', async () => {
      const res = await api().get('/api/comments').set('Cookie', author.cookie);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/comments/:commentId', () => {
    it('returns the comment with its reply subtree', async () => {
      const a = await commentId(author, { postId, text: 'A' });
      const b = await commentId(responder, {
        postId,
        parentCommentId: a,
        text: 'B',
      });
      await commentId(author, { postId, parentCommentId: b, text: 'C' });

      const res = await api()
        .get(`/api/comments/${b}`)
        .set('Cookie', author.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.text).toBe('B');
      expect(flattenTree([res.body.data])).toEqual([
        { text: 'B', depth: 0 },
        { text: 'C', depth: 1 },
      ]);
    });

    it('returns 400 for a malformed id and 404 for an unknown one', async () => {
      const malformed = await api()
        .get('/api/comments/not-a-uuid')
        .set('Cookie', author.cookie);
      expect(malformed.status).toBe(400);

      const unknown = await api()
        .get(`/api/comments/${randomUUID()}`)
        .set('Cookie', author.cookie);
      expect(unknown.status).toBe(404);
    });
  });
});
