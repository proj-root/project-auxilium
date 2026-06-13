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
    // userDepartments: r.many.userDepartment({
    //   from: r.user.id,
    //   to: r.userDepartment.userId,
    // }),
    departments: r.many.department({
      from: r.user.id.through(r.userDepartment.userId),
      to: r.department.departmentId.through(r.userDepartment.departmentId),
    }),
    eventRoles: r.many.eventRole({
      from: r.user.id.through(r.userEventRole.userId),
      to: r.eventRole.eventRoleId.through(r.userEventRole.eventRoleId),
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
  userDepartment: {
    user: r.one.user({
      from: r.userDepartment.userId,
      to: r.user.id,
    }),
    department: r.one.department({
      from: r.userDepartment.departmentId,
      to: r.department.departmentId,
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
    userEventRoles: r.many.userEventRole({
      from: r.event.eventId,
      to: r.userEventRole.eventId,
    }),
    eventReport: r.one.eventReport({
      from: r.event.eventId,
      to: r.eventReport.eventId,
    }),
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
  userEventRole: {
    event: r.one.event({
      from: r.userEventRole.eventId,
      to: r.event.eventId,
    }),
    user: r.one.user({
      from: r.userEventRole.userId,
      to: r.user.id,
    }),
    eventRole: r.one.eventRole({
      from: r.userEventRole.eventRoleId,
      to: r.eventRole.eventRoleId,
    }),
  },
  eventType: {
    events: r.many.event(),
  },
  eventRole: {
    eventParticipations: r.many.eventParticipation(),
    userEventRoles: r.many.userEventRole(),
  },
  course: {
    userProfiles: r.many.userProfile(),
  },
  department: {
    userDepartments: r.many.userDepartment(),
  }
}));