import { pgTable, pgEnum, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const subscriptionSourceEnum = pgEnum('subscription_source', ['stripe', 'apple', 'google'])

export const users = pgTable('users', {
  id: text('id').primaryKey(), // mirrors auth.users.id from Supabase
  email: text('email').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const videos = pgTable('videos', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  bunnyVideoId: text('bunny_video_id').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  previewUrl: text('preview_url'),
  durationSeconds: integer('duration_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(false).notNull(),
  source: subscriptionSourceEnum('source'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revenueCatCustomerId: text('revenue_cat_customer_id'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
