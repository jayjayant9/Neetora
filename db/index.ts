import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/neetora';

// Client for queries
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
