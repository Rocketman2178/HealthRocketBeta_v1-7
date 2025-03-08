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

    // Get user ID and provider from request
    const { user_id, provider } = await req.json()
    if (!user_id || !provider) {
      throw new Error('User ID and provider are required')
    }

    // Get Vital user ID
    const { data: user } = await supabase
      .from('users')
      .select('vital_user_id')
      .eq('id', user_id)
      .single()

    if (!user?.vital_user_id) {
      // Create Vital user if not exists
      const { data } = await supabase.functions.invoke('create-vital-user', {
        body: { user_id }
      })
      user.vital_user_id = data.vital_user_id
    }

    // Create connection link
    const link = await vitalClient.link.create({
      userId: user.vital_user_id,
      provider
    })

    // Store device connection
    const { error: deviceError } = await supabase
      .from('user_devices')
      .insert({
        user_id,
        vital_user_id: user.vital_user_id,
        provider,
        status: 'pending',
        metadata: {
          link_id: link.id
        }
      })

    if (deviceError) throw deviceError

    return new Response(
      JSON.stringify({ 
        success: true,
        link_token: link.link_token,
        vital_user_id: user.vital_user_id
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