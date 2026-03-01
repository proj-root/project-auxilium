// import { defineRelations } from 'drizzle-orm';

import { relations } from 'drizzle-orm';
import * as schema from './schema';

// TODO: Upgrade to V2 when the bug with ./_relations is fixed
// export const relations = defineRelations(schema, (relation) => ({
//   user: {
//     userProfile: relation.one.userProfile(),
//   },
//   userProfile: {
//     user: relation.one.user({
//       from: relation.userProfile.profileId,
//       to: relation.user.profileId,
//     }),
//   },
//   event: {
//     eventType: relation.one.eventType(),
//     creator: relation.one.user({
//       from: relation.event.createdBy,
//       to: relation.user.userId,
//     }),
//   },
//   eventType: {
//     events: relation.many.event({
//       from: relation.eventType.eventTypeId,
//       to: relation.event.eventTypeId,
//     }),
//   }
// }));

export const userRelations = relations(schema.user, ({ one }) => ({
  userProfile: one(schema.userProfile, {
    fields: [schema.user.profileId],
    references: [schema.userProfile.profileId],
  }),
  userRole: one(schema.userRole, {
    fields: [schema.user.userId],
    references: [schema.userRole.userId],
  }),
}));

export const userRoleRelations = relations(schema.userRole, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.userRole.userId],
    references: [schema.user.userId],
  }),
  role: one(schema.role, {
    fields: [schema.userRole.roleId],
    references: [schema.role.roleId],
  }),
}));

export const roleRelations = relations(schema.role, ({ many }) => ({
  userRoles: many(schema.userRole),
}));

export const userProfileRelations = relations(
  schema.userProfile,
  ({ one, many }) => ({
    user: one(schema.user, {
      fields: [schema.userProfile.profileId],
      references: [schema.user.profileId],
    }),

    eventParticipations: many(schema.eventParticipation),

    course: one(schema.course, {
      fields: [schema.userProfile.course],
      references: [schema.course.code],
    }),
  }),
);

export const eventRelations = relations(schema.event, ({ one, many }) => ({
  eventType: one(schema.eventType, {
    fields: [schema.event.eventTypeId],
    references: [schema.eventType.eventTypeId],
  }),
  eventReports: many(schema.eventReport),
  creator: one(schema.user, {
    fields: [schema.event.createdBy],
    references: [schema.user.userId],
  }),
}));

export const eventTypeRelations = relations(schema.eventType, ({ many }) => ({
  events: many(schema.event),
}));

export const eventReportRelations = relations(
  schema.eventReport,
  ({ one, many }) => ({
    event: one(schema.event, {
      fields: [schema.eventReport.eventId],
      references: [schema.event.eventId],
    }),

    eventParticipations: many(schema.eventParticipation),
    
    creator: one(schema.user, {
      fields: [schema.eventReport.createdBy],
      references: [schema.user.userId],
    }),
  }),
);

export const eventParticipationRelations = relations(
  schema.eventParticipation,
  ({ one }) => ({
    eventReport: one(schema.eventReport, {
      fields: [schema.eventParticipation.eventReportId],
      references: [schema.eventReport.eventReportId],
    }),
    userProfile: one(schema.userProfile, {
      fields: [schema.eventParticipation.profileId],
      references: [schema.userProfile.profileId],
    }),
  }),
);
