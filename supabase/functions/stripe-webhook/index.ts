import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (!session?.subscription) break

        // Get customer ID and subscription ID
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        
        // Update or create subscription record
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.metadata?.userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            plan_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
          })

        if (upsertError) throw upsertError

        // Update user's plan
        const { error: updateError } = await supabase
          .from('users')
          .update({ plan: 'Pro Plan' })
          .eq('id', session.metadata?.userId)

        if (updateError) throw updateError
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Get user ID from customer ID
        const { data: userData, error: userError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (userError) throw userError

        // Update subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) throw updateError

        // Update user's plan
        await supabase
          .from('users')
          .update({ 
            plan: subscription.status === 'active' ? 'Pro Plan' : 'Free Plan'
          })
          .eq('id', userData.user_id)

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    )
  }
})