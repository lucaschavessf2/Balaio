'use client'

import type { ReactNode } from 'react'
import { avisar } from '@/components/feedback/Avisos'

export default function BotaoRastreio({ codigo, transportadora, className, children }: {
  codigo?: string
  transportadora?: string
  className?: string
  children: ReactNode
}) {
  async function copiar() {
    if (!codigo) return avisar.info('O código de rastreamento ainda não foi informado')
    try {
      await navigator.clipboard.writeText(codigo)
      avisar.sucesso('Código de rastreamento copiado', `Use ${codigo} no site da ${transportadora ?? 'transportadora'}.`)
    } catch {
      avisar.erro('Não foi possível copiar automaticamente', `Copie o código manualmente: ${codigo}`)
    }
  }

  return <button type="button" className={className} onClick={copiar}>{children}</button>
}
