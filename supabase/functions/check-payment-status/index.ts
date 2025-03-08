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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get session ID from request
    const { sessionId } = await req.json()
    if (!sessionId) throw new Error('Session ID is required')

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session) throw new Error('Session not found')

    // If payment successful, register for challenge
    if (session.payment_status === 'paid') {
      const { error: registrationError } = await supabase
        .from('premium_challenge_registrations')
        .insert({
          premium_challenge_id: session.metadata?.challengeId,
          user_id: session.metadata?.userId,
          payment_status: 'paid',
          stripe_payment_id: session.payment_intent as string,
          paid_at: new Date().toISOString()
        })

      if (registrationError) throw registrationError
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentStatus: session.payment_status
      }),
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