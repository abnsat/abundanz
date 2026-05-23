import Stripe from 'stripe'

declare global {
  // eslint-disable-next-line no-var
  var _stripe: Stripe | undefined
}

export const stripe = globalThis._stripe ?? (globalThis._stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  { apiVersion: '2026-04-22.dahlia' }
))
