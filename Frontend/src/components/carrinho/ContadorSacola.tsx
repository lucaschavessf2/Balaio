'use client'

import { useTotalSacola } from '@/store/sacola'

type Props = { esconderZero?: boolean; decorativo?: boolean }

export default function ContadorSacola({ esconderZero = false, decorativo = false }: Props) {
  const { total, pronto } = useTotalSacola()

  if (esconderZero && (!pronto || total === 0)) return null

  return (
    <span className="contador" aria-hidden={decorativo || undefined}>
      {total}
    </span>
  )
}
