import { Employee, TimeTrack, WorkScale, User } from './types'

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    contract: 'CLT',
    company: 'Primer Pisos',
    role: 'Pedreiro',
    status: 'expiring',
    documents: [
      { id: 'd1', type: 'ASO', expiryDate: '2026-05-10', status: 'expiring' },
      { id: 'd2', type: 'NR-35', expiryDate: '2027-01-15', status: 'up-to-date' },
    ],
  },
  {
    id: '2',
    name: 'Maria Souza',
    contract: 'MEI',
    company: 'Piso Plano',
    role: 'Encarregada',
    status: 'up-to-date',
    documents: [{ id: 'd3', type: 'Ficha EPI', expiryDate: '2027-10-20', status: 'up-to-date' }],
  },
  {
    id: '3',
    name: 'Carlos Ferreira',
    contract: 'CLT',
    company: 'Primer Pisos',
    role: 'Ajudante',
    status: 'expired',
    documents: [{ id: 'd4', type: 'NR-18', expiryDate: '2023-12-01', status: 'expired' }],
  },
]

export const mockTimeTracks: TimeTrack[] = [
  {
    id: '1',
    date: '2026-04-19',
    employeeId: '1',
    employeeName: 'João Silva',
    in1: '08:00',
    out1: '12:00',
    in2: '13:00',
    out2: '17:00',
    totalHours: '08:00',
  },
  {
    id: '2',
    date: '2026-04-19',
    employeeId: '2',
    employeeName: 'Maria Souza',
    in1: '07:55',
    out1: '12:10',
    in2: '13:05',
    out2: '17:00',
    totalHours: '08:00',
  },
  {
    id: '3',
    date: '2026-04-18',
    employeeId: '1',
    employeeName: 'João Silva',
    in1: '08:05',
    out1: '12:00',
    in2: '13:00',
    out2: '17:15',
    totalHours: '08:10',
  },
]

export const mockScales: WorkScale[] = [
  {
    id: '1',
    employeeName: 'João Silva',
    role: 'Pedreiro',
    schedule: {
      Seg: '08:00 - 17:00',
      Ter: '08:00 - 17:00',
      Qua: '08:00 - 17:00',
      Qui: '08:00 - 17:00',
      Sex: '08:00 - 17:00',
      Sab: '08:00 - 12:00',
      Dom: 'Folga',
    },
  },
  {
    id: '2',
    employeeName: 'Maria Souza',
    role: 'Encarregada',
    schedule: {
      Seg: '08:00 - 17:00',
      Ter: '08:00 - 17:00',
      Qua: '08:00 - 17:00',
      Qui: '08:00 - 17:00',
      Sex: '08:00 - 17:00',
      Sab: 'Folga',
      Dom: 'Folga',
    },
  },
  {
    id: '3',
    employeeName: 'Carlos Ferreira',
    role: 'Ajudante',
    schedule: {
      Seg: '08:00 - 17:00',
      Ter: 'Folga',
      Qua: '08:00 - 17:00',
      Qui: '08:00 - 17:00',
      Sex: '08:00 - 17:00',
      Sab: '08:00 - 17:00',
      Dom: '08:00 - 17:00',
    },
  },
]

export const mockUsers: User[] = [
  { id: '1', name: 'Admin Geral', email: 'admin@primerpisos.com.br', role: 'Admin' },
  { id: '2', name: 'Luiza Silva', email: 'luiza@pisoplano.com.br', role: 'Coordenadora' },
  { id: '3', name: 'Pedro RH', email: 'pedro@primerpisos.com.br', role: 'NovoUsuario' },
]
