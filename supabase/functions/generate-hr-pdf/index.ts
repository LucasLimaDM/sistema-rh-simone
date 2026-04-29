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
    const {
      title,
      tipoDocumento,
      conteudo,
      empresa,
      colaborador,
      testemunhas,
      assinaturas,
      editavel,
    } = await req.json()
    const doc = new jsPDF()

    // Header
    doc.setFillColor(243, 244, 246)
    doc.rect(0, 0, 210, 30, 'F')
    if (empresa?.logo_url) {
      try {
        doc.addImage(empresa.logo_url, 'PNG', 15, 5, 40, 20)
      } catch (e) {}
    }
    doc.setFontSize(16)
    doc.setTextColor(147, 51, 234)
    doc.text(empresa?.nome_fantasia || 'Empresa', 60, 15)
    doc.setFontSize(10)
    doc.setTextColor(51, 51, 51)
    if (empresa?.cnpj) doc.text(`CNPJ: ${empresa.cnpj}`, 60, 22)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title || 'Documento de RH', 20, 45)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(conteudo || '', 170)
    let y = 60

    for (const line of lines) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, 20, y)
      y += 6
    }

    if (tipoDocumento === 'Contrato') {
      if (y > 200) {
        doc.addPage()
        y = 20
      } else {
        y += 20
      }

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Assinaturas', 20, y)
      y += 20

      // Contratante
      doc.line(20, y, 90, y)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(empresa?.nome_responsavel || 'Contratante', 20, y + 5)
      if (assinaturas?.responsavel) {
        try {
          doc.addImage(assinaturas.responsavel, 'PNG', 30, y - 15, 40, 14)
        } catch (e) {}
      }

      // Colaborador
      doc.line(110, y, 180, y)
      doc.text(colaborador?.nome_completo || 'Contratado', 110, y + 5)
      if (assinaturas?.colaborador) {
        try {
          doc.addImage(assinaturas.colaborador, 'PNG', 120, y - 15, 40, 14)
        } catch (e) {}
      }

      y += 25
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Testemunhas', 20, y)
      y += 20

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      doc.line(20, y, 90, y)
      if (testemunhas?.[0]?.assinatura) {
        try {
          doc.addImage(testemunhas[0].assinatura, 'PNG', 30, y - 15, 40, 14)
        } catch (e) {}
      }
      if (editavel) {
        try {
          const t1Nome = new AcroFormTextField()
          t1Nome.T = 't1_nome'
          t1Nome.V = testemunhas?.[0]?.nome || ''
          t1Nome.Rect = [20, y + 2, 70, 6]
          doc.addField(t1Nome)
          const t1Cpf = new AcroFormTextField()
          t1Cpf.T = 't1_cpf'
          t1Cpf.V = testemunhas?.[0]?.cpf || ''
          t1Cpf.Rect = [20, y + 9, 70, 6]
          doc.addField(t1Cpf)
        } catch (e) {}
      } else {
        doc.text(testemunhas?.[0]?.nome || 'Testemunha 1', 20, y + 5)
        doc.text(testemunhas?.[0]?.cpf ? `CPF: ${testemunhas?.[0]?.cpf}` : 'CPF:', 20, y + 10)
      }

      doc.line(110, y, 180, y)
      if (testemunhas?.[1]?.assinatura) {
        try {
          doc.addImage(testemunhas[1].assinatura, 'PNG', 120, y - 15, 40, 14)
        } catch (e) {}
      }
      if (editavel) {
        try {
          const t2Nome = new AcroFormTextField()
          t2Nome.T = 't2_nome'
          t2Nome.V = testemunhas?.[1]?.nome || ''
          t2Nome.Rect = [110, y + 2, 70, 6]
          doc.addField(t2Nome)
          const t2Cpf = new AcroFormTextField()
          t2Cpf.T = 't2_cpf'
          t2Cpf.V = testemunhas?.[1]?.cpf || ''
          t2Cpf.Rect = [110, y + 9, 70, 6]
          doc.addField(t2Cpf)
        } catch (e) {}
      } else {
        doc.text(testemunhas?.[1]?.nome || 'Testemunha 2', 110, y + 5)
        doc.text(testemunhas?.[1]?.cpf ? `CPF: ${testemunhas?.[1]?.cpf}` : 'CPF:', 110, y + 10)
      }
    } else {
      if (y > 240) {
        doc.addPage()
        y = 20
      } else {
        y += 20
      }

      doc.line(20, y, 100, y)
      doc.setFontSize(10)
      doc.text(colaborador?.nome_completo || 'Assinatura do Colaborador', 20, y + 5)
      if (assinaturas?.colaborador) {
        try {
          doc.addImage(assinaturas.colaborador, 'PNG', 30, y - 15, 40, 14)
        } catch (e) {}
      }
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
