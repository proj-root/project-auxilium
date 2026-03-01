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
}))

export const userProfileRelations = relations(schema.userProfile, ({ one }) => ({
  user: one(schema.user, {
    fields: [schema.userProfile.profileId],
    references: [schema.user.profileId],
  }),
}));

export const eventRelations = relations(schema.event, ({ one }) => ({
  eventType: one(schema.eventType, {
    fields: [schema.event.eventTypeId],
    references: [schema.eventType.eventTypeId],
  }),
  creator: one(schema.user, {
    fields: [schema.event.createdBy],
    references: [schema.user.userId],
  }),
}));

export const eventTypeRelations = relations(schema.eventType, ({ many }) => ({
  events: many(schema.event),
}));