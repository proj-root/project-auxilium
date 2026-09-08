import { randomUUID } from 'node:crypto';
import { RolesConfig } from '@auxilium/configs/roles';
import { StatusConfig } from '@auxilium/configs/status';
import {
  api,
  closeDb,
  getPostRow,
  setUserRole,
  signUpUser,
  truncateForum,
  truncateUsers,
  type TestUser,
} from './setup/test-helpers';

const PASSWORD = 'Str0ng@Passw0rd';

describe('Forum posts (e2e)', () => {
  let author: TestUser;
  let otherStudent: TestUser;
  let admin: TestUser;
  let superadmin: TestUser;

  const createPost = (user: TestUser, body: object) =>
    api().post('/api/posts').set('Cookie', user.cookie).send(body);

  beforeAll(async () => {
    await truncateUsers();

    author = await signUpUser({
      email: 'author@posts.test',
      password: PASSWORD,
      name: 'Ada Author',
    });
    otherStudent = await signUpUser({
      email: 'other@posts.test',
      password: PASSWORD,
      name: 'Otto Other',
    });
    admin = await signUpUser({
      email: 'admin@posts.test',
      password: PASSWORD,
      name: 'Amy Admin',
    });
    superadmin = await signUpUser({
      email: 'superadmin@posts.test',
      password: PASSWORD,
      name: 'Sam Superadmin',
    });

    await setUserRole(admin.userId, RolesConfig.ADMIN);
    await setUserRole(superadmin.userId, RolesConfig.SUPERADMIN);
  });

  beforeEach(async () => {
    await truncateForum();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('POST /api/posts', () => {
    it('creates a post as a student and returns the standard envelope', async () => {
      const res = await createPost(author, {
        title: 'How do I claim CCA points?',
        content: 'Asking for a friend.',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: 'success',
        message: 'Post created successfully',
      });
      expect(res.body.data.title).toBe('How do I claim CCA points?');
      expect(res.body.data.createdBy).toBe(author.userId);
      expect(res.body.data.statusId).toBe(StatusConfig.ACTIVE);
    });

    it('rejects an unauthenticated request', async () => {
      const res = await api()
        .post('/api/posts')
        .send({ title: 'No session', content: 'Nope' });

      expect(res.status).toBe(401);
    });

    it.each([
      ['an empty title', { title: '', content: 'body' }],
      ['a missing title', { content: 'body' }],
      ['an empty body', { title: 'title', content: '' }],
      ['an over-long title', { title: 'x'.repeat(151), content: 'body' }],
    ])('rejects %s with 400', async (_label, body) => {
      const res = await createPost(author, body);
      expect(res.status).toBe(400);
    });

    it('ignores a client-supplied createdBy', async () => {
      const res = await createPost(author, {
        title: 'Spoof attempt',
        content: 'Trying to post as someone else',
        createdBy: otherStudent.userId,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.createdBy).toBe(author.userId);
    });
  });

  describe('GET /api/posts', () => {
    it('paginates and reports totals', async () => {
      for (let i = 0; i < 15; i++) {
        await createPost(author, {
          title: `Question ${i}`,
          content: 'body',
        });
      }

      const first = await api()
        .get('/api/posts?page=1&pageSize=10')
        .set('Cookie', author.cookie);

      expect(first.status).toBe(200);
      expect(first.body.data.total).toBe(15);
      expect(first.body.data.pageCount).toBe(2);
      expect(first.body.data.posts).toHaveLength(10);

      const second = await api()
        .get('/api/posts?page=2&pageSize=10')
        .set('Cookie', author.cookie);

      expect(second.body.data.posts).toHaveLength(5);
    });

    it('searches on title case-insensitively', async () => {
      await createPost(author, { title: 'Timetable clash', content: 'help' });
      await createPost(author, { title: 'Locker keys', content: 'help' });

      const res = await api()
        .get('/api/posts?search=TIMETABLE')
        .set('Cookie', author.cookie);

      expect(res.body.data.total).toBe(1);
      expect(res.body.data.posts[0].title).toBe('Timetable clash');
    });

    it('embeds the creator on each post', async () => {
      await createPost(author, { title: 'With creator', content: 'body' });

      const res = await api().get('/api/posts').set('Cookie', author.cookie);

      expect(res.body.data.posts[0].creator).toMatchObject({
        id: author.userId,
        name: 'Ada Author',
      });
    });

    it('is readable without signing in', async () => {
      await createPost(author, { title: 'Open to all', content: 'body' });

      const res = await api().get('/api/posts');

      expect(res.status).toBe(200);
      expect(res.body.data.posts).toHaveLength(1);
      expect(res.body.data.posts[0].likedByMe).toBe(false);
    });

    it('carries like and comment counts on each row', async () => {
      const created = await createPost(author, {
        title: 'Counted',
        content: 'body',
      });
      const postId = created.body.data.postId as string;

      await api()
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', otherStudent.cookie);
      await api()
        .post('/api/comments')
        .set('Cookie', otherStudent.cookie)
        .send({ postId, text: 'nice' });

      const res = await api().get('/api/posts').set('Cookie', author.cookie);

      expect(res.body.data.posts[0]).toMatchObject({
        likeCount: 1,
        commentCount: 1,
        // The author has not liked their own post.
        likedByMe: false,
      });
    });

    it('orders by likes under sortBy=top, and falls back to newest for an unknown sort', async () => {
      const quiet = await createPost(author, {
        title: 'Quiet',
        content: 'body',
      });
      const popular = await createPost(author, {
        title: 'Popular',
        content: 'body',
      });

      await api()
        .post(`/api/posts/${popular.body.data.postId}/like`)
        .set('Cookie', otherStudent.cookie);
      await api()
        .post(`/api/posts/${popular.body.data.postId}/like`)
        .set('Cookie', admin.cookie);

      const top = await api()
        .get('/api/posts?sortBy=top')
        .set('Cookie', author.cookie);
      expect(top.body.data.posts.map((post: any) => post.title)).toEqual([
        'Popular',
        'Quiet',
      ]);

      const hot = await api()
        .get('/api/posts?sortBy=hot')
        .set('Cookie', author.cookie);
      expect(hot.status).toBe(200);
      expect(hot.body.data.posts).toHaveLength(2);

      // An unrecognised sort must not reach the query builder; it falls back
      // to newest first, which is the post created last.
      const nonsense = await api()
        .get('/api/posts?sortBy=drop-table')
        .set('Cookie', author.cookie);
      expect(nonsense.status).toBe(200);
      expect(nonsense.body.data.posts.map((post: any) => post.title)).toEqual([
        'Popular',
        'Quiet',
      ]);
      expect(quiet.status).toBe(201);
    });
  });

  describe('GET /api/posts/:postId', () => {
    it('returns 400 for a malformed id and 404 for an unknown one', async () => {
      const malformed = await api()
        .get('/api/posts/not-a-uuid')
        .set('Cookie', author.cookie);
      expect(malformed.status).toBe(400);

      const unknown = await api()
        .get(`/api/posts/${randomUUID()}`)
        .set('Cookie', author.cookie);
      expect(unknown.status).toBe(404);
    });

    it('does not embed comments, and reports aggregates instead', async () => {
      const created = await createPost(author, {
        title: 'Lonely post',
        content: 'body',
      });

      const res = await api()
        .get(`/api/posts/${created.body.data.postId}`)
        .set('Cookie', author.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.comments).toBeUndefined();
      expect(res.body.data.likeCount).toBe(0);
      expect(res.body.data.commentCount).toBe(0);
      expect(res.body.data.likedByMe).toBe(false);
    });

    it('is readable without signing in', async () => {
      const created = await createPost(author, {
        title: 'Shared link',
        content: 'body',
      });

      const res = await api().get(`/api/posts/${created.body.data.postId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Shared link');
      expect(res.body.data.likedByMe).toBe(false);
    });
  });

  describe('PUT /api/posts/:postId', () => {
    it('lets the author edit their own post', async () => {
      const created = await createPost(author, {
        title: 'Original',
        content: 'body',
      });

      const res = await api()
        .put(`/api/posts/${created.body.data.postId}`)
        .set('Cookie', author.cookie)
        .send({ title: 'Edited' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Edited');
    });

    it('forbids another student from editing it', async () => {
      const created = await createPost(author, {
        title: 'Mine',
        content: 'body',
      });

      const res = await api()
        .put(`/api/posts/${created.body.data.postId}`)
        .set('Cookie', otherStudent.cookie)
        .send({ title: 'Hijacked' });

      expect(res.status).toBe(403);
    });

    it('forbids an admin from rewriting a student post', async () => {
      const created = await createPost(author, {
        title: 'Mine',
        content: 'body',
      });

      const res = await api()
        .put(`/api/posts/${created.body.data.postId}`)
        .set('Cookie', admin.cookie)
        .send({ title: 'Moderated text' });

      expect(res.status).toBe(403);
    });

    it('rejects an empty update body', async () => {
      const created = await createPost(author, {
        title: 'Mine',
        content: 'body',
      });

      const res = await api()
        .put(`/api/posts/${created.body.data.postId}`)
        .set('Cookie', author.cookie)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:postId', () => {
    it('soft deletes: the row survives with a DELETED status and drops out of reads', async () => {
      const created = await createPost(author, {
        title: 'To be removed',
        content: 'body',
      });
      const postId = created.body.data.postId;

      const res = await api()
        .delete(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);
      expect(res.status).toBe(200);

      const row = await getPostRow(postId);
      expect(row).toBeDefined();
      expect(row.status_id).toBe(StatusConfig.DELETED);

      const fetched = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);
      expect(fetched.status).toBe(404);

      const list = await api().get('/api/posts').set('Cookie', author.cookie);
      expect(list.body.data.total).toBe(0);
    });

    it('forbids another student but allows an admin to moderate', async () => {
      const first = await createPost(author, { title: 'A', content: 'body' });
      const forbidden = await api()
        .delete(`/api/posts/${first.body.data.postId}`)
        .set('Cookie', otherStudent.cookie);
      expect(forbidden.status).toBe(403);

      const second = await createPost(author, { title: 'B', content: 'body' });
      const moderated = await api()
        .delete(`/api/posts/${second.body.data.postId}`)
        .set('Cookie', admin.cookie);
      expect(moderated.status).toBe(200);
    });
  });

  describe('restore and hard delete', () => {
    it('restores a soft-deleted post as admin but not as a student', async () => {
      const created = await createPost(author, {
        title: 'Restore me',
        content: 'body',
      });
      const postId = created.body.data.postId;

      await api().delete(`/api/posts/${postId}`).set('Cookie', author.cookie);

      const asStudent = await api()
        .post(`/api/posts/${postId}/restore`)
        .set('Cookie', author.cookie);
      expect(asStudent.status).toBe(403);

      const asAdmin = await api()
        .post(`/api/posts/${postId}/restore`)
        .set('Cookie', admin.cookie);
      expect(asAdmin.status).toBe(200);

      const fetched = await api()
        .get(`/api/posts/${postId}`)
        .set('Cookie', author.cookie);
      expect(fetched.status).toBe(200);
    });

    it('hard deletes only as superadmin', async () => {
      const created = await createPost(author, {
        title: 'Gone for good',
        content: 'body',
      });
      const postId = created.body.data.postId;

      const asStudent = await api()
        .delete(`/api/posts/${postId}/hard`)
        .set('Cookie', author.cookie);
      expect(asStudent.status).toBe(403);

      const asAdmin = await api()
        .delete(`/api/posts/${postId}/hard`)
        .set('Cookie', admin.cookie);
      expect(asAdmin.status).toBe(403);

      const asSuperadmin = await api()
        .delete(`/api/posts/${postId}/hard`)
        .set('Cookie', superadmin.cookie);
      expect(asSuperadmin.status).toBe(200);

      expect(await getPostRow(postId)).toBeUndefined();
    });
  });
});
