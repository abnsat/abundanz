import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Call this once per server context (Next.js API route, server component)
export function createDb(connectionString: string) {
  const host = new URL(connectionString).hostname
  const isLocal = host === '127.0.0.1' || host === 'localhost'
  const client = postgres(connectionString, {
    prepare: false,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })
  return drizzle(client, { schema })
}

export * from './schema'
