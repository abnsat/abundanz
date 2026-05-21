import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Call this once per server context (Next.js API route, server component)
export function createDb(connectionString: string) {
  const client = postgres(connectionString, { prepare: false })
  return drizzle(client, { schema })
}

export * from './schema'
