import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription

      if (userId && plan) {
        await supabase
          .from('profiles')
          .update({
            plan,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any
      const customerId = subscription.customer

      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any
      const customerId = subscription.customer
      const status = subscription.status

      if (status === 'active') {
        // Plan already set on checkout.session.completed
      } else if (['canceled', 'unpaid', 'past_due'].includes(status)) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
