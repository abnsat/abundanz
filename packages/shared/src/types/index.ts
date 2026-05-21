import type { InferSelectModel } from 'drizzle-orm'
import type { users, videos, subscriptions } from '../db/schema'

export type User = InferSelectModel<typeof users>
export type Video = InferSelectModel<typeof videos>
export type Subscription = InferSelectModel<typeof subscriptions>

export type UserRole = 'user' | 'admin'
export type SubscriptionSource = 'stripe' | 'apple' | 'google'
