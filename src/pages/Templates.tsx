import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Templates() {
  const templates = [
    {
      id: '1',
      title: 'Contrato de Trabalho Padrão',
      description: 'Modelo base para novas contratações CLT.',
    },
    {
      id: '2',
      title: 'Avaliação de Desempenho',
      description: 'Formulário de avaliação semestral de colaboradores.',
    },
    {
      id: '3',
      title: 'Termo de Confidencialidade (NDA)',
      description: 'Acordo de não divulgação para funcionários.',
    },
    {
      id: '4',
      title: 'Aviso de Férias',
      description: 'Documento formal de comunicação de férias.',
    },
    {
      id: '5',
      title: 'Recibo de Pagamento',
      description: 'Modelo padrão para recibo de holerite/pagamentos.',
    },
    {
      id: '6',
      title: 'Formulário de Desligamento',
      description: 'Checklist e formulário para entrevista de desligamento.',
    },
  ]

  return (
    <div className="p-8 space-y-6 flex-1 h-full w-full max-w-7xl mx-auto overflow-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates e Documentos</h1>
        <p className="text-muted-foreground mt-2">
          Modelos de documentos e formulários prontos para uso no RH.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
