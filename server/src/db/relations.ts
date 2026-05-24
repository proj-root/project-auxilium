// import { defineRelations } from 'drizzle-orm';

import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  user: {
    userProfile: r.one.userProfile({
      from: r.user.id,
      to: r.userProfile.userId,
    }),
    userRole: r.one.userRole({
      from: r.user.id,
      to: r.userRole.userId,
    }),
    events: r.many.event(),
    sessions: r.many.session(),
    accounts: r.many.account(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  userProfile: {
    user: r.one.user({
      from: r.userProfile.userId,
      to: r.user.id,
    }),
    userCourse: r.one.course({
      from: r.userProfile.course,
      to: r.course.code,
    }),
  },
  userRole: {
    user: r.one.user({
      from: r.userRole.userId,
      to: r.user.id,
    }),
    role: r.one.role({
      from: r.userRole.roleId,
      to: r.role.roleId,
    }),
  },
  role: {
    userRoles: r.many.userRole(),
  },
  event: {
    eventType: r.one.eventType({
      from: r.event.eventTypeId,
      to: r.eventType.eventTypeId,
    }),
    creator: r.one.user({
      from: r.event.createdBy,
      to: r.user.id,
    }),
    eventReports: r.many.eventReport(),
  },
  eventParticipation: {
    eventReport: r.one.eventReport({
      from: r.eventParticipation.eventReportId,
      to: r.eventReport.eventReportId,
    }),
    userProfile: r.one.userProfile({
      from: r.eventParticipation.profileId,
      to: r.userProfile.profileId,
    }),
    eventRole: r.one.eventRole({
      from: r.eventParticipation.eventRoleId,
      to: r.eventRole.eventRoleId,
    }),
  },
  eventReport: {
    event: r.one.event({
      from: r.eventReport.eventId,
      to: r.event.eventId,
    }),
    creator: r.one.user({
      from: r.eventReport.createdBy,
      to: r.user.id,
    }),
    eventParticipations: r.many.eventParticipation()
  },
  eventType: {
    events: r.many.event(),
  },
  eventRole: {
    eventParticipations: r.many.eventParticipation(),
  },
  course: {
    userProfiles: r.many.userProfile(),
  },
}));