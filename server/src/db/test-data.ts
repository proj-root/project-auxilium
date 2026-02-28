import { Roles } from '@auxilium/configs/roles'

export const testUsers = [
  {
    email: 'admin@gmail.com',
    password: 'Admin@123',
    firstName: 'Wolfyre',
    lastName: 'Blue',
    gender: 'Male',
    dob: new Date('1990-01-01'),
    role: Roles.SUPERADMIN,
  },
  {
    email: 'admin2@gmail.com',
    password: 'Admin@123',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    dob: new Date('1990-01-01'),
    role: Roles.ADMIN,
  },
  {
    email: 'user@gmail.com',
    password: 'User@123',
    firstName: 'Regular',
    lastName: 'User',
    gender: 'Male',
    dob: new Date('1990-01-01'),
    role: Roles.USER,
  },
]