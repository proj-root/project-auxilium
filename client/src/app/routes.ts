import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),

  ...prefix('', [
    layout('routes/layout.tsx', [
      route('*', 'routes/not-found.tsx'),
      route('/unauthorized', 'routes/unauthorized.tsx'),
      route('/about', 'routes/about.tsx'),
      route('/link-profile', 'routes/link-profile.tsx'),
      route('/settings', 'routes/settings.tsx'),
    ]),
  ]),

  ...prefix('admin', [
    layout('routes/admin/layout.tsx', [
      // Admin Dashboard
      index('routes/admin/index.tsx'),
      // Events Pages
      ...prefix('events', [
        index('routes/admin/events/index.tsx'),
        route('/create', 'routes/admin/events/create.tsx'),
        route('/:eventId', 'routes/admin/events/single-event.tsx'),
      ]),
      // User Management Pages
      ...prefix('users', [
        index('routes/admin/users/index.tsx'),
        route('/:userProfileId', 'routes/admin/users/single-user.tsx'),
      ]),
    ]),
  ]),

  ...prefix('auth', [
    layout('routes/auth/layout.tsx', [
      route('/login', 'routes/auth/login.tsx'),
      route('/register', 'routes/auth/register.tsx'),
    ]),
    route('/reset-password', 'routes/auth/reset-password.tsx'),
  ]),
] satisfies RouteConfig;
