'use client'

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { emReais } from '@/utils/formato'

export type MesFaturamento = { mes: string; valor: number }

function emMilhares(valor: number) {
  return `${(valor / 1000).toFixed(1)}k`
}

function tickMilhares(valor: number) {
  if (valor === 0) return '0'
  const milhares = valor / 1000
  return `${Number.isInteger(milhares) ? milhares : milhares.toFixed(1)}k`
}

function Dica({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="grafico-dica">
      <p className="grafico-dica-mes">{label}</p>
      <p className="grafico-dica-valor">{emReais(payload[0].value)}</p>
    </div>
  )
}

export default function GraficoFaturamento({ meses }: { meses: MesFaturamento[] }) {
  const maior = Math.max(...meses.map((m) => m.valor))

  return (
    <div className="grafico-faturamento">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={meses} margin={{ top: 24, right: 8, bottom: 0, left: 8 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--linha)" strokeWidth={1} />
          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={{ stroke: 'var(--linha)' }}
            tick={{ fill: 'var(--tinta-suave)', fontSize: 13 }}
            dy={6}
          />
          <YAxis
            tickFormatter={tickMilhares}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: 'var(--tinta-suave)', fontSize: 12 }}
          />
          <Tooltip content={<Dica />} cursor={{ fill: 'var(--barro)', fillOpacity: 0.12 }} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
            {meses.map((m) => (
              <Cell key={m.mes} fill="var(--grafico-serie)" />
            ))}
            <LabelList
              dataKey="valor"
              position="top"
              offset={10}
              fill="var(--tinta)"
              fontSize={13}
              fontWeight={700}
              formatter={(valor) => (Number(valor) === maior ? emMilhares(Number(valor)) : '')}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <table className="grafico-tabela so-leitor">
        <caption>Faturamento por mês</caption>
        <tbody>
          {meses.map((m) => (
            <tr key={m.mes}>
              <th scope="row">{m.mes}</th>
              <td>{emReais(m.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
