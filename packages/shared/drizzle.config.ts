import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const dbUrl = new URL(process.env.DATABASE_URL!)
const isLocal = dbUrl.hostname === '127.0.0.1' || dbUrl.hostname === 'localhost'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1).split('?')[0],
    ssl: isLocal ? false : { rejectUnauthorized: false },
  },
})
