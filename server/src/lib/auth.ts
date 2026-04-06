import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '@/db';
import { createAuthMiddleware } from 'better-auth/api';
import {
  enrichSessionUserDetails,
  setupUserDetails,
} from '@/features/auth/lib/auth-hooks';
import { betterAuth } from 'better-auth';
import { testUtils } from 'better-auth/plugins';

const isDevEnv = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;

export const auth = betterAuth({
  appName: process.env.APP_NAME || 'SEED GARDEN Terminal',
  // ALLOWLIST
  baseURL: process.env.AUTH_BASE_URL || 'http://localhost:5175',
  basePath: '/api/auth',
  trustedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    `http://localhost:${port}`,
  ],

  // DATA
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  // CREDENTIALS
  secret: process.env.AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // HOOKS & MIDDLEWARE
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-up')) {
        await setupUserDetails(ctx);
      }
      if (ctx.path.startsWith('/get-session') && ctx.context.session?.user) {
        const userId = ctx.context.session.user.id;
        const extra = await enrichSessionUserDetails(userId);
        // Merge extra fields into the user object
        return {
          session: ctx.context.session.session,
          user: {
            ...ctx.context.session.user,
            role: extra
          }
        };
      }
    }),
  },

  // EXTRA CONFIGS
  advanced: {
    disableOriginCheck: isDevEnv, // Disabled in dev for Postman
    database: {
      generateId: 'uuid',
    },
  },

  // PLUGINS
  plugins: [testUtils()],
});

// --- Helpers --- //
// Auth context
export const getAuthContext = async () => await auth.$context;
