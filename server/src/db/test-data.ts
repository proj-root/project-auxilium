import { Roles } from '@auxilium/configs/roles'
import { StatusConfig } from '@auxilium/configs/status';

export const testUsers = [
  {
    email: 'admin@gmail.com',
    password: 'Admin@123',
    firstName: 'Wolfyre',
    lastName: 'Blue',
    course: 'DIT',
    ichat: 'wolfyre@ichat.sp.edu.sg',
    adminNumber: '2429634',
    role: Roles.SUPERADMIN,
  },
  {
    email: 'admin2@gmail.com',
    password: 'Admin@123',
    firstName: 'John',
    lastName: 'Doe',
    course: 'DAAA',
    ichat: 'johndoe@ichat.sp.edu.sg',
    adminNumber: '2429635',
    role: Roles.ADMIN,
  },
  {
    email: 'user@gmail.com',
    password: 'User@123',
    firstName: 'Regular',
    lastName: 'User',
    course: 'DCDF',
    ichat: 'regularuser@ichat.sp.edu.sg',
    adminNumber: '2429636',
    role: Roles.USER,
  },
];

export const testStatuses = Object.keys(StatusConfig).map((key) => ({
  // @ts-ignore
  statusId: StatusConfig[key],
  name: key,
}));

export const testRoles = Object.keys(Roles).map((key) => ({
  // @ts-ignore
  roleId: Roles[key],
  name: key,
}));

export const testCourses = [
  { code: 'DIT', name: 'Diploma in Information Technology' },
  { code: 'DCS', name: 'Diploma in Computer Science' },
  { code: 'DAAA', name: 'Diploma in Applied Artificial Intelligence' },
  { code: 'DCDF', name: 'Diploma in Cybersecurity & Digital Forensics' },
];

export const testEventTypes = [
  { eventTypeId: 1, name: 'Workshop' },
  { eventTypeId: 2, name: 'Community Service' },
  { eventTypeId: 3, name: 'Hackathon' },
];