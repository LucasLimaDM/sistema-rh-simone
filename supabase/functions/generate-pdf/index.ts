import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { jsPDF, AcroFormTextField } from 'npm:jspdf@2.5.1'
import autoTableLib from 'npm:jspdf-autotable@3.8.2'
import 'npm:jspdf-autotable@3.8.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
  'Access-Control-Expose-Headers': 'Content-Disposition',
}

const applyAutoTable = (doc: any, options: any) => {
  if (typeof autoTableLib === 'function') {
    autoTableLib(doc, options)
  } else if (autoTableLib && typeof (autoTableLib as any).default === 'function') {
    ;(autoTableLib as any).default(doc, options)
  } else if (typeof doc.autoTable === 'function') {
    doc.autoTable(options)
  } else {
    throw new Error('autoTable is not defined or attached to jsPDF correctly.')
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const formatBRL = (val: number) => {
    const parts = val.toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return parts.join(',')
  }

  try {
    const data = await req.json()
    const {
      headerData,
      items,
      taxRegimeId,
      taxTotal = 0,
      computedTaxItems = [],
      freightType = 'Incluso',
      freightValue,
      installments,
      paymentObservations,
      observationsText,
      clausesText,
      generalConditionsText,
      warrantyText,
      memoriaCalculoText,
      signaturesData,
      headerImageBase64,
      photosBase64,
      technicalPhotosBase64,
      taxObservation,

      prazoValidade,
      prazoMobilizacao,
      prazoEntrega,
    } = data

    const printOptions = data.printOptions || {
      capa: true,
      tecnicaComercial: true,
      impostosFrete: true,
      condicoesPagamento: true,
      condicoesFornecimento: true,
      condicoesGerais: true,
      garantia: true,
      clausulasContratuais: true,
      assinaturas: true,
      memoriaCalculo: false,
    }

    // Fallback for backward compatibility
    if (printOptions.termosCondicoes !== undefined) {
      if (printOptions.condicoesFornecimento === undefined)
        printOptions.condicoesFornecimento = printOptions.termosCondicoes
      if (printOptions.condicoesGerais === undefined)
        printOptions.condicoesGerais = printOptions.termosCondicoes
      if (printOptions.garantia === undefined) printOptions.garantia = printOptions.termosCondicoes
      if (printOptions.clausulasContratuais === undefined)
        printOptions.clausulasContratuais = printOptions.termosCondicoes
    }
    if (printOptions.impostosFrete === undefined && printOptions.resumoFinanceiro !== undefined) {
      printOptions.impostosFrete = printOptions.resumoFinanceiro
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const initializedPages = new Set<number>()

    const addHeaderAndFooter = (pageNum: number) => {
      if (headerImageBase64) {
        doc.addImage(headerImageBase64, 'JPEG', 0, 0, pageWidth, 40)
      }

      doc.setFillColor(15, 23, 42)
      doc.rect(0, 275, pageWidth, 22, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.3)

      doc.circle(16, 283, 1.5, 'S')
      doc.ellipse(16, 283, 0.7, 1.5, 'S')
      doc.line(14.5, 283, 17.5, 283)
      doc.text('www.primerpisos.com.br', 20, 284)
      doc.link(14, 281, 46, 4, { url: 'https://www.primerpisos.com.br' })

      doc.roundedRect(14.5, 288.5, 3, 2, 0.5, 0.5, 'S')
      doc.line(14.5, 288.5, 16, 289.5)
      doc.line(17.5, 288.5, 16, 289.5)
      doc.text('comercial@primerpisos.com.br', 20, 290.5)
      doc.link(14, 287, 56, 4, { url: 'mailto:comercial@primerpisos.com.br' })

      const waText = '(21) 98388-5000'
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const waTextWidth = doc.getTextWidth(waText)
      const waTotalWidth = 6 + waTextWidth
      const waStartX = (pageWidth - waTotalWidth) / 2

      doc.setFillColor(37, 211, 102)
      doc.roundedRect(waStartX, 284, 4.5, 4.5, 1, 1, 'F')

      doc.setDrawColor(255, 255, 255)
      doc.setFillColor(255, 255, 255)
      doc.setLineWidth(0.4)
      doc.circle(waStartX + 2.25, 286.25, 1.2, 'S')
      doc.triangle(waStartX + 1.2, 287.6, waStartX + 1.5, 287, waStartX + 1.8, 287.2, 'F')

      doc.text(waText, waStartX + 6, 287.5)
      doc.link(waStartX, 283, waTotalWidth + 2, 6, { url: 'https://wa.me/5521983885000' })

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const locText = 'Rio de Janeiro, RJ'
      doc.text(locText, pageWidth - 24, 287.5, { align: 'right' })

      const pinX = pageWidth - 18
      const pinY = 286.5
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.4)
      doc.circle(pinX, pinY - 1.2, 1.2, 'S')
      doc.line(pinX - 1.1, pinY - 0.6, pinX, pinY + 1.5)
      doc.line(pinX + 1.1, pinY - 0.6, pinX, pinY + 1.5)

      const locTextWidth = doc.getTextWidth(locText)
      doc.link(pageWidth - 24 - locTextWidth, 284, locTextWidth + 12, 6, {
        url: 'https://maps.google.com/?q=Rua+Carmo+do+Cajuru,+42,+Jacarepaguá,+Rio+de+Janeiro,+RJ,+CEP+22780-230',
      })
    }

    const ensurePageInitialized = () => {
      const pageNum = doc.internal.getNumberOfPages()
      if (!initializedPages.has(pageNum)) {
        addHeaderAndFooter(pageNum)
        initializedPages.add(pageNum)
      }
    }

    let isFirstPage = true
    const checkNewPage = () => {
      if (isFirstPage) {
        isFirstPage = false
        ensurePageInitialized()
      } else {
        doc.addPage()
        ensurePageInitialized()
      }
    }

    const drawSectionTitle = (title: string, y: number) => {
      doc.setFontSize(16)
      doc.setTextColor(51, 51, 51)
      doc.setFont('helvetica', 'bold')
      doc.text(title.toUpperCase(), 20, y)

      doc.setFillColor(215, 40, 47)
      doc.rect(20, y + 3, 10, 1.5, 'F')
      doc.setFillColor(245, 156, 0)
      doc.rect(30, y + 3, 10, 1.5, 'F')
      doc.setFillColor(0, 102, 204)
      doc.rect(40, y + 3, 10, 1.5, 'F')
    }

    const parseHtmlToBlocks = (html: string) => {
      if (!html) return []

      const tables: string[] = []
      html = html.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
        tables.push(match)
        return `\n[[TABLE_${tables.length - 1}]]\n`
      })

      const images: any[] = []
      html = html.replace(/<img([^>]+)>/gi, (match, attrs) => {
        let src = ''
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i)
        if (srcMatch) src = srcMatch[1]

        let widthStr = '100%'
        const styleMatch = attrs.match(/style=["']([^"']+)["']/i)
        if (styleMatch) {
          const styles = styleMatch[1]
          const wMatch = styles.match(/width:\s*([^;]+)/i)
          if (wMatch) widthStr = wMatch[1].trim()
        }

        let align = 'left'
        const alignMatch = attrs.match(/data-align=["']([^"']+)["']/i)
        if (alignMatch) align = alignMatch[1]

        if (src) {
          images.push({ src, widthStr, align })
          return `\n[[IMAGE_${images.length - 1}]]\n`
        }
        return ''
      })

      let inOl = false
      let olCounter = 1
      let textWithLines = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(p|div|h[1-6])[^>]*>/gi, '\n')
        .replace(/<ol[^>]*>/gi, () => {
          inOl = true
          olCounter = 1
          return '\n'
        })
        .replace(/<\/ol>/gi, () => {
          inOl = false
          return '\n'
        })
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<li[^>]*>/gi, () => {
          return inOl ? `\n${olCounter++}. ` : '\n• '
        })
        .replace(/<\/li>/gi, '')

      const lines = textWithLines
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      const blocks: any[] = []

      lines.forEach((line) => {
        if (line.match(/^\[\[TABLE_(\d+)\]\]$/)) {
          const idx = parseInt(line.match(/\d+/)?.[0] || '0')
          blocks.push({ type: 'table', html: tables[idx] })
          return
        }
        if (line.match(/^\[\[IMAGE_(\d+)\]\]$/)) {
          const idx = parseInt(line.match(/\d+/)?.[0] || '0')
          blocks.push({ type: 'image', ...images[idx] })
          return
        }

        let type = 'paragraph'
        let bulletStr = ''
        let content = line

        if (content.startsWith('• ')) {
          type = 'bullet'
          bulletStr = '• '
          content = content.substring(2)
        } else if (/^[a-zA-Z0-9IVX]+\.\s/.test(content)) {
          type = 'number'
          const m = content.match(/^([a-zA-Z0-9IVX]+\.\s)/)
          if (m) {
            bulletStr = m[1]
            content = content.substring(m[0].length)
          }
        }

        let currentFormatting = {
          bold: false,
          italic: false,
          underline: false,
          fontName: 'helvetica',
          fontSize: 11,
        }
        const tokens: any[] = []
        const tagRegex = /<\/?([a-z0-9]+)([^>]*)>|([^<]+)/gi
        let match
        while ((match = tagRegex.exec(content)) !== null) {
          if (match[3]) {
            const text = match[3]
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
            if (text) tokens.push({ text, ...currentFormatting })
          } else {
            const isClosing = match[0].startsWith('</')
            const tag = match[1].toLowerCase()
            const attrs = match[2] || ''

            if (tag === 'b' || tag === 'strong') currentFormatting.bold = !isClosing
            if (tag === 'i' || tag === 'em') currentFormatting.italic = !isClosing
            if (tag === 'u') currentFormatting.underline = !isClosing

            if (tag === 'font' && !isClosing) {
              const sizeMatch = attrs.match(/size=["']?([0-9]+)["']?/i)
              if (sizeMatch) {
                const s = parseInt(sizeMatch[1])
                if (s <= 2) currentFormatting.fontSize = 10
                else if (s === 3) currentFormatting.fontSize = 11
                else if (s === 4) currentFormatting.fontSize = 14
                else if (s >= 5) currentFormatting.fontSize = 16
              }
              const faceMatch = attrs.match(/face=["']?([^"']+)["']?/i)
              if (faceMatch) {
                const face = faceMatch[1].toLowerCase()
                if (face.includes('times')) currentFormatting.fontName = 'times'
                else if (face.includes('courier')) currentFormatting.fontName = 'courier'
                else currentFormatting.fontName = 'helvetica'
              }
            } else if (tag === 'font' && isClosing) {
              currentFormatting.fontSize = 11
              currentFormatting.fontName = 'helvetica'
            }
          }
        }

        if (tokens.length === 0) {
          tokens.push({ text: content.replace(/<[^>]+>/g, ''), ...currentFormatting })
        }

        blocks.push({ type, bulletStr, tokens })
      })

      return blocks
    }

    const buildLines = (blocks: any[], maxWidth: number): any[] => {
      const lines: any[] = []

      for (const block of blocks) {
        if (block.type === 'table' || block.type === 'image') {
          lines.push(block)
          continue
        }

        let indent = 0
        if (block.bulletStr) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          indent = doc.getTextWidth(block.bulletStr) + 1
        }
        const blockMaxWidth = maxWidth - indent

        const flatWords: any[] = []
        for (const token of block.tokens) {
          let fontStyle = 'normal'
          if (token.bold && token.italic) fontStyle = 'bolditalic'
          else if (token.bold) fontStyle = 'bold'
          else if (token.italic) fontStyle = 'italic'

          doc.setFont(token.fontName, fontStyle)
          doc.setFontSize(token.fontSize)

          const parts = token.text.split(/(\s+)/)
          for (const p of parts) {
            if (!p) continue
            if (p.match(/^\s+$/)) {
              flatWords.push({
                isSpace: true,
                width: doc.getTextWidth(' '),
                fontName: token.fontName,
                fontSize: token.fontSize,
              })
            } else {
              flatWords.push({
                text: p,
                fontStyle,
                fontName: token.fontName,
                fontSize: token.fontSize,
                underline: token.underline,
                width: doc.getTextWidth(p),
              })
            }
          }
        }

        let currentLineWords: any[] = []
        let currentLineWidth = 0
        let numSpaces = 0
        let isFirstLine = true

        const flushLine = (isLast: boolean) => {
          if (
            currentLineWords.length > 0 &&
            currentLineWords[currentLineWords.length - 1].isSpace
          ) {
            currentLineWords.pop()
            numSpaces--
            currentLineWidth -= doc.getTextWidth(' ')
          }
          if (currentLineWords.length > 0 && currentLineWords[0].isSpace) {
            currentLineWords.shift()
            numSpaces--
            currentLineWidth -= doc.getTextWidth(' ')
          }
          if (currentLineWords.length === 0) return

          let spaceW = 0
          if (!isLast && numSpaces > 0) {
            const wordsOnlyWidth = currentLineWords
              .filter((w: any) => !w.isSpace)
              .reduce((s: number, w: any) => s + w.width, 0)
            spaceW = (blockMaxWidth - wordsOnlyWidth) / numSpaces
            if (spaceW > 5) spaceW = 5
          }

          lines.push({
            type: 'text',
            indent,
            bulletStr: isFirstLine ? block.bulletStr : null,
            words: [...currentLineWords],
            spaceWidth: spaceW,
          })
          isFirstLine = false
          currentLineWords = []
          currentLineWidth = 0
          numSpaces = 0
        }

        for (const w of flatWords) {
          if (w.isSpace) {
            if (
              currentLineWords.length > 0 &&
              !currentLineWords[currentLineWords.length - 1].isSpace
            ) {
              if (currentLineWidth + w.width <= blockMaxWidth) {
                currentLineWords.push(w)
                currentLineWidth += w.width
                numSpaces++
              }
            }
          } else {
            if (currentLineWidth + w.width > blockMaxWidth && currentLineWords.length > 0) {
              flushLine(false)
            }
            currentLineWords.push(w)
            currentLineWidth += w.width
          }
        }
        flushLine(true)
        lines.push({ type: 'spacer' })
      }
      return lines
    }

    const renderTextLine = (doc: any, line: any, startX: number, currentY: number) => {
      if (line.bulletStr) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(51, 51, 51)
        doc.text(line.bulletStr, startX, currentY)
      }

      let curX = startX + line.indent
      for (const w of line.words) {
        doc.setFont(w.fontName || 'helvetica', w.fontStyle || 'normal')
        doc.setFontSize(w.fontSize || 11)
        doc.setTextColor(51, 51, 51)
        if (w.isSpace) {
          curX += line.spaceWidth > 0 ? line.spaceWidth : w.width
        } else {
          doc.text(w.text, curX, currentY)
          if (w.underline) {
            doc.setLineWidth(0.3)
            doc.line(curX, currentY + 1, curX + w.width, currentY + 1)
          }
          curX += w.width
        }
      }
    }

    if (printOptions.capa) {
      checkNewPage()

      if (photosBase64 && photosBase64.length > 0) {
        const padPhotos = [...photosBase64]
        while (padPhotos.length < 5) padPhotos.push(padPhotos[0] || '')

        doc.setFillColor(241, 245, 249)
        doc.rect(20, 45, 170, 75, 'F')

        try {
          doc.addImage(padPhotos[0], 'JPEG', 20, 45, 102, 75)
          doc.addImage(padPhotos[1], 'JPEG', 122, 45, 38, 37)
          doc.addImage(padPhotos[2], 'JPEG', 160, 45, 30, 37)
          doc.addImage(padPhotos[3], 'JPEG', 122, 82, 38, 38)
          doc.addImage(padPhotos[4], 'JPEG', 160, 82, 30, 38)
        } catch (e) {
          console.warn('Could not draw some gallery images', e)
        }

        doc.setFillColor(255, 255, 255)
        doc.triangle(120, 45, 122, 45, 105, 120, 'F')
        doc.triangle(122, 45, 107, 120, 105, 120, 'F')
        doc.rect(122, 81.5, 68, 1, 'F')
        doc.rect(159.5, 45, 1, 75, 'F')

        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.rect(20, 45, 170, 75, 'S')
      }

      let currentY = photosBase64 && photosBase64.length > 0 ? 140 : 60

      doc.setFontSize(28)
      doc.setTextColor(51, 51, 51)
      doc.setFont('helvetica', 'bold')
      doc.text('PROPOSTA', 20, currentY)
      currentY += 10
      doc.setTextColor(0, 102, 204)
      doc.text('TÉCNICA E COMERCIAL', 20, currentY)

      currentY += 5
      doc.setFillColor(215, 40, 47)
      doc.rect(20, currentY, 12, 2, 'F')
      doc.setFillColor(245, 156, 0)
      doc.rect(32, currentY, 12, 2, 'F')
      doc.setFillColor(0, 102, 204)
      doc.rect(44, currentY, 12, 2, 'F')

      currentY += 15

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(20, currentY, 170, 70, 3, 3, 'FD')

      let cardY = currentY + 8
      const leftX = 25
      const rightX = 110

      const drawLabel = (text: string, x: number, y: number) => {
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'bold')
        doc.text(text.toUpperCase(), x, y)
      }
      const drawValue = (text: string, x: number, y: number) => {
        doc.setFontSize(11)
        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'normal')
        const splitText = doc.splitTextToSize(text || '-', 80)
        doc.text(splitText, x, y)
      }

      drawLabel('Nome do Cliente', leftX, cardY)
      drawValue(headerData.cliente, leftX, cardY + 5)
      drawLabel('Nº da Proposta', rightX, cardY)
      doc.setFont('helvetica', 'bold')
      drawValue(headerData.proposta, rightX, cardY + 5)

      cardY += 13
      drawLabel('Contato', leftX, cardY)
      drawValue(headerData.contato || '-', leftX, cardY + 5)
      drawLabel('Celular', rightX, cardY)
      drawValue(headerData.celular, rightX, cardY + 5)

      cardY += 13
      drawLabel('Email', leftX, cardY)
      drawValue(headerData.email, leftX, cardY + 5)
      drawLabel('Data', rightX, cardY)
      drawValue(headerData.data, rightX, cardY + 5)

      cardY += 13
      drawLabel('Projeto', leftX, cardY)
      drawValue(headerData.projeto, leftX, cardY + 5)
      drawLabel('Local da Obra', rightX, cardY)
      drawValue(headerData.local, rightX, cardY + 5)
    }

    let totalComercial = 0
    items.forEach((item: any) => {
      const qty =
        parseFloat(
          String(item.quantity || '0')
            .replace(/\./g, '')
            .replace(',', '.'),
        ) || 0
      const mo =
        parseFloat(
          String(item.moUnitPrice || '0')
            .replace(/\./g, '')
            .replace(',', '.'),
        ) || 0
      const mat =
        parseFloat(
          String(item.materialUnitPrice || '0')
            .replace(/\./g, '')
            .replace(',', '.'),
        ) || 0
      totalComercial += qty * mo + qty * mat
    })

    if (printOptions.tecnicaComercial) {
      checkNewPage()
      drawSectionTitle('ESCOPO TÉCNICO E COMERCIAL', 55)

      const tableData: any[] = []
      let totalMoAll = 0
      let totalMatAll = 0

      items.forEach((item: any, i: number) => {
        const qty =
          parseFloat(
            String(item.quantity || '0')
              .replace(/\./g, '')
              .replace(',', '.'),
          ) || 0
        const mo =
          parseFloat(
            String(item.moUnitPrice || '0')
              .replace(/\./g, '')
              .replace(',', '.'),
          ) || 0
        const mat =
          parseFloat(
            String(item.materialUnitPrice || '0')
              .replace(/\./g, '')
              .replace(',', '.'),
          ) || 0
        const totalMo = qty * mo
        const totalMat = qty * mat
        const total = totalMo + totalMat

        totalMoAll += totalMo
        totalMatAll += totalMat

        const lines = []
        const stages = item.stages || []
        const validStages = stages.filter((st: any) => st.text && st.text.trim().length > 0)
        if (validStages.length > 0) {
          validStages.forEach((st: any) => {
            if (st.type === 'diversos') {
              lines.push(st.text)
            } else {
              const label = st.type.charAt(0).toUpperCase() + st.type.slice(1)
              lines.push(`• ${label}: ${st.text}`)
            }
          })
        } else {
          if (item.diversos_text) lines.push(item.diversos_text)
          if (item.preparacao_text) lines.push(`• Preparação: ${item.preparacao_text}`)
          if (item.estucamento_text) lines.push(`• Estucamento: ${item.estucamento_text}`)
          if (item.primer_text) lines.push(`• Primer: ${item.primer_text}`)
          if (item.regularizacao_text) lines.push(`• Regularização: ${item.regularizacao_text}`)
          if (item.acabamento_text) lines.push(`• Acabamento: ${item.acabamento_text}`)
          if (item.utilizacao_text) lines.push(`• Utilização: ${item.utilizacao_text}`)
          if (lines.length === 0 && item.description) lines.push(item.description)
        }

        if (
          item.textura &&
          item.textura !== 'Não se aplica' &&
          !item.name?.toLowerCase().includes('mobiliza')
        ) {
          lines.push(`• Textura: ${item.textura}`)
        }

        const descriptionText = lines
          .join('\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/ {2,}/g, ' ')
          .trim()

        tableData.push([
          (i + 1).toString().padStart(2, '0'),
          item.name || '-',
          `${qty} ${item.unit}`,
          `R$ ${formatBRL(mo)}`,
          `R$ ${formatBRL(mat)}`,
          `R$ ${formatBRL(total)}`,
        ])

        if (descriptionText) {
          tableData.push([
            {
              content: descriptionText,
              colSpan: 6,
              styles: {
                fillColor: [248, 250, 252],
                textColor: [51, 51, 51],
                cellPadding: { top: 4, right: 10, bottom: 5, left: 15 },
                fontStyle: 'normal',
                font: 'helvetica',
                fontSize: 11,
                halign: 'left',
                overflow: 'linebreak',
              },
            },
          ])
        }
      })

      const freightNum =
        parseFloat(
          String(freightValue || '0')
            .replace(/\./g, '')
            .replace(',', '.'),
        ) || 0
      const freightToAdd = freightType !== 'Incluso' ? freightNum : 0
      const totalGeralProjeto = totalMoAll + totalMatAll + freightToAdd

      const footData = []
      footData.push([
        { content: 'Total Geral MO', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `R$ ${formatBRL(totalMoAll)}`, styles: { halign: 'right', fontStyle: 'bold' } },
      ])
      footData.push([
        {
          content: 'Total Geral Material',
          colSpan: 5,
          styles: { halign: 'right', fontStyle: 'bold' },
        },
        { content: `R$ ${formatBRL(totalMatAll)}`, styles: { halign: 'right', fontStyle: 'bold' } },
      ])
      if (freightToAdd > 0) {
        footData.push([
          {
            content: `Frete (${freightType})`,
            colSpan: 5,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: `R$ ${formatBRL(freightToAdd)}`,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
        ])
      }
      footData.push([
        {
          content: 'VALOR TOTAL DO PROJETO',
          colSpan: 5,
          styles: {
            halign: 'right',
            fontStyle: 'bold',
            fillColor: [248, 250, 252],
            textColor: [0, 102, 204],
            fontSize: 12,
          },
        },
        {
          content: `R$ ${formatBRL(totalGeralProjeto)}`,
          styles: {
            halign: 'right',
            fontStyle: 'bold',
            fillColor: [248, 250, 252],
            textColor: [0, 102, 204],
            fontSize: 12,
          },
        },
      ])

      applyAutoTable(doc, {
        startY: 65,
        showFoot: 'lastPage',
        head: [['Item', 'Nome do Item', 'Qtd/Un', 'V.U. MO', 'V.U. Mat', 'Total']],
        body: tableData,
        foot: footData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
        },
        footStyles: {
          fillColor: [255, 255, 255],
          textColor: [51, 51, 51],
          fontSize: 11,
          cellPadding: 3,
        },
        styles: {
          fontSize: 11,
          textColor: [51, 51, 51],
          cellPadding: 3,
          overflow: 'linebreak',
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 58, fontStyle: 'bold', textColor: [51, 51, 51] },
          2: { cellWidth: 19, halign: 'center' },
          3: { cellWidth: 24, halign: 'right' },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [0, 102, 204] },
        },
        margin: { top: 45, bottom: 30 },
        didDrawPage: ensurePageInitialized,
      })

      let currentY = (doc as any).lastAutoTable.finalY + 15

      if (technicalPhotosBase64 && technicalPhotosBase64.length > 0) {
        const photoCount = technicalPhotosBase64.length
        const maxPhotosRow = 4
        const displayCount = Math.min(photoCount, maxPhotosRow)

        const gap = 5
        const totalGap = gap * (displayCount - 1)
        const imgWidth = (170 - totalGap) / displayCount
        const imgHeight = imgWidth * 0.75

        let isNewPage = false
        if (currentY + 10 + imgHeight > 270) {
          checkNewPage()
          currentY = 55
          isNewPage = true
        }

        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.text('EVIDÊNCIAS E REFERÊNCIAS TÉCNICAS', 20, currentY)

        if (isNewPage) {
          let y = currentY + 5
          const photos = technicalPhotosBase64.slice(0, 5)
          doc.setLineWidth(0.5)
          doc.setDrawColor(226, 232, 240)

          if (photos.length === 1) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 170, 127.5)
            } catch (e) {}
            doc.rect(20, y, 170, 127.5, 'S')
          } else if (photos.length === 2) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 83.5, 62.6)
            } catch (e) {}
            try {
              doc.addImage(photos[1], 'JPEG', 106.5, y, 83.5, 62.6)
            } catch (e) {}
            doc.rect(20, y, 83.5, 62.6, 'S')
            doc.rect(106.5, y, 83.5, 62.6, 'S')
          } else if (photos.length === 3) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 170, 90)
            } catch (e) {}
            doc.rect(20, y, 170, 90, 'S')
            try {
              doc.addImage(photos[1], 'JPEG', 20, y + 95, 82.5, 60)
            } catch (e) {}
            try {
              doc.addImage(photos[2], 'JPEG', 107.5, y + 95, 82.5, 60)
            } catch (e) {}
            doc.rect(20, y + 95, 82.5, 60, 'S')
            doc.rect(107.5, y + 95, 82.5, 60, 'S')
          } else {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 100, 75)
            } catch (e) {}
            doc.rect(20, y, 100, 75, 'S')
            try {
              doc.addImage(photos[1], 'JPEG', 125, y, 65, 35)
            } catch (e) {}
            doc.rect(125, y, 65, 35, 'S')
            try {
              doc.addImage(photos[2], 'JPEG', 125, y + 40, 65, 35)
            } catch (e) {}
            doc.rect(125, y + 40, 65, 35, 'S')

            const rem = Math.min(photos.length - 3, 2)
            const w = (170 - (rem - 1) * 5) / rem
            let lastImgH = 0
            for (let i = 0; i < rem; i++) {
              const px = 20 + i * (w + 5)
              lastImgH = w * 0.75
              try {
                doc.addImage(photos[3 + i], 'JPEG', px, y + 80, w, lastImgH)
              } catch (e) {}
              doc.rect(px, y + 80, w, lastImgH, 'S')
            }
            currentY = y + 80 + lastImgH
          }
        } else {
          currentY += 5
          let currentX = 20

          for (let i = 0; i < displayCount; i++) {
            try {
              doc.addImage(
                technicalPhotosBase64[i],
                'JPEG',
                currentX,
                currentY,
                imgWidth,
                imgHeight,
              )

              doc.setDrawColor(226, 232, 240)
              doc.setLineWidth(0.5)
              doc.rect(currentX, currentY, imgWidth, imgHeight, 'S')
            } catch (e) {
              console.warn('Could not draw technical photo', e)
            }
            currentX += imgWidth + gap
          }
          currentY += imgHeight
        }
      }

      // PRAZOS section inside tecnicaComercial
      if (prazoValidade || prazoMobilizacao || prazoEntrega) {
        currentY += 15
        if (currentY + 40 > 270) {
          checkNewPage()
          currentY = 55
        }

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'bold')
        doc.text('PRAZOS', 20, currentY)

        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(20, currentY + 4, 170, 32, 3, 3, 'FD')

        let linePrazosY = currentY + 12

        if (prazoValidade) {
          doc.setFontSize(9)
          doc.setTextColor(100, 116, 139)
          doc.setFont('helvetica', 'bold')
          doc.text('Validade:', 25, linePrazosY)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 41, 59)
          doc.text(`${prazoValidade} dias`, 45, linePrazosY)
        }

        linePrazosY += 8
        if (prazoMobilizacao) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(100, 116, 139)
          doc.text('Mobilização:', 25, linePrazosY)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 41, 59)
          doc.text(`${prazoMobilizacao} dias da assinatura do contrato`, 50, linePrazosY)
        }

        linePrazosY += 8
        if (prazoEntrega) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(100, 116, 139)
          doc.text('Entrega:', 25, linePrazosY)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(30, 41, 59)
          doc.text(prazoEntrega, 42, linePrazosY)
        }
      }
    }

    if (printOptions.impostosFrete || printOptions.condicoesPagamento) {
      checkNewPage()
      let currentY = 55

      if (printOptions.impostosFrete) {
        drawSectionTitle('IMPOSTOS E FRETE', currentY)

        const freightNum =
          parseFloat((freightValue || '').replace(/\./g, '').replace(',', '.')) || 0
        const safeComputedTaxItems = computedTaxItems || []
        const taxItemsToDisplay = safeComputedTaxItems.filter(
          (i: any) =>
            i.name ||
            i.description ||
            i.computedValue > 0 ||
            (i.name || '').toUpperCase().includes('INSS'),
        )

        const taxTableBody =
          taxItemsToDisplay.length > 0
            ? taxItemsToDisplay.map((item: any) => [
                item.name || item.description || 'Imposto',
                `R$ ${formatBRL(item.computedValue || 0)}`,
              ])
            : [['Nenhum detalhamento de imposto.', '']]

        const freightDisplay = freightType !== 'Incluso' ? `R$ ${formatBRL(freightNum)}` : 'Incluso'
        taxTableBody.push([
          {
            content: `Frete (${freightType})`,
            styles: { fontStyle: 'bold', textColor: [30, 41, 59] },
          },
          { content: freightDisplay, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
        ])

        applyAutoTable(doc, {
          startY: currentY + 10,
          head: [['Detalhamento de Impostos (Informativo - Já embutidos no Total)', 'Valor']],
          body: taxTableBody,
          theme: 'grid',
          headStyles: {
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
          },
          styles: {
            fontSize: 11,
            cellPadding: 4,
            textColor: [51, 51, 51],
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [51, 51, 51] },
          },
          margin: { left: 20, right: 20 },
          didDrawPage: ensurePageInitialized,
        })

        currentY = (doc as any).lastAutoTable.finalY + 10

        let finalTaxObservation = 'Todos os impostos estão incluídos no valor total da Proposta.'
        if (taxObservation) {
          finalTaxObservation = taxObservation + '\n\n' + finalTaxObservation
        }

        if (finalTaxObservation) {
          doc.setFontSize(9)
          doc.setTextColor(100, 116, 139)
          doc.setFont('helvetica', 'italic')
          const splitObs = doc.splitTextToSize(finalTaxObservation, 170)

          if (currentY + splitObs.length * 4 > 280) {
            checkNewPage()
            doc.text(splitObs, 20, 55)
            currentY = 55 + splitObs.length * 4 + 10
          } else {
            doc.text(splitObs, 20, currentY)
            currentY += splitObs.length * 4 + 10
          }
        }
      }

      if (printOptions.condicoesPagamento) {
        if (currentY > 200) {
          checkNewPage()
          currentY = 55
        }

        drawSectionTitle('CONDIÇÕES DE PAGAMENTO', currentY)

        const paymentData = installments.map((inst: any, i: number) => {
          let val = inst.value
          if (val && !val.includes(',')) {
            const num = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0
            val = formatBRL(num)
          } else if (val) {
            const num = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0
            val = formatBRL(num)
          }
          return [(i + 1).toString().padStart(2, '0'), inst.description, inst.dueDate, `R$ ${val}`]
        })

        applyAutoTable(doc, {
          startY: currentY + 10,
          head: [['Parcela', 'Descrição', 'Vencimento', 'Valor']],
          body: paymentData,
          theme: 'grid',
          headStyles: {
            fillColor: [0, 102, 204],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
          },
          styles: {
            fontSize: 11,
            cellPadding: 3,
            textColor: [51, 51, 51],
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 40 },
            3: { cellWidth: 35, halign: 'right' },
          },
          margin: { top: 45, bottom: 30 },
          didDrawPage: ensurePageInitialized,
        })

        const finalYForCondicoes = (doc as any).lastAutoTable?.finalY || currentY + 10

        if (paymentObservations) {
          doc.setFontSize(10)
          doc.setTextColor(100, 116, 139)
          doc.setFont('helvetica', 'bold')
          doc.text('Observações de Pagamento:', 20, finalYForCondicoes + 10)

          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(71, 85, 105)
          const splitObs = doc.splitTextToSize(paymentObservations, 170)
          doc.text(splitObs, 20, finalYForCondicoes + 15)
        }
      }
    }

    const processSection = (
      title: string,
      content: string,
      useColumns: boolean,
      tryTwoColsFallback: boolean = false,
    ) => {
      if (!content) return
      checkNewPage()
      drawSectionTitle(title.toUpperCase(), 55)

      let col = 0
      let currentY = 70
      const colW = 80
      const colGap = 10
      const maxY = 270

      let blocks = parseHtmlToBlocks(content)
      let finalUseColumns = useColumns
      let lineHeight = finalUseColumns ? 5.0 : 5.8

      if (useColumns && tryTwoColsFallback) {
        let testLines = buildLines(blocks, colW)
        let tCol = 0
        let tY = 70
        let fitsOnePage = true
        for (const line of testLines) {
          if (line.type === 'spacer') {
            tY += lineHeight * 0.5
            continue
          }
          let blockH = lineHeight
          if (line.type === 'table' || line.type === 'image') {
            blockH = 20
          }
          if (tY + blockH > maxY) {
            if (tCol === 0) {
              tCol = 1
              tY = 70 + 6
            } else {
              fitsOnePage = false
              break
            }
          }
          tY += blockH
        }
        if (!fitsOnePage) {
          finalUseColumns = false
          lineHeight = 5.8
        }
      }

      const lines = buildLines(blocks, finalUseColumns ? colW : 170)

      for (const line of lines) {
        if (line.type === 'spacer') {
          currentY += lineHeight * 0.5
          continue
        }

        if (line.type === 'table') {
          const tableRows: any[] = []
          const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
          let trMatch
          while ((trMatch = trRegex.exec(line.html)) !== null) {
            const tdRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi
            const row = []
            let tdMatch
            while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
              row.push(tdMatch[2].replace(/<[^>]+>/g, '').trim())
            }
            if (row.length > 0) tableRows.push(row)
          }
          if (tableRows.length > 0) {
            const head = tableRows.slice(0, 1)
            const body = tableRows.slice(1)
            let startX = finalUseColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
            applyAutoTable(doc, {
              startY: currentY,
              head: head,
              body: body,
              margin: { left: startX },
              tableWidth: finalUseColumns ? colW : 170,
              theme: 'grid',
              styles: {
                fontSize: finalUseColumns ? 9 : 11,
                textColor: [51, 51, 51],
                lineColor: [220, 220, 220],
                lineWidth: 0.1,
              },
              headStyles: {
                fillColor: [0, 102, 204],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              didDrawPage: ensurePageInitialized,
            })
            currentY = (doc as any).lastAutoTable.finalY + 5
          }
          continue
        }

        if (line.type === 'image') {
          try {
            const props = doc.getImageProperties(line.src)
            let baseImgW = finalUseColumns ? colW : 130
            let imgW = baseImgW

            if (line.widthStr && line.widthStr.includes('%')) {
              const pct = parseFloat(line.widthStr) || 100
              imgW = baseImgW * (pct / 100)
            }

            let imgH = 90
            let ratio = 1
            if (props && props.width && props.height) {
              ratio = props.width / props.height
            }
            imgH = imgW / ratio

            if (currentY + imgH > maxY) {
              if (finalUseColumns) {
                if (col === 0) {
                  col = 1
                  currentY = 70
                } else {
                  checkNewPage()
                  drawSectionTitle(title + ' (Cont.)', 55)
                  col = 0
                  currentY = 70
                }
              } else {
                checkNewPage()
                drawSectionTitle(title + ' (Cont.)', 55)
                currentY = 70
              }

              doc.setFontSize(9)
              doc.setTextColor(71, 85, 105)
            }

            let startX = finalUseColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
            let drawX = startX
            if (line.align === 'center') {
              drawX = startX + (baseImgW - imgW) / 2
            } else if (line.align === 'right') {
              drawX = startX + (baseImgW - imgW)
            }

            doc.addImage(line.src, 'JPEG', drawX, currentY, imgW, imgH)
            currentY += imgH + 5
          } catch (e) {}
          continue
        }

        if (line.type === 'text') {
          if (currentY + lineHeight > maxY) {
            if (finalUseColumns) {
              if (col === 0) {
                col = 1
                currentY = 70
              } else {
                checkNewPage()
                drawSectionTitle(title + ' (Cont.)', 55)
                col = 0
                currentY = 70
              }
            } else {
              checkNewPage()
              drawSectionTitle(title + ' (Cont.)', 55)
              currentY = 70
            }
          }

          let startX = finalUseColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
          renderTextLine(doc, line, startX, currentY)
          currentY += lineHeight
        }
      }
    }

    if (printOptions.condicoesFornecimento) {
      checkNewPage()
      drawSectionTitle('CONDIÇÕES DE FORNECIMENTO', 55)

      let finalContratante = ''
      let finalContratada = generalConditionsText || ''
      if (generalConditionsText && generalConditionsText.includes('[CONTRATANTE]')) {
        const m1 = generalConditionsText.match(/\[CONTRATANTE\]([\s\S]*?)\[\/CONTRATANTE\]/)
        const m2 = generalConditionsText.match(/\[CONTRATADA\]([\s\S]*?)\[\/CONTRATADA\]/)
        if (m1) finalContratante = m1[1].trim()
        if (m2) finalContratada = m2[1].trim()
      }

      const colW = 80
      const blocksL = parseHtmlToBlocks(finalContratante)
      const linesL = buildLines(blocksL, colW)
      const blocksR = parseHtmlToBlocks(finalContratada)
      const linesR = buildLines(blocksR, colW)

      const startPage = doc.internal.getNumberOfPages()
      const startY = 70
      const maxY = 270
      const lineHeight = 5.0

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 102, 204)
      doc.text('Responsabilidades do Contratante'.toUpperCase(), 20, startY)
      doc.setTextColor(245, 156, 0)
      doc.text('Responsabilidades da Contratada'.toUpperCase(), 110, startY)

      let yL = startY + 8
      let currPageL = startPage

      for (const line of linesL) {
        if (line.type === 'spacer') {
          yL += lineHeight * 0.5
          continue
        }
        if (yL + lineHeight > maxY) {
          currPageL++
          if (currPageL > doc.internal.getNumberOfPages()) {
            checkNewPage()
            drawSectionTitle('CONDIÇÕES DE FORNECIMENTO (Cont.)', 55)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.setTextColor(0, 102, 204)
            doc.text('Responsabilidades do Contratante'.toUpperCase(), 20, 70)
            doc.setTextColor(245, 156, 0)
            doc.text('Responsabilidades da Contratada'.toUpperCase(), 110, 70)
            yL = 78
          } else {
            doc.setPage(currPageL)
            yL = 70
          }
        }
        if (line.type === 'text') {
          renderTextLine(doc, line, 20, yL)
          yL += lineHeight
        }
      }

      let maxPageL = currPageL

      let yR = startY + 8
      let currPageR = startPage
      doc.setPage(currPageR)

      for (const line of linesR) {
        if (line.type === 'spacer') {
          yR += lineHeight * 0.5
          continue
        }
        if (yR + lineHeight > maxY) {
          currPageR++
          if (currPageR > doc.internal.getNumberOfPages()) {
            checkNewPage()
            drawSectionTitle('CONDIÇÕES DE FORNECIMENTO (Cont.)', 55)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.setTextColor(0, 102, 204)
            doc.text('Responsabilidades do Contratante'.toUpperCase(), 20, 70)
            doc.setTextColor(245, 156, 0)
            doc.text('Responsabilidades da Contratada'.toUpperCase(), 110, 70)
            yR = 78
          } else {
            doc.setPage(currPageR)
            yR = 70
          }
        }
        if (line.type === 'text') {
          renderTextLine(doc, line, 110, yR)
          yR += lineHeight
        }
      }

      const finalPage = Math.max(maxPageL, currPageR)
      doc.setPage(finalPage)
    }

    if (printOptions.condicoesGerais) {
      let processedObservationsText = observationsText || ''
      processedObservationsText = processedObservationsText.replace(
        /Responsabilidades da Contratada/gi,
        '13.',
      )
      processSection('Condições Gerais', processedObservationsText, true, false)
    }

    if (printOptions.garantia) {
      processSection('Termo de Garantia', warrantyText, true, false)
    }

    if (printOptions.clausulasContratuais) {
      processSection('Cláusulas Contratuais', clausesText, true, true)
    }

    if (printOptions.memoriaCalculo) {
      processSection('Memória de Cálculo', memoriaCalculoText, false, false)
    }

    if (printOptions.assinaturas) {
      checkNewPage()

      const addTextField = (
        name: string,
        x: number,
        y: number,
        w: number,
        h: number,
        defaultVal: string = '',
      ) => {
        try {
          let field: any
          if (typeof AcroFormTextField !== 'undefined') {
            field = new AcroFormTextField()
          } else if (typeof (doc as any).AcroFormTextField === 'function') {
            field = new (doc as any).AcroFormTextField()
          } else if (
            (doc as any).AcroForm &&
            typeof (doc as any).AcroForm.TextField === 'function'
          ) {
            field = new (doc as any).AcroForm.TextField()
          } else {
            console.warn('AcroFormTextField constructor not found')
            return
          }
          field.Rect = [x, y, w, h]
          field.T = name
          field.V = defaultVal
          field.fontSize = 8
          field.textAlign = 'center'
          doc.addField(field)
        } catch (e) {
          console.warn('Could not add AcroForm field', e)
        }
      }

      doc.setFontSize(24)
      doc.setTextColor(51, 51, 51)
      doc.setFont('helvetica', 'bold')
      doc.text('TERMO DE', 20, 55)
      doc.setTextColor(0, 102, 204)
      doc.text('ASSINATURAS', 20, 65)

      doc.setFillColor(215, 40, 47)
      doc.rect(20, 68, 12, 2, 'F')
      doc.setFillColor(245, 156, 0)
      doc.rect(32, 68, 12, 2, 'F')
      doc.setFillColor(0, 102, 204)
      doc.rect(44, 68, 12, 2, 'F')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(51, 51, 51)
      doc.text('De acordo com os termos e condições descritos nesta proposta.', 20, 80)

      let sigY = 95

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(20, sigY, 80, 70, 3, 3, 'FD')
      doc.setFontSize(10)
      doc.setTextColor(0, 106, 156)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTRATADA (VOCÊ)', 25, sigY + 8)
      doc.setDrawColor(226, 232, 240)
      doc.line(20, sigY + 12, 100, sigY + 12)

      if (signaturesData?.contratada?.assinatura) {
        try {
          doc.addImage(signaturesData.contratada.assinatura, 'PNG', 35, sigY + 15, 50, 25)
        } catch (e) {}
      }

      doc.setDrawColor(15, 23, 42)
      doc.line(25, sigY + 45, 95, sigY + 45)
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      doc.text(signaturesData.contratada?.representante || 'Representante Legal', 60, sigY + 50, {
        align: 'center',
      })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(signaturesData.contratada?.nome || '', 60, sigY + 55, { align: 'center' })
      doc.text(signaturesData.contratada?.cnpj || '', 60, sigY + 60, { align: 'center' })

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(110, sigY, 80, 70, 3, 3, 'FD')
      doc.setFontSize(10)
      doc.setTextColor(245, 156, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTRATANTE (CLIENTE)', 115, sigY + 8)
      doc.setDrawColor(226, 232, 240)
      doc.line(110, sigY + 12, 190, sigY + 12)

      if (signaturesData?.contratante?.assinatura) {
        try {
          doc.addImage(signaturesData.contratante.assinatura, 'PNG', 125, sigY + 15, 50, 25)
        } catch (e) {}
      } else {
        addTextField('AssinaturaContratante', 115, sigY + 15, 70, 25, '')
      }

      doc.setDrawColor(15, 23, 42)
      doc.line(115, sigY + 45, 185, sigY + 45)
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)

      const repContratante =
        signaturesData.contratante?.representante || headerData.contato || headerData.cliente || ''
      if (repContratante && repContratante !== 'Representante Legal') {
        doc.text(repContratante, 150, sigY + 50, { align: 'center' })
      } else {
        addTextField('RepresentanteContratante', 115, sigY + 46, 70, 5, '')
      }

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)

      const nomeContratante = signaturesData.contratante?.nome || headerData.cliente || ''
      if (nomeContratante) {
        doc.text(nomeContratante, 150, sigY + 55, { align: 'center' })
      } else {
        addTextField('NomeContratante', 115, sigY + 51, 70, 5, '')
      }

      const cnpjContratante = signaturesData.contratante?.cnpj || ''
      if (cnpjContratante) {
        doc.text(cnpjContratante, 150, sigY + 60, { align: 'center' })
      } else {
        addTextField('CNPJContratante', 115, sigY + 56, 70, 5, 'CNPJ: ')
      }

      sigY += 80

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'bold')
      doc.text('TESTEMUNHAS', 20, sigY)

      sigY += 5
      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(20, sigY, 80, 50, 3, 3, 'FD')

      if (signaturesData?.contratada?.testemunha?.assinatura) {
        try {
          doc.addImage(signaturesData.contratada.testemunha.assinatura, 'PNG', 35, sigY + 5, 50, 20)
        } catch (e) {}
      }

      doc.setDrawColor(100, 116, 139)
      doc.line(25, sigY + 30, 95, sigY + 30)
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)
      doc.text(signaturesData.contratada?.testemunha?.nome || 'Nome da Testemunha', 60, sigY + 35, {
        align: 'center',
      })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(`CPF: ${signaturesData.contratada?.testemunha?.cpf || '---'}`, 60, sigY + 40, {
        align: 'center',
      })

      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(110, sigY, 80, 50, 3, 3, 'FD')

      if (signaturesData?.contratante?.testemunha?.assinatura) {
        try {
          doc.addImage(
            signaturesData.contratante.testemunha.assinatura,
            'PNG',
            125,
            sigY + 5,
            50,
            20,
          )
        } catch (e) {}
      } else {
        addTextField('AssinaturaTestemunhaContratante', 115, sigY + 5, 70, 20, '')
      }

      doc.setDrawColor(100, 116, 139)
      doc.line(115, sigY + 30, 185, sigY + 30)
      doc.setFontSize(9)
      doc.setTextColor(30, 41, 59)

      const nomeTestemunha = signaturesData.contratante?.testemunha?.nome || ''
      if (nomeTestemunha && nomeTestemunha !== 'Nome da Testemunha') {
        doc.text(nomeTestemunha, 150, sigY + 35, { align: 'center' })
      } else {
        addTextField('NomeTestemunhaContratante', 115, sigY + 31, 70, 5, 'Nome da Testemunha')
      }

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)

      const cpfTestemunha = signaturesData.contratante?.testemunha?.cpf || ''
      if (cpfTestemunha && cpfTestemunha !== '---') {
        doc.text(`CPF: ${cpfTestemunha}`, 150, sigY + 40, { align: 'center' })
      } else {
        addTextField('CPFTestemunhaContratante', 115, sigY + 36, 70, 5, 'CPF: ')
      }
    }

    if (isFirstPage) {
      checkNewPage()
      doc.setFontSize(16)
      doc.setTextColor(200, 0, 0)
      doc.text('Nenhuma aba selecionada para impressão.', 20, 60)
    }

    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.setFont('helvetica', 'bold')
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 15, 294, { align: 'right' })
    }

    const pdfBuffer = doc.output('arraybuffer')

    const safeProposta = (headerData.proposta || 'Comercial').replace(/\//g, '-')
    const safeCliente = (headerData.cliente || '').replace(/[/\\?%*:|"<>]/g, '').trim()
    const fileName = safeCliente ? `${safeProposta} ${safeCliente}.pdf` : `${safeProposta}.pdf`

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
