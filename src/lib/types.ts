export type Company = 'Primer Pisos' | 'Piso Plano'
export type ContractType = 'CLT' | 'MEI'
export type DocStatus = 'up-to-date' | 'expiring' | 'expired'
export type Role = 'Admin' | 'Coordenadora' | 'NovoUsuario' | 'Colaborador' | 'Encarregado'

export interface AppContextType {
  company: Company
  setCompany: (c: Company) => void
}

export interface EmployeeDocument {
  id: string
  type: string
  expiryDate: string
  status: DocStatus
}

export interface Employee {
  id: string
  name: string
  contract: ContractType
  company: Company
  role: string
  status: DocStatus
  documents: EmployeeDocument[]
}

export interface TimeTrack {
  id: string
  date: string
  employeeId: string
  employeeName: string
  in1: string
  out1: string
  in2: string
  out2: string
  totalHours: string
}

export interface WorkScale {
  id: string
  employeeName: string
  role: string
  schedule: Record<string, string>
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
}
