import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to start the API.');
}

// Supabase (and most hosted Postgres) only accepts encrypted connections.
// A local Postgres usually has SSL turned off, so skip it for localhost.
const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString);

const pool = new Pool({
  connectionString,
  // Keep this small for a single API instance. Supabase's session pooler
  // has its own client limit, so don't set this much higher than 10.
  max: Number(process.env.DATABASE_MAX_CLIENTS ?? 10),
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;