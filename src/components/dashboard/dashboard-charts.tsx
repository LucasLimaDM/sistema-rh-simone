import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'

const pieData = [
  { name: 'Contratos', value: 65, fill: 'hsl(var(--chart-1))' },
  { name: 'Documentos (ID)', value: 20, fill: 'hsl(var(--chart-2))' },
  { name: 'Outros', value: 15, fill: 'hsl(var(--chart-3))' },
]

const barData = [
  { name: 'Seg', hours: 160 },
  { name: 'Ter', hours: 155 },
  { name: 'Qua', hours: 162 },
  { name: 'Qui', hours: 158 },
  { name: 'Sex', hours: 165 },
  { name: 'Sab', hours: 80 },
]

const chartConfig = {
  contract: { label: 'Contratos', color: 'hsl(var(--chart-1))' },
  id: { label: 'Documentos (ID)', color: 'hsl(var(--chart-2))' },
  other: { label: 'Outros', color: 'hsl(var(--chart-3))' },
  hours: { label: 'Horas Trab.', color: 'hsl(var(--chart-4))' },
}

export function CompliancePieChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : pieData
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={2}
          paddingAngle={2}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

export function HoursBarChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : barData
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="hours" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  )
}
