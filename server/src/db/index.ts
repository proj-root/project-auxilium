import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { relations } from './relations';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
  relations,
});

export default db;
