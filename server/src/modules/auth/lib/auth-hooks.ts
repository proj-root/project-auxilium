// This file contains hooks for BetterAuth
import db from '@/db';
import * as schema from '@/db/schema';
import { MailConfig, MailService } from '@/modules/mail/mail.service';
// import { catchAsync } from '@/lib/catch-async';
// import { logger } from '@/lib/logger';
// TODO: Figure out a way to use NestJS logger for things outside modules

import { RolesConfig } from '@auxilium/configs/roles';
import { APIError } from '@auxilium/types/errors';
import { MiddlewareContext, MiddlewareOptions } from 'better-auth';
import { createTransport, Transporter } from 'nodemailer';

export const setupUserDetails = async (
  ctx: MiddlewareContext<MiddlewareOptions, object>,
) => {
  console.log('Auth Body:', ctx.body);
  const newSession: { user: { id: string } } = ctx.context.newSession || null;

  if (!newSession) throw new APIError('No session found after sign-up', 500);

  const newUserId = newSession.user.id;

  await db.transaction(async (tx) => {
    await tx.insert(schema.userRole).values({
      userId: newUserId,
      roleId: RolesConfig.USER, // Default user
    });
  });
};

// Enrich session user details with profile and roles
export const enrichSessionUserDetails = async (userId: string) => {
  // Fetch user role(s)
  const userRole = await db.query.userRole.findFirst({
    where: {
      userId,
    },
    with: {
      role: true,
    },
  });

  return {
    roleId: userRole?.roleId,
    role: userRole?.role?.name,
  };
};

export const sendResetPassword = async ({user, url, token}, request) => {
  const transporter: Transporter = createTransport(MailConfig);

  await transporter.sendMail({
    from: `"The GARDEN Terminal" <${MailConfig.auth.user}>`,
    to: user.email,
    subject: "Reset your password",
    html:`
    <p>Dear ${user.name},</p>
    <p>We have received a request to reset your account's password.</p>
    <p>If this wasn't you, please ignore this email.</p>
    <p>Please use <a href='${process.env.CLIENT_URL}/auth/reset-password?token=${token}' target='_blank'>this link</a> to reset your password.</p>
    <p>
      Best Regards, <br/>
      The GARDEN Team
    </p>
    `
  });
}