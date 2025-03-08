import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { VitalClient } from 'https://esm.sh/@tryvital/vital-node@3.3.1'

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

    const vitalClient = new VitalClient({
      apiKey: Deno.env.get('VITAL_API_KEY')!,
      environment: 'sandbox'
    })

    // Get user ID from request
    const { user_id } = await req.json()
    if (!user_id) throw new Error('User ID is required')

    // Get user details from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user_id)
      .single()

    if (userError) throw userError

    // Create Vital user
    const vitalUser = await vitalClient.user.create({
      clientUserId: user_id,
      email: user.email
    })

    // Update user with Vital ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ vital_user_id: vitalUser.userId })
      .eq('id', user_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        vital_user_id: vitalUser.userId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})