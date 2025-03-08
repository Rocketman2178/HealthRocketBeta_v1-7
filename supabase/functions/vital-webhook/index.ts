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

    const { event, user_id, data } = await req.json()

    // Handle different webhook events
    switch (event) {
      case 'user.data.received': {
        // Process new health data
        const { data: metrics, error: metricsError } = await supabase
          .from('health_metrics')
          .insert({
            user_id,
            ...data,
            source: 'vital'
          })

        if (metricsError) throw metricsError
        break
      }

      case 'user.connected': {
        // Update device connection status
        const { error: deviceError } = await supabase
          .from('user_devices')
          .update({ 
            status: 'active',
            last_sync_at: new Date().toISOString()
          })
          .eq('vital_user_id', data.vital_user_id)

        if (deviceError) throw deviceError
        break
      }

      // Add more event handlers as needed
    }

    return new Response(
      JSON.stringify({ success: true }),
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