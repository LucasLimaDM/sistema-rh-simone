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
import { FileText, Plus, AlertCircle, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'

export default function Templates() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [empId, setEmpId] = useState<string>('')
  const [templates, setTemplates] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    tipo_documento: 'Contrato',
    content: '',
    versao_atual: 1,
  })
  const { toast } = useToast()

  const fetchTemplates = async () => {
    const { data: emp } = await supabase
      .from('empresa_contratante')
      .select('id')
      .eq('nome_fantasia', company)
      .single()
    if (emp) {
      setEmpId(emp.id)
      const { data } = await supabase
        .from('modelo')
        .select('*')
        .eq('empresa_id', emp.id)
        .order('created_at', { ascending: false })
      if (data) setTemplates(data)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [company])

  const handleSave = async () => {
    const isNew = !formData.id
    const payload = {
      empresa_id: empId,
      nome: formData.nome,
      tipo_documento: formData.tipo_documento,
      campos_config: { content: formData.content },
      versao_atual: isNew ? 1 : formData.versao_atual + 1,
      arquivo_original_url: 'template_html',
      placeholders: {},
      regras_autopreenchimento: {},
      regras_assinatura: {},
      campos_editaveis_pdf: {},
      ativo: true,
    }

    let modelId = formData.id
    if (isNew) {
      const res = await supabase.from('modelo').insert(payload).select().single()
      if (res.data) modelId = res.data.id
      if (user && res.data) logAudit('modelo', modelId, 'create', user.id, null, res.data)
    } else {
      await supabase.from('modelo').update(payload).eq('id', formData.id)
      if (user) logAudit('modelo', formData.id, 'update', user.id, null, payload)
    }

    if (modelId && user) {
      await supabase.from('modelo_versao').insert({
        modelo_id: modelId,
        versao: payload.versao_atual,
        arquivo_url: 'template_html',
        campos_config_snapshot: payload.campos_config,
        alterado_por_usuario_id: user.id,
      })
    }

    toast({ title: 'Sucesso', description: 'Modelo salvo com versão atualizada.' })
    setIsOpen(false)
    fetchTemplates()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este modelo?')) return
    await supabase.from('modelo').delete().eq('id', id)
    if (user) logAudit('modelo', id, 'delete', user.id)
    fetchTemplates()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Modelos Documentais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie Contratos, OS e NRs dinâmicos para {company}
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              id: '',
              nome: '',
              tipo_documento: 'Contrato',
              content: '',
              versao_atual: 1,
            })
            setIsOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Modelo
        </Button>
      </div>

      <Alert className="bg-orange-50 border-orange-200 text-orange-800">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle>Tags Inteligentes Disponíveis</AlertTitle>
        <AlertDescription className="text-xs mt-2 font-mono space-y-1">
          <p>{`{{NOME_EMPRESA}}, {{CNPJ_EMPRESA}}, {{RESPONSAVEL_EMPRESA}}`}</p>
          <p>{`{{NOME_COLABORADOR}}, {{CPF_COLABORADOR}}, {{RG_COLABORADOR}}`}</p>
          <p>{`{{CARGO_NOME}}, {{CARGO_DESCRICAO}}, {{VALOR_HORA}}, {{VALOR_DIARIA}}`}</p>
          <p>As testemunhas e assinaturas de contratos são adicionadas automaticamente no PDF.</p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nome do Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {t.nome}
                  </TableCell>
                  <TableCell>{t.tipo_documento}</TableCell>
                  <TableCell>v{t.versao_atual}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData({
                          id: t.id,
                          nome: t.nome,
                          tipo_documento: t.tipo_documento,
                          content: t.campos_config?.content || '',
                          versao_atual: t.versao_atual,
                        })
                        setIsOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {formData.id ? `Editar Modelo (Gerará v${formData.versao_atual + 1})` : 'Novo Modelo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Modelo</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select
                value={formData.tipo_documento}
                onValueChange={(v) => setFormData({ ...formData, tipo_documento: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                  <SelectItem value="OrdemServico">Ordem de Serviço</SelectItem>
                  <SelectItem value="NR">NRs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Conteúdo HTML/Texto</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[300px] font-mono text-xs leading-tight"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!formData.nome || !formData.content} onClick={handleSave}>
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
