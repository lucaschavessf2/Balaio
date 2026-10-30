'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Sessao } from '@/services/sessao/cookie'

type ContextoSessao = {
  sessao: Sessao | null
  iniciarSessao: (sessao: Sessao) => void
  encerrarSessao: () => void
}

const Contexto = createContext<ContextoSessao>({ sessao: null, iniciarSessao: () => {}, encerrarSessao: () => {} })

export function SessaoProvider({ inicial, children }: { inicial: Sessao | null; children: ReactNode }) {
  const [sessao, definirSessao] = useState<Sessao | null>(inicial)

  const iniciarSessao = useCallback((nova: Sessao) => {
    definirSessao(nova)
  }, [])

  const encerrarSessao = useCallback(() => {
    document.cookie = 'balaio-sessao=; path=/; max-age=0; samesite=lax'
    definirSessao(null)
  }, [])

  useEffect(() => {
    if (!sessao) return
    const conferir = async () => {
      try {
        const resposta = await fetch('/api/v1/usuario', { cache: 'no-store' })
        if (resposta.status === 401) encerrarSessao()
      } catch { /* A próxima navegação tenta novamente. */ }
    }
    void conferir()
    window.addEventListener('focus', conferir)
    return () => window.removeEventListener('focus', conferir)
  }, [sessao, encerrarSessao])

  const valor = useMemo(() => ({ sessao, iniciarSessao, encerrarSessao }), [sessao, iniciarSessao, encerrarSessao])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export const useSessao = () => useContext(Contexto)
