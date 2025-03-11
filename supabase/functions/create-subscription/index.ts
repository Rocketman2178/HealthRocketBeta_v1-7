import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // HANDLE CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // GET THE AUTHERIZATION HEADER FROM THE REQUEST
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError || !user) throw new Error('Invalid user')

    // Get the price ID from the request
    const { priceId ,trialDays,  promoCode} = await req.json()
    if (!priceId) throw new Error('Price ID is required')

    // Get or create Stripe customer
    const { data: customers, error: customerError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = customers?.stripe_customer_id

    if (!customerId) {
      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', user.id)
        .single()

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        metadata: {
          supabaseUUID: user.id,
        },
      })

      customerId = customer.id
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_method_collection: 'if_required',
      ...(promoCode && {allow_promotion_codes: true}),
      mode: 'subscription',
      ...(trialDays > 0 && { subscription_data: { trial_period_days: trialDays } }),
      success_url: `${req.headers.get('origin')}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/settings`,
    })

    return new Response(
      JSON.stringify({ sessionId: session.id ,sessionUrl:session.url}),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})