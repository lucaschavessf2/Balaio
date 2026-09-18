'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { COOKIE_SESSAO, DURACAO_SESSAO_SEGUNDOS, type Sessao } from '@/services/sessao/cookie'

type ContextoSessao = {
  sessao: Sessao | null
  iniciarSessao: (sessao: Sessao) => void
  encerrarSessao: () => void
}

const Contexto = createContext<ContextoSessao>({ sessao: null, iniciarSessao: () => {}, encerrarSessao: () => {} })

function gravarCookie(valor: string, duracaoSegundos: number) {
  document.cookie = `${COOKIE_SESSAO}=${valor}; path=/; max-age=${duracaoSegundos}; samesite=lax`
}

export function SessaoProvider({ inicial, children }: { inicial: Sessao | null; children: ReactNode }) {
  const [sessao, definirSessao] = useState<Sessao | null>(inicial)

  const iniciarSessao = useCallback((nova: Sessao) => {
    gravarCookie(encodeURIComponent(JSON.stringify(nova)), DURACAO_SESSAO_SEGUNDOS)
    definirSessao(nova)
  }, [])

  const encerrarSessao = useCallback(() => {
    gravarCookie('', 0)
    definirSessao(null)
  }, [])

  const valor = useMemo(() => ({ sessao, iniciarSessao, encerrarSessao }), [sessao, iniciarSessao, encerrarSessao])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export const useSessao = () => useContext(Contexto)
