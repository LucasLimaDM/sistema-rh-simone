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
import { FileText, Plus, Download } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function Documents() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    template_id: '',
    employee_id: '',
    title: '',
    content: '',
  })
  const { toast } = useToast()

  const fetchData = async () => {
    const [docsRes, tempsRes, empsRes, profRes] = await Promise.all([
      supabase
        .from('hr_generated_documents')
        .select('*, employees(name)')
        .eq('company', company)
        .order('created_at', { ascending: false }),
      supabase.from('hr_document_templates').select('*').eq('company', company),
      supabase.from('employees').select('*').eq('company', company).eq('status', 'ativo'),
      supabase.from('hr_profiles').select('*').eq('id', user?.id).maybeSingle(),
    ])
    if (docsRes.data) setDocuments(docsRes.data)
    if (tempsRes.data) setTemplates(tempsRes.data)
    if (empsRes.data) setEmployees(empsRes.data)
    if (profRes.data) setProfile(profRes.data)
  }

  useEffect(() => {
    fetchData()
  }, [company, user])

  const handleTemplateSelect = (tempId: string) => {
    const temp = templates.find((t) => t.id === tempId)
    const emp = employees.find((e) => e.id === formData.employee_id)
    let content = temp?.content || ''

    if (emp) {
      content = content
        .replace(/{{NOME_COLABORADOR}}/g, emp.name)
        .replace(/{{CARGO}}/g, emp.role)
        .replace(/{{CPF}}/g, emp.cpf || 'Não informado')
        .replace(/{{NOME_EMPRESA}}/g, company)
    }

    setFormData({ ...formData, template_id: tempId, title: temp?.title || '', content })
  }

  const handleEmployeeSelect = (empId: string) => {
    const temp = templates.find((t) => t.id === formData.template_id)
    const emp = employees.find((e) => e.id === empId)
    let content = temp?.content || formData.content

    if (emp) {
      content = content
        .replace(/{{NOME_COLABORADOR}}/g, emp.name)
        .replace(/{{CARGO}}/g, emp.role)
        .replace(/{{CPF}}/g, emp.cpf || 'Não informado')
        .replace(/{{NOME_EMPRESA}}/g, company)
    }

    setFormData({ ...formData, employee_id: empId, content })
  }

  const handleGenerate = async () => {
    const { error } = await supabase.from('hr_generated_documents').insert({
      template_id: formData.template_id,
      employee_id: formData.employee_id,
      title: formData.title,
      content: formData.content,
      company: company,
      status: 'Gerado',
    })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Documento gerado com sucesso no repositório.' })
      setIsOpen(false)
      fetchData()
    }
  }

  const handleExportPDF = async (doc: any) => {
    toast({ title: 'Gerando PDF...', description: 'Aguarde um momento.' })
    const template = templates.find((t) => t.id === doc.template_id)

    try {
      const res = await supabase.functions.invoke('generate-hr-pdf', {
        body: {
          title: doc.title,
          content: doc.content,
          company: doc.company,
          category: template?.category || 'Documento',
          signatureUrl: profile?.signature_url || null,
          hasEditableFields: template?.category === 'Contrato',
        },
      })

      if (res.error) throw res.error

      if (res.data && res.data.pdfDataUri) {
        const a = document.createElement('a')
        a.href = res.data.pdfDataUri
        a.download = `${doc.title}.pdf`
        a.click()
      } else {
        throw new Error('Falha no formato do arquivo recebido.')
      }
    } catch (e: any) {
      toast({ title: 'Erro ao gerar PDF', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Repositório de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere e gerencie documentos de RH unificados para {company}
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ template_id: '', employee_id: '', title: '', content: '' })
            setIsOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Gerar Documento
        </Button>
      </div>

      <Card className="shadow-sm border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {d.title}
                  </TableCell>
                  <TableCell>{d.employees?.name || '-'}</TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportPDF(d)}>
                      <Download className="h-4 w-4 mr-2" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum documento gerado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerar Novo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Colaborador Alvo</Label>
                <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} - {e.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo de Documento</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={handleTemplateSelect}
                  disabled={!formData.employee_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title} ({t.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título do Documento</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pré-visualização (Editável para ajustes pontuais)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[300px] font-mono text-sm bg-muted/20"
                placeholder="O conteúdo do modelo preenchido aparecerá aqui..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!formData.template_id || !formData.employee_id}
            >
              Salvar no Repositório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
