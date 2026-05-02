import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, UploadCloud } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'
import { maskCPF, maskCNPJ, maskPhone } from '@/lib/utils'

const maskCEP = (v: string) => {
  let val = v.replace(/\D/g, '')
  if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2')
  return val.slice(0, 9)
}

interface DocFile {
  id?: string
  file?: File
  file_url?: string
  name: string
}

interface DocState {
  expiry_date: string
  files: DocFile[]
}

const DOCUMENT_TYPES = [
  'CONTRATOS',
  'ASO',
  'NR-35',
  'OS',
  'CNPJ',
  'RG',
  'CPF',
  'COMPROVANTE DE RESIDÊNCIA',
  'NR-6',
  'NR-12',
  'NR-18',
  'EPI',
  'VACINAS',
  'CNDs',
]

export function EmployeeFormSheet({
  company,
  empresaId,
  onSave,
  employeeToEdit,
  open,
  setOpen,
}: {
  company: string
  empresaId: string
  onSave: () => void
  employeeToEdit?: any
  open: boolean
  setOpen: (val: boolean) => void
}) {
  const { user } = useAuth()
  const [data, setData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    cpf: '',
    rg: '',
    cnpj: '',
    data_nascimento: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cargo_id: '',
    tipo_colaborador: 'PF',
    razao_social: '',
    admission_date: '',
    observations: '',
  })
  const [docs, setDocs] = useState<Record<string, DocState>>({})
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      supabase
        .from('empresa_contratante')
        .select('id, nome_fantasia')
        .then(({ data }) => {
          if (data) {
            setAllCompanies(data)
            if (!employeeToEdit) {
              const defaults = data
                .filter((c) => {
                  const nf = c.nome_fantasia?.toLowerCase() || ''
                  return nf.includes('primer pisos') || nf.includes('piso plano')
                })
                .map((c) => c.id)
              const initial = Array.from(new Set([...defaults, empresaId].filter(Boolean)))
              setSelectedEmpresas(initial)
            }
          }
        })
      if (employeeToEdit) {
        const vinculadas = employeeToEdit.dados_dinamicos?.empresas_vinculadas || [
          employeeToEdit.empresa_id,
        ]
        setSelectedEmpresas(vinculadas)
      } else {
        setSelectedEmpresas(empresaId ? [empresaId] : [])
      }
    }
  }, [open, employeeToEdit, empresaId])

  useEffect(() => {
    if (open && allCompanies.length > 0) {
      const empIdsToFetch =
        selectedEmpresas.length > 0 ? selectedEmpresas : empresaId ? [empresaId] : []
      if (empIdsToFetch.length > 0) {
        supabase
          .from('cargo')
          .select('*')
          .in('empresa_id', empIdsToFetch)
          .then(({ data }) => {
            if (data) {
              const roleOptions = data.map((r) => {
                const cleanName = r.nome.replace(/\s*\(.*?\)\s*/g, '').trim()
                return {
                  ...r,
                  displayName: cleanName,
                  nome_limpo: cleanName,
                }
              })
              if (employeeToEdit?.cargo_id) {
                roleOptions.sort((a, b) =>
                  a.id === employeeToEdit.cargo_id ? -1 : b.id === employeeToEdit.cargo_id ? 1 : 0,
                )
              }
              const uniqueRoles = roleOptions.filter(
                (role, index, self) =>
                  index === self.findIndex((t) => t.nome_limpo === role.nome_limpo),
              )
              setRoles(uniqueRoles)
            }
          })
      } else {
        setRoles([])
      }
    }
  }, [open, selectedEmpresas, empresaId, allCompanies, employeeToEdit])

  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        setData({
          nome_completo: employeeToEdit.nome_completo || '',
          email: employeeToEdit.email || '',
          telefone: employeeToEdit.telefone || '',
          cpf: employeeToEdit.cpf || '',
          rg: employeeToEdit.rg || '',
          cnpj: employeeToEdit.cnpj || '',
          data_nascimento: employeeToEdit.data_nascimento || '',
          cep: employeeToEdit.endereco?.cep || '',
          logradouro: employeeToEdit.endereco?.logradouro || '',
          numero: employeeToEdit.endereco?.numero || '',
          complemento: employeeToEdit.endereco?.complemento || '',
          bairro: employeeToEdit.endereco?.bairro || '',
          cidade: employeeToEdit.endereco?.cidade || '',
          uf: employeeToEdit.endereco?.uf || '',
          cargo_id: employeeToEdit.cargo_id || '',
          tipo_colaborador: employeeToEdit.tipo_colaborador || 'PF',
          razao_social:
            employeeToEdit.dados_dinamicos?.razao_social ||
            employeeToEdit.employees?.company_name ||
            '',
          admission_date: employeeToEdit.dados_dinamicos?.admission_date || '',
          observations: employeeToEdit.dados_dinamicos?.observations || '',
        })
        const d: Record<string, DocState> = {}
        employeeToEdit.employee_documents?.forEach((doc: any) => {
          if (!d[doc.document_type])
            d[doc.document_type] = { expiry_date: doc.expiry_date || '', files: [] }
          if (doc.file_url) {
            d[doc.document_type].files.push({
              id: doc.id,
              file_url: doc.file_url,
              name: doc.file_url.split('/').pop() || 'Documento',
            })
          }
        })
        setDocs(d)
      } else {
        setData({
          nome_completo: '',
          email: '',
          telefone: '',
          cpf: '',
          rg: '',
          cnpj: '',
          data_nascimento: '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cargo_id: '',
          tipo_colaborador: 'PF',
          razao_social: '',
          admission_date: '',
          observations: '',
        })
        setDocs({})
      }
    }
  }, [open, employeeToEdit])

  const handleCep = async (val: string) => {
    const masked = maskCEP(val)
    setData((prev) => ({ ...prev, cep: masked }))
    const cleanCep = masked.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const viacep = await res.json()
        if (!viacep.erro)
          setData((prev) => ({
            ...prev,
            logradouro: viacep.logradouro || prev.logradouro,
            bairro: viacep.bairro || prev.bairro,
            cidade: viacep.localidade || prev.cidade,
            uf: viacep.uf || prev.uf,
          }))
      } catch {
        /* ignore */
      }
    }
  }

  const handleSave = async () => {
    if (selectedEmpresas.length === 0) return
    setLoading(true)
    const primaryEmpresaId = selectedEmpresas[0]
    const selectedRole = roles.find((r) => r.id === data.cargo_id)
    const newId = employeeToEdit?.id || crypto.randomUUID()
    const companyNames =
      allCompanies
        .filter((c) => selectedEmpresas.includes(c.id))
        .map((c) => c.nome_fantasia)
        .join(', ') || company

    const payload = {
      empresa_id: primaryEmpresaId,
      nome_completo: data.nome_completo,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      rg: data.rg,
      cnpj: data.cnpj,
      data_nascimento: data.data_nascimento || null,
      tipo_colaborador: data.tipo_colaborador,
      cargo_id: data.cargo_id,
      cargo_nome_snapshot: selectedRole?.nome_limpo || selectedRole?.nome || '',
      cargo_descricao_snapshot: selectedRole?.descricao_rich_text || {},
      valor_hora_snapshot: selectedRole?.valor_hora || 0,
      valor_diaria_snapshot: selectedRole?.valor_diaria || 0,
      endereco: {
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
      },
      dados_dinamicos: {
        admission_date: data.admission_date,
        observations: data.observations,
        razao_social: data.razao_social,
        empresas_vinculadas: selectedEmpresas,
      },
      ativo: true,
    }

    if (!employeeToEdit?.id) {
      await supabase.from('employees').insert({
        id: newId,
        name: data.nome_completo,
        company: companyNames,
        contract_type: data.tipo_colaborador,
        role: selectedRole?.nome_limpo || selectedRole?.nome || 'Colaborador',
        status: 'ativo',
        company_name: ['MEI', 'Ltda.'].includes(data.tipo_colaborador) ? data.razao_social : null,
      })
      await supabase.from('colaborador').insert({ id: newId, ...payload })
      if (user) await logAudit('colaborador', newId, 'create', user.id, null, payload)
    } else {
      await supabase
        .from('employees')
        .update({
          name: data.nome_completo,
          contract_type: data.tipo_colaborador,
          role: selectedRole?.nome_limpo || selectedRole?.nome || 'Colaborador',
          company: companyNames,
          company_name: ['MEI', 'Ltda.'].includes(data.tipo_colaborador) ? data.razao_social : null,
        })
        .eq('id', newId)
      await supabase.from('colaborador').update(payload).eq('id', newId)
      if (user) await logAudit('colaborador', newId, 'update', user.id, null, payload)
    }

    await supabase.from('employee_documents').delete().eq('employee_id', newId)
    const docInserts: any[] = []

    for (const [type, docState] of Object.entries(docs)) {
      for (const docFile of docState.files) {
        let finalUrl = docFile.file_url
        if (docFile.file) {
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${docFile.file.name.split('.').pop()}`
          const { data: upData } = await supabase.storage
            .from('employee_documents')
            .upload(fileName, docFile.file)
          if (upData)
            finalUrl = supabase.storage.from('employee_documents').getPublicUrl(fileName)
              .data.publicUrl
        }
        if (finalUrl || docState.expiry_date) {
          docInserts.push({
            employee_id: newId,
            document_type: type,
            expiry_date: docState.expiry_date || null,
            file_url: finalUrl || null,
          })
        }
      }
      if (docState.files.length === 0 && docState.expiry_date) {
        docInserts.push({
          employee_id: newId,
          document_type: type,
          expiry_date: docState.expiry_date || null,
          file_url: null,
        })
      }
    }

    if (docInserts.length > 0) await supabase.from('employee_documents').insert(docInserts)

    setLoading(false)
    onSave()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{employeeToEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</SheetTitle>
        </SheetHeader>
        <div className="p-6 space-y-8 flex-1">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Empresas Vinculadas</h4>
            <div className="flex flex-wrap gap-6 p-3 border rounded-md bg-muted/20">
              {allCompanies.map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedEmpresas.includes(c.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedEmpresas([...selectedEmpresas, c.id])
                      else setSelectedEmpresas(selectedEmpresas.filter((id) => id !== c.id))
                    }}
                  />
                  <span className="text-sm font-medium">{c.nome_fantasia}</span>
                </label>
              ))}
            </div>
            {selectedEmpresas.length === 0 && (
              <p className="text-xs text-destructive mt-1">Selecione pelo menos uma empresa.</p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Dados Pessoais</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome Completo</Label>
                <Input
                  value={data.nome_completo}
                  onChange={(e) => setData({ ...data, nome_completo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>CPF</Label>
                <Input
                  value={data.cpf}
                  onChange={(e) => setData({ ...data, cpf: maskCPF(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input
                  value={data.cnpj}
                  onChange={(e) => setData({ ...data, cnpj: maskCNPJ(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>RG</Label>
                <Input value={data.rg} onChange={(e) => setData({ ...data, rg: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  value={data.telefone}
                  onChange={(e) => setData({ ...data, telefone: maskPhone(e.target.value) })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Razão Social</Label>
                <Input
                  value={data.razao_social}
                  onChange={(e) => setData({ ...data, razao_social: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Endereço</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>CEP</Label>
                <Input
                  value={data.cep}
                  onChange={(e) => handleCep(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Logradouro</Label>
                <Input
                  value={data.logradouro}
                  onChange={(e) => setData({ ...data, logradouro: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Número</Label>
                <Input
                  value={data.numero}
                  onChange={(e) => setData({ ...data, numero: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Complemento</Label>
                <Input
                  value={data.complemento}
                  onChange={(e) => setData({ ...data, complemento: e.target.value })}
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label>Bairro</Label>
                <Input
                  value={data.bairro}
                  onChange={(e) => setData({ ...data, bairro: e.target.value })}
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label>Cidade</Label>
                <Input
                  value={data.cidade}
                  onChange={(e) => setData({ ...data, cidade: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Estado (UF)</Label>
                <Input
                  value={data.uf}
                  onChange={(e) => setData({ ...data, uf: e.target.value.toUpperCase() })}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">Vínculo e Cargo</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cargo / Função</Label>
                <Select
                  value={data.cargo_id}
                  onValueChange={(v) => setData({ ...data, cargo_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={data.tipo_colaborador}
                  onValueChange={(v) => setData({ ...data, tipo_colaborador: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">PF</SelectItem>
                    <SelectItem value="MEI">MEI</SelectItem>
                    <SelectItem value="Ltda.">Ltda.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <h4 className="text-sm font-semibold text-primary">Documentos</h4>
            <div className="grid grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map((type) => {
                const docState = docs[type] || { expiry_date: '', files: [] }
                return (
                  <div
                    key={type}
                    className="p-3 border rounded bg-muted/20 text-xs col-span-2 sm:col-span-1 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{type}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[10px]">Venc.:</span>
                        <Input
                          type="date"
                          className="h-6 w-28 text-xs"
                          value={docState.expiry_date || ''}
                          onChange={(e) =>
                            setDocs({
                              ...docs,
                              [type]: { ...docState, expiry_date: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {docState.files.length > 0 && (
                        <div className="space-y-1">
                          {docState.files.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-background border px-2 py-1 rounded"
                            >
                              <span className="truncate max-w-[150px] text-[10px]" title={f.name}>
                                {f.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  const newFiles = [...docState.files]
                                  newFiles.splice(i, 1)
                                  setDocs({ ...docs, [type]: { ...docState, files: newFiles } })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Label className="cursor-pointer flex items-center justify-center gap-1 border border-dashed rounded h-7 hover:bg-muted bg-background transition-colors">
                        <UploadCloud className="h-3 w-3" /> Anexar
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept=".pdf,image/jpeg,image/png"
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              const newFiles = Array.from(e.target.files).map((file) => ({
                                file,
                                name: file.name,
                              }))
                              setDocs({
                                ...docs,
                                [type]: { ...docState, files: [...docState.files, ...newFiles] },
                              })
                            }
                          }}
                        />
                      </Label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <SheetFooter className="p-6 border-t sticky bottom-0 bg-background z-10">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={
              loading || !data.nome_completo || !data.cargo_id || selectedEmpresas.length === 0
            }
            onClick={handleSave}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
