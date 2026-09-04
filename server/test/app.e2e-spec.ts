import { api } from './setup/test-helpers';

// Canary: proves the harness brought a real server up before any forum spec
// runs. `/api/health` is the only @AllowAnonymous route, so it also confirms
// that anonymous access is permitted where it should be.
describe('AppController (e2e)', () => {
  it('GET /api/health reports success without a session', async () => {
    const res = await api().get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'All systems operational.',
    });
  });

  it('GET / is not a route', async () => {
    const res = await api().get('/');
    expect(res.status).toBe(404);
  });
});
