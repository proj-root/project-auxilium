import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// const db = drizzle(process.env.DATABASE_URL, {
//   schema: { ...schema, ...relations },
// });
const db = drizzle(process.env.DATABASE_URL!);

export default db;