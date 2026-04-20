import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const PIXEL = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const pixelBytes = Uint8Array.from(atob(PIXEL), (c) => c.charCodeAt(0))

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const userAgent = req.headers.get('user-agent') || ''

    // Filtro para ignorar bots e proxies de segurança que abrem o e-mail instantaneamente
    const isBot =
      /bot|googleimageproxy|applemailpreview|bingpreview|yandex|yahoo|slurp|duckduckgo|proxy/i.test(
        userAgent,
      )

    if (token && !isBot) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: tracking } = await supabase
        .from('email_tracking')
        .select('*')
        .eq('token', token)
        .single()

      if (tracking) {
        await supabase
          .from('email_tracking')
          .update({
            aberto: true,
            aberto_em: tracking.aberto_em || new Date().toISOString(),
            total_aberturas: (tracking.total_aberturas || 0) + 1,
            status: 'aberto',
          })
          .eq('token', token)
      }
    }
  } catch (error) {
    console.error('Error tracking email:', error)
  }

  return new Response(pixelBytes, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    },
    status: 200,
  })
})
