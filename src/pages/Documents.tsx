import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import {
  FileText,
  Plus,
  Download,
  Edit2,
  AlertCircle,
  Trash2,
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'
import { cn } from '@/lib/utils'

export default function Documents() {
  const { company } = useOutletContext<AppContextType>()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [empresa, setEmpresa] = useState<any>(null)
  const [witnesses, setWitnesses] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [colOpen, setColOpen] = useState(false)
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
    setLoading(true)
    setError(null)
    try {
      const empList = await pb.collection('companies').getFullList({ filter: `name="${company}"` })
      const emp = empList[0]

      if (emp) {
        setEmpresa(emp)
        const docsPromise = pb.collection('contracts').getFullList({
          filter: `company_id="${emp.id}"`,
          expand: 'collaborator_id',
          sort: '-created',
        })
        const tempsPromise = pb
          .collection('templates')
          .getFullList({ filter: `company_id="${emp.id}"` })
        const colsPromise = pb
          .collection('collaborators')
          .getFullList({ filter: `company_id="${emp.id}"` })
        const witPromise = pb.collection('witnesses').getFullList()

        const [docsData, tempsData, colsData, witData] = await Promise.all([
          docsPromise,
          tempsPromise,
          colsPromise,
          witPromise,
        ])
        setDocuments(docsData)
        setTemplates(tempsData)
        setEmployees(colsData)
        setWitnesses(witData)
      } else {
        setEmpresa(null)
        setDocuments([])
      }
    } catch (err: any) {
      setError('Erro ao carregar dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [company])

  const processContent = (tempId: string, colId: string, dataCurso: string = '') => {
    const template = templates.find((t) => t.id === tempId)
    const col = employees.find((e) => e.id === colId)
    let content = template?.content || ''

    if (col && empresa) {
      content = content
        .replace(/{{NOME_EMPRESA}}/gi, empresa.name || '')
        .replace(/{{CNPJ_EMPRESA}}/gi, empresa.cnpj || '')
        .replace(/{{NOME_COLABORADOR}}/gi, col.name || '')
        .replace(/{{CPF_COLABORADOR}}/gi, col.cpf || '')
        .replace(
          /{{DATA_CURSO}}/gi,
          dataCurso ? new Date(dataCurso).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
        )
    }

    setFormData((prev) => ({
      ...prev,
      template_id: tempId,
      colaborador_id: colId,
      title: prev.title || template?.name || '',
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

    setIsGenerating(true)

    try {
      let docId = formData.id
      let novaVersao = (formData.versao_atual || 0) + 1

      const payload: any = {
        title: formData.title,
        company_id: empresa.id,
        collaborator_id: col.id,
        template_id: template.id,
        version: novaVersao,
        status: 'finalizado',
      }

      if (docId) {
        await pb.collection('contracts').update(docId, payload)
        logAudit('contracts', docId, 'update', user.id)
      } else {
        const saved = await pb.collection('contracts').create(payload)
        docId = saved.id
        logAudit('contracts', docId, 'create', user.id)
      }

      // Generate a mock PDF Blob since edge function is replaced
      const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Documento migrado para PDF cliente) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n331\n%%EOF`
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const fileFd = new FormData()
      fileFd.append('file', blob, `documento_v${novaVersao}.pdf`)
      await pb.collection('contracts').update(docId, fileFd)

      toast({ title: 'Sucesso', description: 'Documento salvo com sucesso.' })
      setIsOpen(false)
      fetchData()
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
    setFormData({
      id: doc.id,
      template_id: doc.template_id,
      colaborador_id: doc.collaborator_id || '',
      title: doc.title,
      content: '', // Re-parse or just leave empty if it's only PDF
      t1_id: '',
      t2_id: '',
      data_curso: '',
      versao_atual: doc.version || 1,
    })
    setIsOpen(true)
  }

  const handleDownload = (doc: any) => {
    if (doc.file) {
      window.open(pb.files.getUrl(doc, doc.file), '_blank')
    } else {
      toast({ title: 'Aviso', description: 'Arquivo PDF não encontrado.' })
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
    try {
      if (docToDelete) {
        await pb.collection('contracts').delete(docToDelete)
        toast({ title: 'Sucesso', description: 'Documento excluído.' })
        if (user) logAudit('contracts', docToDelete, 'delete', user.id)
      } else if (selectedDocs.length > 0) {
        for (const id of selectedDocs) {
          await pb.collection('contracts').delete(id)
        }
        toast({ title: 'Sucesso', description: 'Documentos excluídos.' })
        setSelectedDocs([])
      }
      fetchData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
    setDeleteConfirmOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={fetchData}>Tentar novamente</Button>
      </div>
    )
  }

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
                      aria-label={`Selecionar ${d.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <FileText className="h-4 w-4 inline mr-2 text-primary" /> {d.title}
                  </TableCell>
                  <TableCell>{d.expand?.collaborator_id?.name || 'Desconhecido'}</TableCell>
                  <TableCell>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                      {d.status || 'Gerado'} v{d.version || 1}
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
              <div className="space-y-2 flex flex-col">
                <Label>Colaborador</Label>
                <Popover open={colOpen} onOpenChange={setColOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={colOpen}
                      className="w-full justify-between font-normal"
                    >
                      {formData.colaborador_id
                        ? employees.find((e) => e.id === formData.colaborador_id)?.name
                        : 'Buscar colaborador...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Digite o nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                        <CommandGroup>
                          {employees.map((e) => (
                            <CommandItem
                              key={e.id}
                              value={e.name}
                              onSelect={() => {
                                processContent(formData.template_id, e.id, formData.data_curso)
                                setColOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.colaborador_id === e.id ? 'opacity-100' : 'opacity-0',
                                )}
                              />
                              {e.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                        {t.name} ({t.document_type})
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
