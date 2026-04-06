import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from '@/db';
import { createAuthMiddleware } from "better-auth/api";
import { setupUserDetails } from "@/features/auth/lib/auth-hooks";
import { betterAuth } from "better-auth";

const isDevEnv = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        await setupUserDetails(ctx);
      }
    }),
  },

  advanced: {
    disableOriginCheck: isDevEnv, // Disabled in dev for Postman
    database: {
      generateId: 'uuid'
    }
  },
})