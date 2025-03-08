import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
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

    // CREATE SUPABASE CLIENT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

   

    //GET USER ID FROM REQUEST
    const { user_id } = await req.json()
    if (!user_id) throw new Error('User ID is required')

    // GET USER DETAIL FROM SUPABASE 
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user_id)
      .single()

    if (userError) throw userError

    // CREATE VITAL USER 
    const response = await fetch("https://api.sandbox.tryvital.io/v2/user", {
      method: "POST",
      headers: {
        "x-vital-api-key": `${Deno.env.get("VITAL_API_KEY")}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_user_id: user_id,
        email:user?.email
      })
    });

    const vitalUser = await response.json();
    // CHECK IF THE RESPONSE IS OKAY
    if(!response.ok){

      return new Response(
        JSON.stringify({ 
          success: false,
          error: vitalUser
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )

    }
    
    // UPDATE USER WITH VITAL ID 
    const { error: updateError } = await supabase
      .from('users')
      .update({ vital_user_id: vitalUser.client_user_id })
      .eq('id', user_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        vitalUser: vitalUser
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