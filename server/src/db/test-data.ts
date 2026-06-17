import { RolesConfig } from '@auxilium/configs/roles';
import { StatusConfig } from '@auxilium/configs/status';

export const testUsers = [
  {
    email: 'admin@gmail.com',
    password: 'Admin@123',
    firstName: 'Wolfyre',
    lastName: 'Blueflare',
    course: 'DIT',
    ichat: 'wolfyre@ichat.sp.edu.sg',
    studentClass: 'DIT/FT/2B/01',
    adminNumber: '2429634',
    role: RolesConfig.SUPERADMIN,
  },
  {
    email: 'admin2@gmail.com',
    password: 'Admin@123',
    firstName: 'John',
    lastName: 'Doe',
    course: 'DAAA',
    ichat: 'johndoe@ichat.sp.edu.sg',
    studentClass: 'DAAA/FT/2B/02',
    adminNumber: '2429635',
    role: RolesConfig.ADMIN,
  },
  {
    email: 'user@gmail.com',
    password: 'User@123',
    firstName: 'Regular',
    lastName: 'User',
    course: 'DCDF',
    ichat: 'regularuser@ichat.sp.edu.sg',
    studentClass: 'DCDF/FT/2B/03',
    adminNumber: '2429636',
    role: RolesConfig.USER,
  },
];

export const testStatuses = Object.keys(StatusConfig).map((key) => ({
  // @ts-ignore
  statusId: StatusConfig[key],
  name: key,
}));

export const testRoles = Object.keys(RolesConfig).map((key) => ({
  // @ts-ignore
  roleId: RolesConfig[key],
  name: key,
}));

export const testCourses = [
  { code: 'DIT', name: 'Diploma in Information Technology' },
  { code: 'DISM', name: 'Diploma in Information Security Management' },
  { code: 'DCS', name: 'Diploma in Computer Science' },
  { code: 'DAAA', name: 'Diploma in Applied Artificial Intelligence' },
  { code: 'DCDF', name: 'Diploma in Cybersecurity & Digital Forensics' },
  { code: 'DCITP', name: 'Common ICT Programme' },
];

export const testEventTypes = [
  { eventTypeId: 1, name: 'Workshop' },
  { eventTypeId: 2, name: 'Community Service' },
  { eventTypeId: 3, name: 'Hackathon' },
];

export const testEventRoles: {
  eventRoleId: number;
  name: string;
  pointsType: 'PARTICIPATION' | 'LEADERSHIP' | 'SERVICE' | 'COMMUNITY SERVICE';
  pointsAwarded: number;
}[] = [
  {
    eventRoleId: 1,
    name: 'Participant',
    pointsType: 'PARTICIPATION',
    pointsAwarded: 1,
  },
  {
    eventRoleId: 2,
    name: 'Coordinator',
    pointsType: 'LEADERSHIP',
    pointsAwarded: 2,
  },
  { eventRoleId: 3, name: 'Mentor', pointsType: 'SERVICE', pointsAwarded: 1 },
  {
    eventRoleId: 4,
    name: 'Facilitator',
    pointsType: 'SERVICE',
    pointsAwarded: 1,
  },
  {
    eventRoleId: 5,
    name: 'Poster Maker',
    pointsType: 'SERVICE',
    pointsAwarded: 1,
  },
  {
    eventRoleId: 6,
    name: 'Email Writer',
    pointsType: 'SERVICE',
    pointsAwarded: 1,
  },
  {
    eventRoleId: 7,
    name: 'Form Maker',
    pointsType: 'SERVICE',
    pointsAwarded: 1,
  },
  {
    eventRoleId: 8,
    name: 'Volunteer',
    pointsType: 'COMMUNITY SERVICE',
    pointsAwarded: 2,
  },
];

export const departments: {
  departmentId: number;
  name: string;
}[] = [
  {
    departmentId: 1,
    name: 'Events',
  },
  {
    departmentId: 2,
    name: 'Admin',
  },
  {
    departmentId: 3,
    name: 'Publicity',
  }
]