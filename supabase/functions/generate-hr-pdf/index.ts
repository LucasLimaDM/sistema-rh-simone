import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { jsPDF, AcroFormTextField } from 'npm:jspdf@2.5.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { title, content, company, category, signatureUrl, hasEditableFields } = await req.json()
    const doc = new jsPDF()

    // Dynamic Letterhead using purple primary color
    doc.setFillColor(243, 244, 246)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setFontSize(18)
    doc.setTextColor(147, 51, 234) // Roxo
    doc.text(company || 'Empresa', 20, 20)

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text(title || 'Documento de RH', 20, 45)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(content || '', 170)
    let y = 60

    for (const line of lines) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, 20, y)
      y += 6
    }

    if (hasEditableFields) {
      if (y > 230) {
        doc.addPage()
        y = 20
      }
      y += 10
      doc.setFont('helvetica', 'bold')
      doc.text('Campos Adicionais (Editáveis):', 20, y)
      y += 5

      try {
        const field = new AcroFormTextField()
        field.Rect = [20, y, 170, 20]
        field.T = 'observacoes_adicionais'
        doc.addField(field)
      } catch (e) {
        console.warn('AcroForm fallback not supported', e)
      }
      y += 25
    }

    if (signatureUrl) {
      if (y > 240) {
        doc.addPage()
        y = 20
      }
      y += 15
      doc.line(20, y, 100, y)
      doc.setFontSize(10)
      doc.text('Assinatura do Responsável (Timbrado)', 20, y + 5)
    } else {
      if (y > 240) {
        doc.addPage()
        y = 20
      }
      y += 20
      doc.line(20, y, 100, y)
      doc.setFontSize(10)
      doc.text('Assinatura', 20, y + 5)
    }

    const pdfDataUri = doc.output('datauristring')
    return new Response(JSON.stringify({ pdfDataUri }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
