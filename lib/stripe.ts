import type Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stripeInstance: any = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const StripeLib = require('stripe')
    stripeInstance = new StripeLib(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-11-20.acacia',
    })
  }
  return stripeInstance as Stripe
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    pages: 1,
    components: 5,
    subscribers: 0,
    stripePriceId: null,
  },
  starter: {
    name: 'Starter',
    price: 9,
    pages: 3,
    components: -1,
    subscribers: 100,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
  },
  growth: {
    name: 'Growth',
    price: 29,
    pages: -1,
    components: -1,
    subscribers: -1,
    stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
  },
} as const

export type PlanKey = keyof typeof PLANS
