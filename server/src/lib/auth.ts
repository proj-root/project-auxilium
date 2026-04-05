import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from '@/db';

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

  advanced: {
    disableOriginCheck: isDevEnv, // Disabled in dev for Postman
    database: {
      generateId: 'uuid'
    }
  },
})