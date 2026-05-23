import Stripe from 'stripe'

declare global {
  // eslint-disable-next-line no-var
  var _stripe: Stripe | undefined
}

// Lazy proxy — defers new Stripe() until first use so the module can be
// imported at build time without STRIPE_SECRET_KEY being present.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    if (!globalThis._stripe) {
      globalThis._stripe = new Stripe(
        process.env.STRIPE_SECRET_KEY!,
        { apiVersion: '2026-04-22.dahlia' }
      )
    }
    return Reflect.get(globalThis._stripe, prop)
  },
})
