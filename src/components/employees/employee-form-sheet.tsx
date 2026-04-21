import { useState, useEffect } from 'react'
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
import { Trash2, ExternalLink, UploadCloud } from 'lucide-react'

interface DocState {
  expiry_date: string
  file_url?: string
  file?: File
}

function DocInput({
  label,
  docState,
  onChange,
}: {
  label: string
  docState: DocState
  onChange: (v: DocState) => void
}) {
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="font-medium text-xs">{label}</span>
        <Input
          type="date"
          className="w-[120px] h-7 text-xs px-2"
          value={docState.expiry_date || ''}
          onChange={(e) => onChange({ ...docState, expiry_date: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="cursor-pointer text-xs flex-1 flex items-center justify-center gap-2 border border-dashed rounded-md h-7 hover:bg-muted transition-colors px-2">
          <UploadCloud className="h-3 w-3" />
          <span className="truncate max-w-[80px]">
            {docState.file ? 'Selecionado' : docState.file_url ? 'Anexado' : 'Anexar'}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={(e) =>
              e.target.files?.[0] && onChange({ ...docState, file: e.target.files[0] })
            }
          />
        </Label>
        {(docState.file_url || docState.file) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={() => onChange({ ...docState, file: undefined, file_url: '' })}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
        {docState.file_url && !docState.file && (
          <a
            href={docState.file_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
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
  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cnpj: '',
    company_name: '',
    birth_date: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    role: '',
    contract_type: 'CLT',
    admission_date: '',
    observations: '',
  })

  const [docs, setDocs] = useState<Record<string, DocState>>({})
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      supabase
        .from('hr_roles')
        .select('*')
        .eq('company', company)
        .then(({ data }) => {
          if (data) setRoles(data)
        })

      if (employeeToEdit) {
        setData({
          name: employeeToEdit.name || '',
          email: employeeToEdit.email || '',
          phone: employeeToEdit.phone || '',
          cpf: employeeToEdit.cpf || '',
          rg: employeeToEdit.rg || '',
          cnpj: employeeToEdit.cnpj || '',
          company_name: employeeToEdit.company_name || '',
          birth_date: employeeToEdit.birth_date || '',
          cep: employeeToEdit.cep || '',
          logradouro: employeeToEdit.logradouro || '',
          numero: employeeToEdit.numero || '',
          complemento: employeeToEdit.complemento || '',
          bairro: employeeToEdit.bairro || '',
          cidade: employeeToEdit.cidade || '',
          uf: employeeToEdit.uf || '',
          role: employeeToEdit.role || '',
          role_id: employeeToEdit.role_id || '',
          contract_type: employeeToEdit.contract_type || 'CLT',
          admission_date: employeeToEdit.admission_date || '',
          observations: employeeToEdit.observations || '',
        })
        const d: Record<string, DocState> = {}
        employeeToEdit.employee_documents?.forEach((doc: any) => {
          d[doc.document_type] = {
            expiry_date: doc.expiry_date || '',
            file_url: doc.file_url || '',
          }
        })
        setDocs(d)
      } else {
        setData({
          name: '',
          email: '',
          phone: '',
          cpf: '',
          rg: '',
          cnpj: '',
          company_name: '',
          birth_date: '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          role: '',
          role_id: '',
          contract_type: 'CLT',
          admission_date: '',
          observations: '',
        })
        setDocs({})
      }
    }
  }, [open, employeeToEdit])

  const handleCep = async (val: string) => {
    setData((prev) => ({ ...prev, cep: val }))
    const cleanCep = val.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const viacep = await res.json()
        if (!viacep.erro) {
          setData((prev) => ({
            ...prev,
            logradouro: viacep.logradouro || prev.logradouro,
            bairro: viacep.bairro || prev.bairro,
            cidade: viacep.localidade || prev.cidade,
            uf: viacep.uf || prev.uf,
          }))
        }
      } catch (e) {
        console.error('Erro ao buscar CEP:', e)
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    let uploadedUrls: Record<string, string> = {}
    for (const [type, doc] of Object.entries(docs)) {
      if (doc.file) {
        const fileExt = doc.file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const { data: upData } = await supabase.storage
          .from('employee_documents')
          .upload(fileName, doc.file)
        if (upData) {
          const { data: pubData } = supabase.storage
            .from('employee_documents')
            .getPublicUrl(fileName)
          uploadedUrls[type] = pubData.publicUrl
        }
      } else if (doc.file_url) {
        uploadedUrls[type] = doc.file_url
      }
    }

    const selectedRole = roles.find((r) => r.id === data.role_id)

    const payload = {
      ...data,
      birth_date: data.birth_date || null,
      admission_date: data.admission_date || null,
      role: selectedRole ? selectedRole.name : data.role || 'Colaborador',
      role_id: data.role_id || null,
    }

    const otherCompany = company === 'Primer Pisos' ? 'Piso Plano' : 'Primer Pisos'
    let createdIds: string[] = []

    if (employeeToEdit?.id) {
      await supabase.from('employees').update(payload).eq('id', employeeToEdit.id)
      createdIds.push(employeeToEdit.id)
    } else {
      const { data: insData } = await supabase
        .from('employees')
        .insert([
          { ...payload, company },
          { ...payload, company: otherCompany },
        ])
        .select()
      if (insData) createdIds = insData.map((e) => e.id)
    }

    if (createdIds.length > 0) {
      if (employeeToEdit?.id) {
        await supabase.from('employee_documents').delete().eq('employee_id', employeeToEdit.id)
      }

      const docInserts: any[] = []
      createdIds.forEach((empId) => {
        Object.entries(docs).forEach(([type, doc]) => {
          if (doc.expiry_date || uploadedUrls[type]) {
            docInserts.push({
              employee_id: empId,
              document_type: type,
              expiry_date: doc.expiry_date || null,
              file_url: uploadedUrls[type] || null,
            })
          }
        })
      })
      if (docInserts.length > 0) await supabase.from('employee_documents').insert(docInserts)
      onSave()
      setOpen(false)
    }
    setLoading(false)
  }

  const maskPhone = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    if (v.length > 5) return v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
    if (v.length > 0) return v.replace(/^(\d{0,2})$/, '($1')
    return v
  }

  const maskCNPJ = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 14) v = v.slice(0, 14)
    return v.replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?$/, (m, p1, p2, p3, p4, p5) => {
      let r = p1
      if (p2) r += `.${p2}`
      if (p3) r += `.${p3}`
      if (p4) r += `/${p4}`
      if (p5) r += `-${p5}`
      return r
    })
  }

  const maskCEP = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 8) v = v.slice(0, 8)
    if (v.length > 5) return v.replace(/^(\d{5})(\d{1,3})$/, '$1-$2')
    return v
  }

  const renderInputRow = (label: string, field: keyof typeof data, type = 'text', span = 1) => (
    <div className={`space-y-1.5 ${span === 2 ? 'sm:col-span-2' : ''}`}>
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={data[field]}
        onChange={(e) => {
          let val = e.target.value
          if (field === 'phone') val = maskPhone(val)
          if (field === 'cnpj') val = maskCNPJ(val)
          if (field === 'cep') val = maskCEP(val)

          if (field === 'cep') {
            handleCep(val)
          } else {
            setData({ ...data, [field]: val })
          }
        }}
        className="h-8 text-sm"
      />
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{employeeToEdit ? 'Editar Colaborador' : 'Cadastrar Colaborador'}</SheetTitle>
          <SheetDescription>
            Preencha os dados e anexe documentos.{' '}
            {employeeToEdit ? '' : 'Será espelhado para a outra empresa.'}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-8 flex-1">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary uppercase">Dados Pessoais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInputRow('Nome Completo', 'name', 'text', 2)}
              {renderInputRow('E-mail', 'email', 'email')}
              {renderInputRow('Celular', 'phone')}
              {renderInputRow('CPF', 'cpf')}
              {renderInputRow('RG', 'rg')}
              {renderInputRow('Data de Nasc.', 'birth_date', 'date')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {renderInputRow('Nome da Empresa / Razão Social', 'company_name', 'text', 1)}
              {renderInputRow('CNPJ', 'cnpj')}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary uppercase">Endereço</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInputRow('CEP', 'cep')}
              {renderInputRow('Logradouro', 'logradouro')}
              {renderInputRow('Número', 'numero')}
              {renderInputRow('Complemento', 'complemento')}
              {renderInputRow('Bairro', 'bairro')}
              <div className="grid grid-cols-2 gap-2">
                {renderInputRow('Cidade', 'cidade')}
                {renderInputRow('UF', 'uf')}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary uppercase">Vínculo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Cargo/Função</Label>
                <Select
                  value={data.role_id || ''}
                  onValueChange={(v) => setData({ ...data, role_id: v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de Vínculo</Label>
                <Select
                  value={data.contract_type}
                  onValueChange={(v) => setData({ ...data, contract_type: v })}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="MEI">MEI</SelectItem>
                    <SelectItem value="LTDA">LTDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderInputRow('Data de Admissão', 'admission_date', 'date')}
            </div>
            <div className="space-y-1.5 mt-2">
              <Label className="text-xs">Observações</Label>
              <Textarea
                rows={2}
                value={data.observations}
                onChange={(e) => setData({ ...data, observations: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <h4 className="text-sm font-semibold text-primary uppercase">Documentos e Validades</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['ASO', 'NR-35', 'NR-06', 'NR-12', 'NR-18', 'OS'].map((type) => (
                <DocInput
                  key={type}
                  label={type}
                  docState={docs[type] || { expiry_date: '' }}
                  onChange={(v) => setDocs({ ...docs, [type]: v })}
                />
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 border-t sticky bottom-0 bg-background z-10">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={loading || !data.name} onClick={handleSave}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
