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
import { useToast } from '@/hooks/use-toast'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { FileText, Plus, Download, Edit2, AlertCircle } from 'lucide-react'
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

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    template_id: '',
    colaborador_id: '',
    title: '',
    content: '',
    t1_nome: '',
    t1_cpf: '',
    t2_nome: '',
    t2_cpf: '',
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
      const [docs, temps, cols] = await Promise.all([
        supabase
          .from('documento_gerado')
          .select('*, colaborador(nome_completo)')
          .eq('empresa_id', emp.id)
          .order('created_at', { ascending: false }),
        supabase.from('modelo').select('*').eq('empresa_id', emp.id),
        supabase.from('colaborador').select('*').eq('empresa_id', emp.id),
      ])
      if (docs.data) setDocuments(docs.data)
      if (temps.data) setTemplates(temps.data)
      if (cols.data) setEmployees(cols.data)
    }
  }

  useEffect(() => {
    fetchData()
  }, [company])

  const processContent = (tempId: string, colId: string, dataCurso: string = '') => {
    const template = templates.find((t) => t.id === tempId)
    const col = employees.find((e) => e.id === colId)
    let content = template?.campos_config?.content || ''

    if (col && empresa) {
      content = content
        .replace(/{{NOME_EMPRESA}}/g, empresa.razao_social)
        .replace(/{{CNPJ_EMPRESA}}/g, empresa.cnpj)
        .replace(/{{RESPONSAVEL_EMPRESA}}/g, empresa.nome_responsavel)
        .replace(/{{NOME_COLABORADOR}}/g, col.nome_completo)
        .replace(/{{CPF_COLABORADOR}}/g, col.cpf)
        .replace(/{{RG_COLABORADOR}}/g, col.rg || '')
        .replace(/{{CARGO_NOME}}/g, col.cargo_nome_snapshot || '')
        .replace(/{{CARGO_DESCRICAO}}/g, col.cargo_descricao_snapshot?.texto || '')
        .replace(/{{VALOR_HORA}}/g, col.valor_hora_snapshot || '')
        .replace(/{{VALOR_DIARIA}}/g, col.valor_diaria_snapshot || '')
        .replace(
          /{{DATA_CURSO}}/g,
          dataCurso ? new Date(dataCurso).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
        )
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

    const isContrato = template?.tipo_documento === 'Contrato'
    if (isContrato && !empresa.assinatura_responsavel_url) {
      toast({ title: 'Assinatura da empresa ausente', variant: 'destructive' })
      return
    }
    if (!col?.assinatura_url) {
      toast({ title: 'Assinatura do colaborador ausente', variant: 'destructive' })
      return
    }
    if (
      isContrato &&
      (!formData.t1_nome || !formData.t1_cpf || !formData.t2_nome || !formData.t2_cpf)
    ) {
      toast({ title: 'Testemunhas incompletas', variant: 'destructive' })
      return
    }

    const payload: any = {
      modelo_id: template.id,
      modelo_versao_id: template.id, // Simplification
      empresa_id: empresa.id,
      colaborador_id: col?.id,
      cargo_id: col?.cargo_id,
      titulo: formData.title,
      tipo_documento: template.tipo_documento,
      status: 'finalizado',
      dados_preenchidos: { content: formData.content, data_curso: formData.data_curso },
      responsavel_empresa_nome: empresa.nome_responsavel,
      responsavel_empresa_assinatura_url: empresa.assinatura_responsavel_url,
      testemunha_1_nome: formData.t1_nome,
      testemunha_1_cpf: formData.t1_cpf,
      testemunha_2_nome: formData.t2_nome,
      testemunha_2_cpf: formData.t2_cpf,
      assinatura_colaborador_url: col?.assinatura_url,
      campos_editaveis_pdf: {},
      updated_by: user.id,
    }

    let docId = formData.id
    let novaVersao = 1

    if (docId) {
      novaVersao = (formData.versao_atual || 1) + 1
      payload.versao_atual = novaVersao
      await supabase.from('documento_gerado').update(payload).eq('id', docId)
      logAudit('documento_gerado', docId, 'update', user.id)
    } else {
      payload.created_by = user.id
      payload.versao_atual = 1
      const { data, error } = await supabase
        .from('documento_gerado')
        .insert(payload)
        .select()
        .single()
      if (data) {
        docId = data.id
        logAudit('documento_gerado', docId, 'create', user.id)
      }
    }

    if (docId) {
      await supabase.from('documento_versao').insert({
        documento_id: docId,
        versao: novaVersao,
        arquivo_pdf_url: '',
        dados_snapshot: payload,
        alterado_por_usuario_id: user.id,
      })
      toast({ title: 'Documento salvo com sucesso.' })
      setIsOpen(false)
      fetchData()
    }
  }

  const handleEditDocument = (doc: any) => {
    setFormData({
      id: doc.id,
      template_id: doc.modelo_id,
      colaborador_id: doc.colaborador_id || '',
      title: doc.titulo,
      content: doc.dados_preenchidos?.content || '',
      t1_nome: doc.testemunha_1_nome || '',
      t1_cpf: doc.testemunha_1_cpf || '',
      t2_nome: doc.testemunha_2_nome || '',
      t2_cpf: doc.testemunha_2_cpf || '',
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
        { nome: doc.testemunha_1_nome, cpf: doc.testemunha_1_cpf },
        { nome: doc.testemunha_2_nome, cpf: doc.testemunha_2_cpf },
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
      if (res.data?.pdfDataUri) {
        const a = document.createElement('a')
        a.href = res.data.pdfDataUri
        a.download = `${doc.titulo}.pdf`
        a.click()
        if (user) logAudit('documento_gerado', doc.id, 'export', user.id)
      }
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const selTemplate = templates.find((t) => t.id === formData.template_id)
  const selCol = employees.find((e) => e.id === formData.colaborador_id)

  const isContrato = selTemplate?.tipo_documento === 'Contrato'
  const isNR = selTemplate?.tipo_documento === 'NR'

  const missingCompanySig = isContrato && !empresa?.assinatura_responsavel_url
  const missingColSig = !!selCol && !selCol.assinatura_url

  const canSave =
    formData.template_id &&
    formData.colaborador_id &&
    !missingCompanySig &&
    !missingColSig &&
    (!isContrato || (formData.t1_nome && formData.t1_cpf && formData.t2_nome && formData.t2_cpf))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Repositório de Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Geração dinâmica com preenchimento via Template Engine
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              id: '',
              template_id: '',
              colaborador_id: '',
              title: '',
              content: '',
              t1_nome: '',
              t1_cpf: '',
              t2_nome: '',
              t2_cpf: '',
              data_curso: '',
              versao_atual: 1,
            })
            setIsOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Gerar Documento
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Exportar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
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
                      <Button variant="outline" size="sm" onClick={() => handleExportPDF(d)}>
                        <Download className="h-4 w-4 mr-2" /> PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 border rounded mt-2">
                  <p className="col-span-2 text-xs font-bold mb-1">Testemunhas Obrigatórias</p>
                  <div className="space-y-1">
                    <Label className="text-[10px]">T1 Nome</Label>
                    <Input
                      className="h-7 text-xs"
                      value={formData.t1_nome}
                      onChange={(e) => setFormData({ ...formData, t1_nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">T1 CPF</Label>
                    <Input
                      className="h-7 text-xs"
                      value={formData.t1_cpf}
                      onChange={(e) => setFormData({ ...formData, t1_cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">T2 Nome</Label>
                    <Input
                      className="h-7 text-xs"
                      value={formData.t2_nome}
                      onChange={(e) => setFormData({ ...formData, t2_nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">T2 CPF</Label>
                    <Input
                      className="h-7 text-xs"
                      value={formData.t2_cpf}
                      onChange={(e) => setFormData({ ...formData, t2_cpf: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {(missingCompanySig || missingColSig) && (
                <Alert variant="destructive" className="mt-4 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Assinaturas Obrigatórias Ausentes</AlertTitle>
                  <AlertDescription>
                    {missingCompanySig && (
                      <p>A empresa não possui assinatura do responsável configurada.</p>
                    )}
                    {missingColSig && <p>O colaborador não possui assinatura configurada.</p>}
                    Configure as assinaturas antes de gerar o documento.
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!canSave} onClick={handleGenerate}>
              Salvar Documento Final
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
