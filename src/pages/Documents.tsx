import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { FileText, Plus, Download, Edit2, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Documents() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [empresa, setEmpresa] = useState<any>(null)
  const [witnesses, setWitnesses] = useState<any[]>([])

  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    template_id: '',
    colaborador_id: '',
    title: '',
    content: '',
    t1_id: '',
    t2_id: '',
    data_curso: '',
    versao_atual: 1,
  })
  const { toast } = useToast()

  const fetchData = async () => {
    const { data: emp } = await supabase
      .from('empresa_contratante')
      .select('*')
      .eq('nome_fantasia', company)
      .single()
    if (emp) {
      setEmpresa(emp)
      const [docs, temps, cols, testData] = await Promise.all([
        supabase
          .from('documento_gerado')
          .select('*, colaborador(nome_completo)')
          .eq('empresa_id', emp.id)
          .order('created_at', { ascending: false }),
        supabase.from('modelo').select('*').eq('empresa_id', emp.id),
        supabase.from('colaborador').select('*').eq('empresa_id', emp.id),
        supabase
          .from('testemunhas' as any)
          .select('*')
          .eq('ativo', true),
      ])
      if (docs.data) setDocuments(docs.data)
      if (temps.data) setTemplates(temps.data)
      if (cols.data) setEmployees(cols.data)
      if (testData.data) setWitnesses(testData.data)
    }
  }

  useEffect(() => {
    fetchData()
  }, [company])

  const buildAddress = (end: any) => {
    if (!end || typeof end !== 'object') return ''
    const parts = []
    if (end.logradouro) parts.push(end.logradouro)
    if (end.numero) parts.push(end.numero)
    if (end.complemento) parts.push(end.complemento)
    let address = parts.join(', ')
    if (end.bairro) address += ` - ${end.bairro}`
    if (end.cidade || end.uf)
      address += ` - ${end.cidade || ''}${end.cidade && end.uf ? '/' : ''}${end.uf || ''}`
    if (end.cep) address += ` - CEP: ${end.cep}`
    return address.replace(/^[,\s-]+|[,\s-]+$/g, '')
  }

  const processContent = (tempId: string, colId: string, dataCurso: string = '') => {
    const template = templates.find((t) => t.id === tempId)
    const col = employees.find((e) => e.id === colId)
    let content = template?.campos_config?.content || ''

    if (col && empresa) {
      const empEnd = empresa.endereco || {}
      const endEmpresaCompleto = buildAddress(empEnd)

      const colEnd = col.endereco || {}
      const endColCompleto = buildAddress(colEnd)

      content = content
        .replace(
          /{{NOME_EMPRESA}}|{{CONTRATANTE_RAZAO_SOCIAL}}|{{RAZAO_SOCIAL_CONTRATANTE}}/gi,
          empresa.razao_social || '',
        )
        .replace(
          /{{NOME_FANTASIA_EMPRESA}}|{{CONTRATANTE_NOME_FANTASIA}}|{{NOME_FANTASIA_CONTRATANTE}}/gi,
          empresa.nome_fantasia || '',
        )
        .replace(/{{CNPJ_EMPRESA}}|{{CONTRATANTE_CNPJ}}|{{CNPJ_CONTRATANTE}}/gi, empresa.cnpj || '')
        .replace(
          /{{RESPONSAVEL_EMPRESA}}|{{RESPONSAVEL_CONTRATANTE}}|{{CONTRATANTE_RESPONSAVEL}}/gi,
          empresa.nome_responsavel || '',
        )
        .replace(
          /{{CPF_RESPONSAVEL_EMPRESA}}|{{CPF_RESPONSAVEL_CONTRATANTE}}|{{CONTRATANTE_CPF_RESPONSAVEL}}/gi,
          empresa.cpf_responsavel || '',
        )
        .replace(/{{CONTRATANTE_ENDERECO}}|{{ENDERECO_CONTRATANTE}}/gi, endEmpresaCompleto)
        .replace(/{{CONTRATANTE_CIDADE}}|{{CIDADE_CONTRATANTE}}/gi, empEnd.cidade || '')
        .replace(/{{CONTRATANTE_UF}}|{{UF_CONTRATANTE}}/gi, empEnd.uf || '')
        .replace(
          /{{CONTRATANTE_IE}}|{{IE_CONTRATANTE}}|{{INSCRICAO_ESTADUAL_CONTRATANTE}}|{{CONTRATANTE_INSCRICAO_ESTADUAL}}/gi,
          empresa.inscricao_estadual || '',
        )
        .replace(
          /{{CONTRATANTE_IM}}|{{IM_CONTRATANTE}}|{{INSCRICAO_MUNICIPAL_CONTRATANTE}}|{{CONTRATANTE_INSCRICAO_MUNICIPAL}}/gi,
          empresa.inscricao_municipal || '',
        )

        .replace(
          /{{NOME_COLABORADOR}}|{{CONTRATADA_NOME}}|{{NOME_CONTRATADA}}/gi,
          col.nome_completo || '',
        )
        .replace(
          /{{CPF_COLABORADOR}}|{{CONTRATADA_CPF_CNPJ}}|{{CPF_CNPJ_CONTRATADA}}|{{CPF_CONTRATADA}}|{{CONTRATADA_CPF}}/gi,
          col.cnpj || col.cpf || '',
        )
        .replace(/{{RG_COLABORADOR}}|{{CONTRATADA_RG}}|{{RG_CONTRATADA}}/gi, col.rg || '')
        .replace(/{{CONTRATADA_ENDERECO}}|{{ENDERECO_CONTRATADA}}/gi, endColCompleto)
        .replace(/{{CONTRATADA_BAIRRO}}|{{BAIRRO_CONTRATADA}}/gi, colEnd.bairro || '')
        .replace(/{{CONTRATADA_CIDADE}}|{{CIDADE_CONTRATADA}}/gi, colEnd.cidade || '')
        .replace(/{{CONTRATADA_UF}}|{{UF_CONTRATADA}}/gi, colEnd.uf || '')
        .replace(/{{CONTRATADA_CEP}}|{{CEP_CONTRATADA}}/gi, colEnd.cep || '')

        .replace(
          /{{EMAIL_COLABORADOR}}|{{CONTRATADA_EMAIL}}|{{EMAIL_CONTRATADA}}/gi,
          col.email || '',
        )
        .replace(
          /{{WHATSAPP_COLABORADOR}}|{{TELEFONE_COLABORADOR}}|{{CONTRATADA_WHATSAPP}}|{{CONTRATADA_TELEFONE}}|{{WHATSAPP_CONTRATADA}}/gi,
          col.telefone || '',
        )
        .replace(
          /{{ESTADO_CIVIL_COLABORADOR}}|{{CONTRATADA_ESTADO_CIVIL}}|{{ESTADO_CIVIL_CONTRATADA}}/gi,
          col.dados_dinamicos?.estado_civil || 'solteiro(a)',
        )
        .replace(
          /{{NACIONALIDADE_COLABORADOR}}|{{CONTRATADA_NACIONALIDADE}}|{{NACIONALIDADE_CONTRATADA}}/gi,
          col.dados_dinamicos?.nacionalidade || 'brasileiro(a)',
        )
        .replace(
          /{{PROFISSAO_COLABORADOR}}|{{CONTRATADA_PROFISSAO}}|{{PROFISSAO_CONTRATADA}}/gi,
          col.cargo_nome_snapshot || '',
        )

        .replace(/{{CARGO_NOME}}/gi, col.cargo_nome_snapshot || '')
        .replace(/{{CARGO_DESCRICAO}}/gi, col.cargo_descricao_snapshot?.texto || '')
        .replace(/{{VALOR_HORA}}/gi, col.valor_hora_snapshot?.toString() || '')
        .replace(/{{VALOR_DIARIA}}/gi, col.valor_diaria_snapshot?.toString() || '')
        .replace(
          /{{DATA_CURSO}}/gi,
          dataCurso ? new Date(dataCurso).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
        )
        // Clean up remaining empty tags
        .replace(/{{[A-Z0-9_]+}}/gi, '')
    }

    setFormData((prev) => ({
      ...prev,
      template_id: tempId,
      colaborador_id: colId,
      title: prev.title || template?.nome || '',
      content,
      data_curso: dataCurso,
    }))
  }

  const handleGenerate = async () => {
    if (!user) return
    const template = templates.find((t) => t.id === formData.template_id)
    const col = employees.find((e) => e.id === formData.colaborador_id)

    if (!template || !col) {
      toast({
        title: 'Erro de Validação',
        description: 'Selecione o modelo e o colaborador antes de salvar.',
        variant: 'destructive',
      })
      return
    }

    const isContrato = template?.tipo_documento === 'Contrato'
    if (isContrato && !empresa.assinatura_responsavel_url) {
      toast({
        title: 'Assinatura da empresa ausente',
        description: 'A assinatura do responsável da empresa é obrigatória para contratos.',
        variant: 'destructive',
      })
      return
    }

    if (isContrato && (!formData.t1_id || !formData.t2_id)) {
      toast({
        title: 'Testemunhas incompletas',
        description: 'Selecione as duas testemunhas para gerar o contrato.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      const t1 = witnesses.find((w) => w.id === formData.t1_id)
      const t2 = witnesses.find((w) => w.id === formData.t2_id)

      // Fetch the correct modelo_versao_id
      let { data: modeloVersao } = await supabase
        .from('modelo_versao')
        .select('id')
        .eq('modelo_id', template.id)
        .order('versao', { ascending: false })
        .limit(1)
        .single()

      if (!modeloVersao) {
        // Fallback: create an initial version if it doesn't exist
        const { data: newMv, error: mvError } = await supabase
          .from('modelo_versao')
          .insert({
            modelo_id: template.id,
            versao: template.versao_atual || 1,
            arquivo_url: 'template_html',
            campos_config_snapshot: template.campos_config || {},
            alterado_por_usuario_id: user.id,
          })
          .select('id')
          .single()

        if (mvError || !newMv) {
          throw new Error('Não foi possível resolver a versão do modelo selecionado.')
        }
        modeloVersao = newMv
      }

      const payload: any = {
        modelo_id: template.id,
        modelo_versao_id: modeloVersao.id,
        empresa_id: empresa.id,
        colaborador_id: col?.id,
        cargo_id: col?.cargo_id,
        titulo: formData.title,
        tipo_documento: template.tipo_documento,
        status: 'finalizado',
        dados_preenchidos: { content: formData.content, data_curso: formData.data_curso },
        responsavel_empresa_nome: empresa.nome_responsavel,
        responsavel_empresa_assinatura_url: empresa.assinatura_responsavel_url,
        testemunha_1_nome: t1?.nome || '',
        testemunha_1_cpf: t1?.cpf || '',
        testemunha_1_assinatura_url: t1?.assinatura_url || null,
        testemunha_2_nome: t2?.nome || '',
        testemunha_2_cpf: t2?.cpf || '',
        testemunha_2_assinatura_url: t2?.assinatura_url || null,
        assinatura_colaborador_url: col?.assinatura_url || null,
        campos_editaveis_pdf: {},
        updated_by: user.id,
      }

      let docId = formData.id
      let novaVersao = 1

      if (docId) {
        novaVersao = (formData.versao_atual || 1) + 1
        payload.versao_atual = novaVersao
        const { error: updateError } = await supabase
          .from('documento_gerado')
          .update(payload)
          .eq('id', docId)

        if (updateError) throw updateError
        logAudit('documento_gerado', docId, 'update', user.id)
      } else {
        payload.created_by = user.id
        payload.versao_atual = 1
        const { data, error } = await supabase
          .from('documento_gerado')
          .insert(payload)
          .select()
          .single()

        if (error) throw error
        if (data) {
          docId = data.id
          logAudit('documento_gerado', docId, 'create', user.id)
        }
      }

      if (docId) {
        toast({ title: 'Gerando PDF...', description: 'Aguarde o processamento.' })

        const pdfPayload = {
          title: payload.titulo,
          tipoDocumento: payload.tipo_documento,
          conteudo: payload.dados_preenchidos?.content || '',
          empresa: empresa,
          colaborador: col,
          testemunhas: [
            {
              nome: payload.testemunha_1_nome,
              cpf: payload.testemunha_1_cpf,
              assinatura: payload.testemunha_1_assinatura_url,
            },
            {
              nome: payload.testemunha_2_nome,
              cpf: payload.testemunha_2_cpf,
              assinatura: payload.testemunha_2_assinatura_url,
            },
          ],
          assinaturas: {
            responsavel: payload.responsavel_empresa_assinatura_url,
            colaborador: payload.assinatura_colaborador_url,
          },
          editavel: true,
        }

        let publicUrl = ''

        try {
          const res = await supabase.functions.invoke('generate-hr-pdf', { body: pdfPayload })
          if (res.error) throw res.error

          let blob: Blob | null = null
          if (res.data instanceof Blob) {
            blob = res.data
          } else if (res.data?.pdfDataUri) {
            const resDataUri = res.data.pdfDataUri
            const base64Data = resDataUri.split(',')[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            blob = new Blob([byteArray], { type: 'application/pdf' })
          }

          if (blob) {
            const fileName = `pdfs/${docId}_v${novaVersao}.pdf`

            const { error: uploadError } = await supabase.storage
              .from('rh_files')
              .upload(fileName, blob, { contentType: 'application/pdf', upsert: true })

            if (!uploadError) {
              const {
                data: { publicUrl: url },
              } = supabase.storage.from('rh_files').getPublicUrl(fileName)
              publicUrl = url
              await supabase
                .from('documento_gerado')
                .update({ arquivo_pdf_url: publicUrl })
                .eq('id', docId)
            }
          }
        } catch (e) {
          console.error('Falha ao exportar PDF:', e)
        }

        const { error: versaoError } = await supabase.from('documento_versao').insert({
          documento_id: docId,
          versao: novaVersao,
          arquivo_pdf_url: publicUrl,
          dados_snapshot: payload,
          alterado_por_usuario_id: user.id,
        })

        if (versaoError) throw versaoError

        toast({ title: 'Sucesso', description: 'Documento salvo com sucesso.' })
        setIsOpen(false)
        fetchData()
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar documento',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditDocument = (doc: any) => {
    const t1 = witnesses.find((w) => w.cpf === doc.testemunha_1_cpf)
    const t2 = witnesses.find((w) => w.cpf === doc.testemunha_2_cpf)

    setFormData({
      id: doc.id,
      template_id: doc.modelo_id,
      colaborador_id: doc.colaborador_id || '',
      title: doc.titulo,
      content: doc.dados_preenchidos?.content || '',
      t1_id: t1?.id || '',
      t2_id: t2?.id || '',
      data_curso: doc.dados_preenchidos?.data_curso || '',
      versao_atual: doc.versao_atual,
    })
    setIsOpen(true)
  }

  const handleExportPDF = async (doc: any) => {
    toast({ title: 'Gerando PDF...', description: 'Aguarde o processamento.' })
    const { data: emp } = await supabase
      .from('empresa_contratante')
      .select('*')
      .eq('id', doc.empresa_id)
      .single()
    const { data: col } = await supabase
      .from('colaborador')
      .select('*')
      .eq('id', doc.colaborador_id)
      .single()

    const payload = {
      title: doc.titulo,
      tipoDocumento: doc.tipo_documento,
      conteudo: doc.dados_preenchidos?.content || '',
      empresa: emp,
      colaborador: col,
      testemunhas: [
        {
          nome: doc.testemunha_1_nome,
          cpf: doc.testemunha_1_cpf,
          assinatura: doc.testemunha_1_assinatura_url,
        },
        {
          nome: doc.testemunha_2_nome,
          cpf: doc.testemunha_2_cpf,
          assinatura: doc.testemunha_2_assinatura_url,
        },
      ],
      assinaturas: {
        responsavel: doc.responsavel_empresa_assinatura_url,
        colaborador: doc.assinatura_colaborador_url,
      },
      editavel: true,
    }

    try {
      const res = await supabase.functions.invoke('generate-hr-pdf', { body: payload })
      if (res.error) throw res.error

      let blob: Blob | null = null
      if (res.data instanceof Blob) {
        blob = res.data
      } else if (res.data?.pdfDataUri) {
        const resDataUri = res.data.pdfDataUri
        const base64Data = resDataUri.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'application/pdf' })
      }

      if (blob) {
        const fileName = `pdfs/${doc.id}_v${doc.versao_atual}.pdf`

        const { error: uploadError } = await supabase.storage
          .from('rh_files')
          .upload(fileName, blob, { contentType: 'application/pdf', upsert: true })

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('rh_files').getPublicUrl(fileName)
          await supabase
            .from('documento_gerado')
            .update({ arquivo_pdf_url: publicUrl })
            .eq('id', doc.id)
          await supabase
            .from('documento_versao')
            .update({ arquivo_pdf_url: publicUrl })
            .eq('documento_id', doc.id)
            .eq('versao', doc.versao_atual)

          window.open(publicUrl, '_blank')
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${doc.titulo}.pdf`
          a.click()
          URL.revokeObjectURL(url)
        }
        if (user) logAudit('documento_gerado', doc.id, 'export', user.id)
        fetchData()
      }
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao exportar PDF.', variant: 'destructive' })
    }
  }

  const handleDownload = (doc: any) => {
    if (doc.arquivo_pdf_url) {
      window.open(doc.arquivo_pdf_url, '_blank')
    } else {
      handleExportPDF(doc)
    }
  }

  const toggleDocSelection = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id],
    )
  }

  const toggleAllDocs = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(documents.map((d) => d.id))
    }
  }

  const confirmDelete = async () => {
    if (docToDelete) {
      const { error } = await supabase.from('documento_gerado').delete().eq('id', docToDelete)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Documento excluído.' })
        if (user) logAudit('documento_gerado', docToDelete, 'delete', user.id)
        fetchData()
      }
      setDocToDelete(null)
    } else if (selectedDocs.length > 0) {
      const { error } = await supabase.from('documento_gerado').delete().in('id', selectedDocs)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Documentos excluídos.' })
        setSelectedDocs([])
        fetchData()
      }
    }
    setDeleteConfirmOpen(false)
  }

  const selTemplate = templates.find((t) => t.id === formData.template_id)
  const selCol = employees.find((e) => e.id === formData.colaborador_id)

  const isContrato = selTemplate?.tipo_documento === 'Contrato'
  const isNR = selTemplate?.tipo_documento === 'NR'

  const missingCompanySig = isContrato && !empresa?.assinatura_responsavel_url
  const missingColSig = !!selCol && !selCol.assinatura_url

  if (!empresa) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Inicial Pendente</AlertTitle>
          <AlertDescription>
            Cadastre ao menos uma Empresa Contratante no módulo de Empresas para poder gerar
            documentos.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Repositório de Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Geração dinâmica com preenchimento via Template Engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedDocs.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => {
                setDocToDelete(null)
                setDeleteConfirmOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Excluir ({selectedDocs.length})
            </Button>
          )}
          <Button
            disabled={templates.length === 0 || employees.length === 0}
            onClick={() => {
              setFormData({
                id: '',
                template_id: '',
                colaborador_id: '',
                title: '',
                content: '',
                t1_id: '',
                t2_id: '',
                data_curso: '',
                versao_atual: 1,
              })
              setIsOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Gerar Documento
          </Button>
        </div>
      </div>

      {(templates.length === 0 || employees.length === 0) && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-800">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle>Ação Bloqueada</AlertTitle>
          <AlertDescription>
            Para gerar documentos, você precisa ter cadastrado ao menos um{' '}
            <strong>Colaborador</strong> e um <strong>Modelo Documental</strong>.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={documents.length > 0 && selectedDocs.length === documents.length}
                    onCheckedChange={toggleAllDocs}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedDocs.includes(d.id)}
                      onCheckedChange={() => toggleDocSelection(d.id)}
                      aria-label={`Selecionar ${d.titulo}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <FileText className="h-4 w-4 inline mr-2 text-primary" /> {d.titulo}
                  </TableCell>
                  <TableCell>{d.colaborador?.nome_completo}</TableCell>
                  <TableCell>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                      {d.status} v{d.versao_atual}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDocument(d)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDocToDelete(d.id)
                          setDeleteConfirmOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(d)}>
                        <Download className="h-4 w-4 mr-2" /> Abrir PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum documento gerado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir{' '}
              {docToDelete ? 'este documento' : `estes ${selectedDocs.length} documentos`}? Esta
              ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Documento (Auto-preenchimento)</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select
                  value={formData.colaborador_id}
                  onValueChange={(v) => processContent(formData.template_id, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(v) => processContent(v, formData.colaborador_id)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome} ({t.tipo_documento})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título Salvo</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {isNR && (
                <div className="space-y-2">
                  <Label>Data do Curso (NR)</Label>
                  <Input
                    type="date"
                    value={formData.data_curso}
                    onChange={(e) =>
                      processContent(formData.template_id, formData.colaborador_id, e.target.value)
                    }
                  />
                </div>
              )}

              {isContrato && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 border rounded mt-2">
                  <p className="col-span-2 text-xs font-bold mb-1">Testemunhas Obrigatórias</p>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Testemunha 1</Label>
                    <Select
                      value={formData.t1_id}
                      onValueChange={(v) => setFormData({ ...formData, t1_id: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione a testemunha" />
                      </SelectTrigger>
                      <SelectContent>
                        {witnesses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nome} ({w.cpf})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Testemunha 2</Label>
                    <Select
                      value={formData.t2_id}
                      onValueChange={(v) => setFormData({ ...formData, t2_id: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione a testemunha" />
                      </SelectTrigger>
                      <SelectContent>
                        {witnesses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nome} ({w.cpf})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {missingCompanySig && (
                <Alert variant="destructive" className="mt-4 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Assinatura Obrigatória Ausente</AlertTitle>
                  <AlertDescription>
                    A empresa não possui assinatura do responsável configurada. Configure as
                    assinaturas antes de gerar o documento.
                  </AlertDescription>
                </Alert>
              )}
              {missingColSig && (
                <Alert className="mt-4 text-xs bg-orange-50 border-orange-200 text-orange-800">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertTitle>Aviso</AlertTitle>
                  <AlertDescription>
                    O colaborador não possui assinatura. O documento poderá ser gerado para
                    assinatura física.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label>Pré-visualização do Documento</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="h-[300px] text-xs font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...
                </>
              ) : (
                'Salvar Documento Final'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
