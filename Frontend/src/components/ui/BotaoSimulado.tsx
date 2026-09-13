'use client'

import type { ReactNode } from 'react'
import { avisar } from '@/components/feedback/Avisos'

type Props = {
  className?: string
  titulo: string
  descricao?: string
  tipo?: 'info' | 'sucesso'
  children: ReactNode
}

export default function BotaoSimulado({ className, titulo, descricao, tipo = 'info', children }: Props) {
  function clicar() {
    if (tipo === 'sucesso') avisar.sucesso(titulo, descricao)
    else avisar.info(titulo, descricao)
  }

  return (
    <button type="button" className={className} onClick={clicar}>
      {children}
    </button>
  )
}
