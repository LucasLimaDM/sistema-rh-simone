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
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/lib/audit'
import { maskCPF, maskCNPJ, maskPhone } from '@/lib/utils'

interface DocState {
  expiry_date: string
  file_url?: string
  file?: File
}

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
    admission_date: '',
    observations: '',
  })
  const [docs, setDocs] = useState<Record<string, DocState>>({})
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    if (open && empresaId) {
      supabase
        .from('cargo')
        .select('*')
        .eq('empresa_id', empresaId)
        .then(({ data }) => {
          if (data) setRoles(data)
        })

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
          admission_date: employeeToEdit.dados_dinamicos?.admission_date || '',
          observations: employeeToEdit.dados_dinamicos?.observations || '',
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
          admission_date: '',
          observations: '',
        })
        setDocs({})
      }
    }
  }, [open, employeeToEdit, empresaId])

  const handleCep = async (val: string) => {
    setData((prev) => ({ ...prev, cep: val }))
    const cleanCep = val.replace(/\D/g, '')
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
        /* intentionally ignored */
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
        if (upData)
          uploadedUrls[type] = supabase.storage
            .from('employee_documents')
            .getPublicUrl(fileName).data.publicUrl
      } else if (doc.file_url) uploadedUrls[type] = doc.file_url
    }

    const selectedRole = roles.find((r) => r.id === data.cargo_id)
    const newId = employeeToEdit?.id || crypto.randomUUID()

    const payload = {
      empresa_id: empresaId,
      nome_completo: data.nome_completo,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      rg: data.rg,
      cnpj: data.cnpj,
      data_nascimento: data.data_nascimento || null,
      tipo_colaborador: data.tipo_colaborador,
      cargo_id: data.cargo_id,
      cargo_nome_snapshot: selectedRole?.nome || '',
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
      dados_dinamicos: { admission_date: data.admission_date, observations: data.observations },
      ativo: true,
    }

    if (!employeeToEdit?.id) {
      await supabase.from('employees').insert({
        id: newId,
        name: data.nome_completo,
        company: company,
        contract_type: data.tipo_colaborador,
        role: selectedRole?.nome || 'Colaborador',
        status: 'ativo',
      })
      await supabase.from('colaborador').insert({ id: newId, ...payload })
      if (user) await logAudit('colaborador', newId, 'create', user.id, null, payload)
    } else {
      await supabase
        .from('employees')
        .update({
          name: data.nome_completo,
          contract_type: data.tipo_colaborador,
          role: selectedRole?.nome || 'Colaborador',
        })
        .eq('id', newId)
      await supabase.from('colaborador').update(payload).eq('id', newId)
      if (user) await logAudit('colaborador', newId, 'update', user.id, null, payload)
    }

    await supabase.from('employee_documents').delete().eq('employee_id', newId)
    const docInserts: any[] = []
    Object.entries(docs).forEach(([type, doc]) => {
      if (doc.expiry_date || uploadedUrls[type])
        docInserts.push({
          employee_id: newId,
          document_type: type,
          expiry_date: doc.expiry_date || null,
          file_url: uploadedUrls[type] || null,
        })
    })
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
          <SheetDescription>
            Preencha os dados e vincule a um cargo para preenchimento de documentos.
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 space-y-8 flex-1">
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
                  placeholder=""
                />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input
                  value={data.cnpj}
                  onChange={(e) => setData({ ...data, cnpj: maskCNPJ(e.target.value) })}
                  placeholder=""
                />
              </div>
              <div className="space-y-1.5">
                <Label>RG</Label>
                <Input
                  value={data.rg}
                  onChange={(e) => setData({ ...data, rg: e.target.value })}
                  placeholder=""
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  value={data.telefone}
                  onChange={(e) => setData({ ...data, telefone: maskPhone(e.target.value) })}
                  placeholder=""
                />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
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
                        {r.nome}
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-3 pb-8">
            <h4 className="text-sm font-semibold text-primary">Documentos NR e ASO</h4>
            <div className="grid grid-cols-2 gap-3">
              {['ASO', 'NR-35', 'NR-10', 'OS'].map((type) => (
                <div key={type} className="p-3 border rounded bg-muted/20 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{type}</span>
                    <Input
                      type="date"
                      className="h-6 w-28 text-xs"
                      value={docs[type]?.expiry_date || ''}
                      onChange={(e) =>
                        setDocs({ ...docs, [type]: { ...docs[type], expiry_date: e.target.value } })
                      }
                    />
                  </div>
                  <Label className="cursor-pointer flex items-center justify-center gap-1 border border-dashed rounded h-6 hover:bg-muted">
                    <UploadCloud className="h-3 w-3" /> {docs[type]?.file ? 'Pronto' : 'Anexar PDF'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        setDocs({ ...docs, [type]: { ...docs[type], file: e.target.files[0] } })
                      }
                    />
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="p-6 border-t sticky bottom-0 bg-background z-10">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={loading || !data.nome_completo || !data.cargo_id} onClick={handleSave}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
