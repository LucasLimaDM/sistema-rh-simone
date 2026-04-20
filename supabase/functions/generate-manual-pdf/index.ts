import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { jsPDF } from 'npm:jspdf@2.5.1'
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

  try {
    const data = await req.json()
    const {
      headerData,
      warrantyText,
      caracteristicasText,
      cuidadosText,
      conclusaoText,
      fotosAntesBase64,
      fotosDepoisBase64,
      manualPhotosBase64,
      headerImageBase64,
      printOptions = {
        capa: true,
        fotos: true,
        garantia: true,
        caracteristicas: true,
        cuidados: true,
        conclusao: true,
      },
    } = data

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const initializedPages = new Set<number>()

    const addHeaderAndFooter = (pageNum: number) => {
      if (headerImageBase64) {
        try {
          doc.addImage(headerImageBase64, 'JPEG', 0, 0, pageWidth, 40)
        } catch (e) {}
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

      doc.roundedRect(14.5, 288.5, 3, 2, 0.5, 0.5, 'S')
      doc.line(14.5, 288.5, 16, 289.5)
      doc.line(17.5, 288.5, 16, 289.5)
      doc.text('comercial@primerpisos.com.br', 20, 290.5)

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

      html = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<xml[^>]*>[\s\S]*?<\/xml>/gi, '')
        .replace(/<\/?(o|w|m|v):[^>]*>/gi, '')
        .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
        .replace(/<o:p\/>/gi, '')
        .replace(/ class="[^"]*Mso[^"]*"/gi, '')
        .replace(/ class='[^']*Mso[^']*'/gi, '')

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

    const addTextSection = (
      title: string,
      content: string,
      useColumns: boolean = false,
      compact: boolean = false,
    ) => {
      if (!content) return
      checkNewPage()

      const titleY = compact ? 48 : 55
      drawSectionTitle(title, titleY)

      doc.setTextColor(71, 85, 105)
      const blocks = parseHtmlToBlocks(content)

      const colW = 80
      const colGap = 10
      const lines = buildLines(blocks, useColumns ? colW : 170)

      let col = 0
      let currentY = compact ? 60 : 70
      const maxY = compact ? 280 : 270
      const lineHeight = useColumns ? 5.0 : compact ? 5.0 : 5.8

      for (const line of lines) {
        if (line.type === 'spacer') {
          currentY += lineHeight * (compact ? 0.3 : 0.4)
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
            const startX = useColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
            applyAutoTable(doc, {
              startY: currentY,
              head: head,
              body: body,
              margin: { left: startX, bottom: 297 - maxY },
              tableWidth: useColumns ? colW : 170,
              theme: 'grid',
              styles: {
                fontSize: useColumns ? 9 : 11,
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
            let baseImgW = useColumns ? colW : 130
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
              if (useColumns) {
                if (col === 0) {
                  col = 1
                  currentY = compact ? 60 : 70
                } else {
                  checkNewPage()
                  drawSectionTitle(title + ' (Cont.)', compact ? 48 : 55)
                  col = 0
                  currentY = compact ? 60 : 70
                }
              } else {
                checkNewPage()
                drawSectionTitle(title + ' (Cont.)', compact ? 48 : 55)
                currentY = compact ? 60 : 70
              }
            }

            let startX = useColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
            let drawX = startX
            if (line.align === 'center') {
              drawX = startX + (baseImgW - imgW) / 2
            } else if (line.align === 'right') {
              drawX = startX + (baseImgW - imgW)
            }

            doc.addImage(line.src, 'JPEG', drawX, currentY, imgW, imgH)
            currentY += imgH + 3
          } catch (e) {
            console.warn('Failed to add image to PDF', e)
          }
          continue
        }

        if (line.type === 'text') {
          if (currentY + lineHeight > maxY) {
            if (useColumns) {
              if (col === 0) {
                col = 1
                currentY = compact ? 60 : 70
              } else {
                checkNewPage()
                drawSectionTitle(title + ' (Cont.)', compact ? 48 : 55)
                col = 0
                currentY = compact ? 60 : 70
              }
            } else {
              checkNewPage()
              drawSectionTitle(title + ' (Cont.)', compact ? 48 : 55)
              currentY = compact ? 60 : 70
            }
          }

          const startX = useColumns ? (col === 0 ? 20 : 20 + colW + colGap) : 20
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
          currentY += lineHeight
        }
      }
    }

    if (printOptions.capa) {
      checkNewPage()

      if (manualPhotosBase64 && manualPhotosBase64.length > 0) {
        const padPhotos = [...manualPhotosBase64]
        while (padPhotos.length < 5) padPhotos.push(padPhotos[0] || '')

        doc.setFillColor(241, 245, 249)
        doc.rect(20, 45, 170, 75, 'F')

        try {
          doc.addImage(padPhotos[0], 'JPEG', 20, 45, 102, 75)
          doc.addImage(padPhotos[1], 'JPEG', 122, 45, 38, 37)
          doc.addImage(padPhotos[2], 'JPEG', 160, 45, 30, 37)
          doc.addImage(padPhotos[3], 'JPEG', 122, 82, 38, 38)
          doc.addImage(padPhotos[4], 'JPEG', 160, 82, 30, 38)
        } catch (e) {}

        doc.setFillColor(255, 255, 255)
        doc.triangle(120, 45, 122, 45, 105, 120, 'F')
        doc.triangle(122, 45, 107, 120, 105, 120, 'F')
        doc.rect(122, 81.5, 68, 1, 'F')
        doc.rect(159.5, 45, 1, 75, 'F')

        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.rect(20, 45, 170, 75, 'S')
      }

      let currentY = manualPhotosBase64 && manualPhotosBase64.length > 0 ? 140 : 60

      doc.setFontSize(28)
      doc.setTextColor(51, 51, 51)
      doc.setFont('helvetica', 'bold')
      doc.text('MANUAL DE', 20, currentY)
      currentY += 10
      doc.setTextColor(0, 102, 204)
      doc.text('CONSERVAÇÃO', 20, currentY)

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
      doc.roundedRect(20, currentY, 170, 85, 3, 3, 'FD')

      let cardY = currentY + 12
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
      drawLabel('Manual da Proposta Nº', rightX, cardY)
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

    if (printOptions.fotos) {
      if (
        (fotosAntesBase64 && fotosAntesBase64.length > 0) ||
        (fotosDepoisBase64 && fotosDepoisBase64.length > 0)
      ) {
        checkNewPage()
        drawSectionTitle('REGISTRO FOTOGRÁFICO', 55)
        let currentY = 70

        const drawMosaic = (title: string, photos: string[], startY: number) => {
          if (startY + 90 > 265) {
            checkNewPage()
            startY = 55
          }

          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(51, 51, 51)
          doc.text(title, 20, startY)

          doc.setFillColor(0, 102, 204)
          doc.rect(20, startY + 2, 10, 1.5, 'F')

          let y = startY + 8

          if (photos.length === 0) return startY

          doc.setLineWidth(0.5)

          if (photos.length === 1) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 170, 70)
            } catch (e) {}
            doc.setDrawColor(226, 232, 240)
            doc.rect(20, y, 170, 70, 'S')
            y += 75
          } else if (photos.length === 2) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 83.5, 60)
            } catch (e) {}
            try {
              doc.addImage(photos[1], 'JPEG', 106.5, y, 83.5, 60)
            } catch (e) {}
            doc.setDrawColor(226, 232, 240)
            doc.rect(20, y, 83.5, 60, 'S')
            doc.rect(106.5, y, 83.5, 60, 'S')
            y += 65
          } else if (photos.length === 3) {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 100, 48)
            } catch (e) {}
            try {
              doc.addImage(photos[1], 'JPEG', 123, y, 67, 22.5)
            } catch (e) {}
            try {
              doc.addImage(photos[2], 'JPEG', 123, y + 25.5, 67, 22.5)
            } catch (e) {}
            doc.setDrawColor(226, 232, 240)
            doc.rect(20, y, 100, 48, 'S')
            doc.rect(123, y, 67, 22.5, 'S')
            doc.rect(123, y + 25.5, 67, 22.5, 'S')
            y += 53
          } else {
            try {
              doc.addImage(photos[0], 'JPEG', 20, y, 100, 48)
            } catch (e) {}
            try {
              doc.addImage(photos[1], 'JPEG', 123, y, 67, 22.5)
            } catch (e) {}
            try {
              doc.addImage(photos[2], 'JPEG', 123, y + 25.5, 67, 22.5)
            } catch (e) {}
            doc.setDrawColor(226, 232, 240)
            doc.rect(20, y, 100, 48, 'S')
            doc.rect(123, y, 67, 22.5, 'S')
            doc.rect(123, y + 25.5, 67, 22.5, 'S')

            y += 51

            const rem = Math.min(photos.length - 3, 3)
            const w = (170 - (rem - 1) * 3) / rem
            for (let i = 0; i < rem; i++) {
              const px = 20 + i * (w + 3)
              try {
                doc.addImage(photos[3 + i], 'JPEG', px, y, w, 28)
              } catch (e) {}
              doc.setDrawColor(226, 232, 240)
              doc.rect(px, y, w, 28, 'S')
            }
            y += 33
          }
          return y + 5
        }

        if (fotosAntesBase64 && fotosAntesBase64.length > 0) {
          currentY = drawMosaic('ANTES', fotosAntesBase64, currentY)
        }
        if (fotosDepoisBase64 && fotosDepoisBase64.length > 0) {
          currentY = drawMosaic('DEPOIS', fotosDepoisBase64, currentY)
        }
      }
    }

    if (printOptions.garantia) addTextSection('TERMO DE GARANTIA', warrantyText, true)
    if (printOptions.caracteristicas)
      addTextSection('CARACTERÍSTICAS TÉCNICAS', caracteristicasText, false)
    if (printOptions.cuidados) addTextSection('CUIDADOS GERAIS', cuidadosText, false)

    if ((printOptions as any).conclusao !== false && conclusaoText) {
      addTextSection('CONCLUSÃO', conclusaoText, false, true)
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

    const safeProposta = (headerData.proposta || 'Conservacao').replace(/\//g, '-')
    const safeCliente = (headerData.cliente || '').replace(/[/\\?%*:|"<>]/g, '').trim()
    const fileName = safeCliente
      ? `Manual ${safeProposta} ${safeCliente}.pdf`
      : `Manual_${safeProposta}.pdf`

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
