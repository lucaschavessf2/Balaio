'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { obterEstado, type EstadoCliente } from '@/services/api/estado.servico'

type ContextoEstadoCliente = {
  estado: EstadoCliente | null
  pronto: boolean
  erro: string | null
  recarregar: () => void
  atualizarEstado: (alteracoes: Partial<EstadoCliente>) => void
}

const Contexto = createContext<ContextoEstadoCliente | null>(null)

export function EstadoClienteProvider({ children }: { children: ReactNode }) {
  const [leitura, definirLeitura] = useState<Pick<ContextoEstadoCliente, 'estado' | 'pronto' | 'erro'>>({
    estado: null,
    pronto: false,
    erro: null,
  })
  const [tentativa, definirTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    obterEstado().then(({ dados, erro }) => {
      if (ativo) definirLeitura({
        estado: dados,
        pronto: true,
        erro: erro?.mensagem ?? (dados ? null : 'O servidor não retornou seus dados.'),
      })
    })
    return () => { ativo = false }
  }, [tentativa])

  function recarregar() {
    definirLeitura({ estado: null, pronto: false, erro: null })
    definirTentativa((atual) => atual + 1)
  }

  const atualizarEstado = useCallback((alteracoes: Partial<EstadoCliente>) => {
    definirLeitura((atual) => atual.estado ? { ...atual, estado: { ...atual.estado, ...alteracoes } } : atual)
  }, [])

  return <Contexto.Provider value={{ ...leitura, recarregar, atualizarEstado }}>{children}</Contexto.Provider>
}

export function useEstadoCliente(): ContextoEstadoCliente {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useEstadoCliente precisa estar dentro de EstadoClienteProvider')
  return contexto
}
