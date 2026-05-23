import { createDb } from '@abundanz/shared/server'

declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof createDb> | undefined
}

// Singleton to avoid exhausting the connection pool on hot reloads in dev
export const db = globalThis._db ?? (globalThis._db = createDb(process.env.DATABASE_URL!))
