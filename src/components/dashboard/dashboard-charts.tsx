import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const pieData = [
  { name: 'Em dia', value: 65, fill: 'hsl(var(--chart-1))' },
  { name: 'A Vencer', value: 20, fill: 'hsl(var(--chart-2))' },
  { name: 'Vencido', value: 15, fill: 'hsl(var(--chart-3))' },
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
  upToDate: { label: 'Em dia', color: 'hsl(var(--chart-1))' },
  expiring: { label: 'A Vencer', color: 'hsl(var(--chart-2))' },
  expired: { label: 'Vencido', color: 'hsl(var(--chart-3))' },
  hours: { label: 'Horas Trab.', color: 'hsl(var(--chart-4))' },
}

export function CompliancePieChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={2}
          paddingAngle={2}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}

export function HoursBarChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Bar dataKey="hours" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  )
}
