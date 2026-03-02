import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let plan: string
  try {
    const body = await request.json()
    plan = body.plan
  } catch {
    const formData = await request.formData()
    plan = formData.get('plan') as string
  }

  if (!plan || !(plan in PLANS) || plan === 'free') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const stripe = getStripe()
  const planConfig = PLANS[plan as keyof typeof PLANS]

  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || profile?.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?upgraded=true`,
    cancel_url: `${appUrl}/dashboard/settings`,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.redirect(session.url!, 303)
}
