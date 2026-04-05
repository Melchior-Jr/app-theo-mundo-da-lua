import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { setVapidDetails, sendNotification } from "npm:webpush-webcrypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Lida com a requisição de pré-visualização do navegador (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const pubKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const privKey = Deno.env.get('VAPID_PRIVATE_KEY')

    if (!supabaseUrl || !supabaseKey || !pubKey || !privKey) {
      throw new Error(`Variáveis de ambiente ausentes. URL:${!!supabaseUrl}, KEY:${!!supabaseKey}, PUB:${!!pubKey}, PRIV:${!!privKey}`)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Configura as chaves mágicas que acabamos de salvar no Secret 🚀
    setVapidDetails(
      'mailto:alerta@theonomundodalua.com', 
      pubKey, 
      privKey
    )

    // Recebendo as ordens da base!
    const { userId, category, payload } = await req.json()

    // 1. O usuário ativou essa categoria ("trophys", "retention", etc)?
    const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (!settings || !settings.categories[category]) {
        return new Response(JSON.stringify({ msg: 'Astronauta mutou essa categoria.' }), { headers: corsHeaders })
    }

    // 2. Procurar quais computadores/celulares o astronauta cadastrou
    const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

    // [DEBUG] Verifica total de assinaturas no banco inteiro pra ver se a tabela ta vazia
    const { count: totalSubs } = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })

    if (!subs || subs.length === 0) {
        return new Response(JSON.stringify({ 
           msg: 'Nenhum comunicador ativo.',
           detalhes_erro: `Zero naves para ${userId}. Total no BD inteiro: ${totalSubs}`
        }), { headers: corsHeaders })
    }

    // 3. Enviar o sinal estelar! ✨
    let sentCount = 0;
    let pushErrorDetails = ''
    for (const sub of subs) {
        try {
            await sendNotification({
              endpoint: sub.endpoint,
              keys: { auth: sub.auth, p256dh: sub.p256dh }
            }, JSON.stringify(payload));
            sentCount++;
        } catch (e) {
            console.error('Nave desconectada. Falha ao enviar:', e)
            pushErrorDetails = `String: ${String(e)} | JSON: ${JSON.stringify(e)}`
        }
    }

    // 4. Salvar log
    if (sentCount > 0) {
        await supabase.from('notification_push_logs').insert({ user_id: userId, category })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      transmissores_alcancados: sentCount,
      detalhes_erro: pushErrorDetails 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error("🔥 FALHA CRÍTICA NO MOTOR DE PUSH:", error)
    return new Response(JSON.stringify({ error: error.message || 'Erro desconhecido' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
    })
  }
})
