import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { maskCPF } from '@/lib/utils'

export function EmployeeFormSheet({
  open,
  setOpen,
  company,
  empresaId,
  employeeToEdit,
  onSave,
}: any) {
  const [formData, setFormData] = useState<any>({ active: true })
  const [roles, setRoles] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (employeeToEdit) setFormData(employeeToEdit)
      else setFormData({ active: true })

      if (empresaId) {
        pb.collection('roles')
          .getFullList({ filter: `company_id = "${empresaId}"` })
          .then(setRoles)
          .catch(console.error)
      }
    }
  }, [employeeToEdit, open, empresaId])

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        role_id: formData.role_id,
        salary: Number(formData.salary) || 0,
        admission_date: formData.admission_date || null,
        active: formData.active,
        company_id: empresaId,
      }

      if (formData.id) {
        await pb.collection('collaborators').update(formData.id, payload)
      } else {
        await pb.collection('collaborators').create(payload)
      }
      toast({ title: 'Sucesso', description: 'Colaborador salvo com sucesso.' })
      setOpen(false)
      onSave()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{employeeToEdit ? 'Editar' : 'Novo'} Colaborador</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              value={formData.cpf || ''}
              onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select
              value={formData.role_id || ''}
              onValueChange={(v) => setFormData({ ...formData, role_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Salário (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.salary || ''}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data de Admissão</Label>
            <Input
              type="date"
              value={formData.admission_date?.substring(0, 10) || ''}
              onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={String(formData.active)}
              onValueChange={(v) => setFormData({ ...formData, active: v === 'true' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="mt-8">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
