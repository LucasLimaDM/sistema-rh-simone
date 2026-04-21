import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function DocInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
      <span className="font-medium text-xs whitespace-nowrap">{label}</span>
      <Input
        type="date"
        className="w-[130px] h-7 text-xs px-2"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function EmployeeFormSheet({
  company,
  onSave,
  employeeToEdit,
  open,
  setOpen,
}: {
  company: string
  onSave: () => void
  employeeToEdit?: any
  open: boolean
  setOpen: (val: boolean) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [rg, setRg] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [role, setRole] = useState('')
  const [contractType, setContractType] = useState('CLT')
  const [admissionDate, setAdmissionDate] = useState('')
  const [observations, setObservations] = useState('')
  const [docs, setDocs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        setName(employeeToEdit.name || '')
        setEmail(employeeToEdit.email || '')
        setCpf(employeeToEdit.cpf || '')
        setRg(employeeToEdit.rg || '')
        setCnpj(employeeToEdit.cnpj || '')
        setBirthDate(employeeToEdit.birth_date || '')
        setAddress(employeeToEdit.address || '')
        setRole(employeeToEdit.role || '')
        setContractType(employeeToEdit.contract_type || 'CLT')
        setAdmissionDate(employeeToEdit.admission_date || '')
        setObservations(employeeToEdit.observations || '')
        const d: Record<string, string> = {}
        employeeToEdit.employee_documents?.forEach((doc: any) => {
          if (doc.expiry_date) d[doc.document_type] = doc.expiry_date
        })
        setDocs(d)
      } else {
        setName('')
        setEmail('')
        setCpf('')
        setRg('')
        setCnpj('')
        setBirthDate('')
        setAddress('')
        setRole('')
        setContractType('CLT')
        setAdmissionDate('')
        setObservations('')
        setDocs({})
      }
    }
  }, [open, employeeToEdit])

  const isUnder18 = useMemo(() => {
    if (!birthDate) return false
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
    return age < 18
  }, [birthDate])

  const handleSave = async () => {
    setLoading(true)
    const payload = {
      company,
      name,
      email,
      cpf,
      rg,
      cnpj,
      birth_date: birthDate || null,
      address,
      role: role || 'Colaborador',
      contract_type: contractType,
      admission_date: admissionDate || null,
      observations,
    }

    let empId = employeeToEdit?.id
    if (empId) {
      await supabase.from('employees').update(payload).eq('id', empId)
    } else {
      const { data } = await supabase.from('employees').insert(payload).select().single()
      if (data) empId = data.id
    }

    if (empId) {
      await supabase.from('employee_documents').delete().eq('employee_id', empId)
      const docInserts = Object.entries(docs)
        .filter(([_, date]) => !!date)
        .map(([type, date]) => ({
          employee_id: empId,
          document_type: type,
          expiry_date: date,
        }))
      if (docInserts.length > 0) {
        await supabase.from('employee_documents').insert(docInserts)
      }
      onSave()
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{employeeToEdit ? 'Editar Colaborador' : 'Cadastrar Colaborador'}</SheetTitle>
          <SheetDescription>
            Preencha os dados cadastrais e as validades dos documentos. Todos os campos são
            opcionais.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome Completo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>CPF</Label>
                <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>RG</Label>
                <Input value={rg} onChange={(e) => setRg(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
                {isUnder18 && (
                  <p className="text-xs text-destructive">Atenção: Menor de 18 anos.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Vínculo e Admissão
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cargo/Função</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Vínculo</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="MEI">MEI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data de Admissão</Label>
                <Input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Validade de Documentos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DocInput
                label="ASO"
                value={docs['ASO']}
                onChange={(v) => setDocs({ ...docs, ASO: v })}
              />
              <DocInput
                label="NR-35"
                value={docs['NR-35']}
                onChange={(v) => setDocs({ ...docs, 'NR-35': v })}
              />
              <DocInput
                label="NR-06"
                value={docs['NR-06']}
                onChange={(v) => setDocs({ ...docs, 'NR-06': v })}
              />
              <DocInput
                label="NR-12"
                value={docs['NR-12']}
                onChange={(v) => setDocs({ ...docs, 'NR-12': v })}
              />
              <DocInput
                label="NR-18"
                value={docs['NR-18']}
                onChange={(v) => setDocs({ ...docs, 'NR-18': v })}
              />
              <DocInput
                label="Ord. Serviço"
                value={docs['OS']}
                onChange={(v) => setDocs({ ...docs, OS: v })}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-2 pb-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={loading || !name} onClick={handleSave}>
            {loading ? 'Salvando...' : 'Salvar Colaborador'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
