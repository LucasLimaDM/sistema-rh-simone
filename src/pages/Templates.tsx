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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useOutletContext } from 'react-router-dom'
import { AppContextType } from '@/lib/types'
import { FileText, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Templates() {
  const { company } = useOutletContext<AppContextType>()
  const [templates, setTemplates] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [formData, setFormData] = useState({ id: '', title: '', category: 'Contrato', content: '' })
  const { toast } = useToast()

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('hr_document_templates')
      .select('*')
      .eq('company', company)
      .order('created_at', { ascending: false })
    if (data) setTemplates(data)
  }

  useEffect(() => {
    fetchTemplates()
  }, [company])

  const handleSave = async () => {
    const isNew = !formData.id
    const payload = {
      title: formData.title,
      category: formData.category,
      content: formData.content,
      company: company,
    }

    let error
    if (isNew) {
      const res = await supabase.from('hr_document_templates').insert(payload)
      error = res.error
    } else {
      const res = await supabase.from('hr_document_templates').update(payload).eq('id', formData.id)
      error = res.error
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Modelo salvo com sucesso.' })
      setIsOpen(false)
      fetchTemplates()
    }
  }

  const handleDeleteBatch = async () => {
    if (!selectedIds.length) return
    const { error } = await supabase.from('hr_document_templates').delete().in('id', selectedIds)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: `${selectedIds.length} modelos excluídos.` })
      setSelectedIds([])
      fetchTemplates()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Modelos de Documentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie templates para {company}</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteBatch}>
              <Trash2 className="h-4 w-4 mr-2" /> Excluir ({selectedIds.length})
            </Button>
          )}
          <Button
            onClick={() => {
              setFormData({ id: '', title: '', category: 'Contrato', content: '' })
              setIsOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Modelo
          </Button>
        </div>
      </div>

      <Alert className="bg-orange-50 border-orange-200 text-orange-800">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle>Dica de Preenchimento Automático</AlertTitle>
        <AlertDescription>
          Use as tags{' '}
          <code className="bg-orange-100 px-1 rounded font-bold">{'{{NOME_COLABORADOR}}'}</code>,{' '}
          <code className="bg-orange-100 px-1 rounded font-bold">{'{{CARGO}}'}</code>,{' '}
          <code className="bg-orange-100 px-1 rounded font-bold">{'{{CPF}}'}</code> e{' '}
          <code className="bg-orange-100 px-1 rounded font-bold">{'{{NOME_EMPRESA}}'}</code> para
          preenchimento contextual dinâmico na hora da geração.
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === templates.length && templates.length > 0}
                    onCheckedChange={(c) => setSelectedIds(c ? templates.map((t) => t.id) : [])}
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(t.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) =>
                          c ? [...prev, t.id] : prev.filter((id) => id !== t.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {t.title}
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>v{t.version}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(t)
                        setIsOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum modelo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título do Modelo</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Contrato de Trabalho CLT"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contrato">Contrato</SelectItem>
                    <SelectItem value="OS">Ordem de Serviço</SelectItem>
                    <SelectItem value="NR">NR's</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo do Documento</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Insira o texto do documento com as tags..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.content}>
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
