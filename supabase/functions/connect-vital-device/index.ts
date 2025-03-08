import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    const response = await fetch("https://api.sandbox.tryvital.io/v2/link/token", {
      method: "POST",
      headers: {
        "x-vital-api-key": `${Deno.env.get("VITAL_API_KEY")}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.vital_user_id,
        provider
      })
    });

    const link = await response.json();
    if(!response.ok){
    return new Response(
      JSON.stringify({ 
        success: false,
        error: link,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
    }
   
    // Store device connection
    const { error: deviceError } = await supabase
      .from('user_devices')
      .insert({
        user_id,
        vital_user_id: user.vital_user_id,
        provider,
        status: 'pending',
        metadata: {
          link_token: link.link_token
        }
      })

    if (deviceError) throw deviceError

    return new Response(
      JSON.stringify({ 
        success: true,
        link: link,
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