'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { obterUsuario } from '@/services/api/conta.servico'
import { sessaoDoUsuario, type Sessao } from '@/services/sessao/cookie'
import { renovarRequisicoesDaSessao } from '@/services/sessao/requisicoes'

type ContextoSessao = {
  sessao: Sessao | null
  estado: 'verificando' | 'autenticada' | 'anonima' | 'indisponivel' | 'sem-permissao'
  versao: number
  saidaPendente: boolean
  iniciarSessao: (sessao: Sessao) => void
  encerrarSessao: (confirmada?: boolean) => void
  revalidar: () => Promise<void>
}

const Contexto = createContext<ContextoSessao | null>(null)

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, definirSessao] = useState<Sessao | null>(null)
  const [estado, definirEstado] = useState<ContextoSessao['estado']>('verificando')
  const [versao, definirVersao] = useState(0)
  const [saidaPendente, definirSaidaPendente] = useState(false)
  const saidaBloqueada = useRef(false)
  const geracao = useRef(0)
  const identidade = useRef<string | null>(null)
  const emVoo = useRef<Promise<void> | null>(null)

  const publicar = useCallback((nova: Sessao | null, proximo: ContextoSessao['estado']) => {
    if (identidade.current !== (nova?.id ?? null)) {
      renovarRequisicoesDaSessao()
      identidade.current = nova?.id ?? null
      definirVersao((valor) => valor + 1)
    }
    definirSessao(nova)
    definirEstado(proximo)
  }, [])

  const iniciarSessao = useCallback((nova: Sessao) => {
    renovarRequisicoesDaSessao()
    saidaBloqueada.current = false
    definirSaidaPendente(false)
    geracao.current++
    emVoo.current = null
    publicar(nova, 'autenticada')
  }, [publicar])

  const encerrarSessao = useCallback((confirmada = true) => {
    renovarRequisicoesDaSessao()
    saidaBloqueada.current = !confirmada
    definirSaidaPendente(!confirmada)
    geracao.current++
    emVoo.current = null
    publicar(null, 'anonima')
    definirVersao((valor) => valor + 1)
  }, [publicar])

  const revalidar = useCallback((): Promise<void> => {
    if (saidaBloqueada.current) return Promise.resolve()
    if (emVoo.current) return emVoo.current
    const atual = geracao.current
    const promessa = (async () => {
      const { dados, erro } = await obterUsuario()
      if (atual !== geracao.current) return
      const confirmada = dados ? sessaoDoUsuario(dados) : null
      if (confirmada) publicar(confirmada, 'autenticada')
      else if (erro?.status === 401) publicar(null, 'anonima')
      else if (erro?.status === 403) definirEstado('sem-permissao')
      else publicar(null, 'indisponivel')
    })().finally(() => { if (emVoo.current === promessa) emVoo.current = null })
    emVoo.current = promessa
    return promessa
  }, [publicar])

  useEffect(() => {
    document.cookie = 'balaio-sessao=; Path=/; Max-Age=0; SameSite=Lax'
    void revalidar()
    const aoFocar = () => { if (document.visibilityState === 'visible') void revalidar() }
    const invalidar = () => encerrarSessao()
    window.addEventListener('focus', aoFocar)
    window.addEventListener('balaio:sessao-invalida', invalidar)
    document.addEventListener('visibilitychange', aoFocar)
    const intervalo = window.setInterval(aoFocar, 30000)
    const cancelarConsultas = () => { geracao.current++; emVoo.current = null }
    return () => {
      cancelarConsultas()
      window.removeEventListener('focus', aoFocar)
      window.removeEventListener('balaio:sessao-invalida', invalidar)
      document.removeEventListener('visibilitychange', aoFocar)
      window.clearInterval(intervalo)
    }
  }, [revalidar, encerrarSessao])

  const valor = useMemo(() => ({ sessao, estado, versao, saidaPendente, iniciarSessao, encerrarSessao, revalidar }), [sessao, estado, versao, saidaPendente, iniciarSessao, encerrarSessao, revalidar])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSessao() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useSessao precisa estar dentro de SessaoProvider')
  return contexto
}
