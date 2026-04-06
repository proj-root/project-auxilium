import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from '@/db';
import { createAuthMiddleware } from "better-auth/api";
import { setupUserDetails } from "@/features/auth/lib/auth-hooks";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";

const isDevEnv = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;

export const auth = betterAuth({
  // DATA
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // CREDENTIALS
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  },

  // HOOKS & MIDDLEWARE
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        await setupUserDetails(ctx);
      }
    }),
  },

  // EXTRA CONFIGS
  advanced: {
    disableOriginCheck: isDevEnv, // Disabled in dev for Postman
    database: {
      generateId: 'uuid'
    }
  },

  // PLUGINS
  plugins: [
    testUtils()
  ],
});

// --- Helpers --- //
// Auth context
export const getAuthContext = async () => await auth.$context;
