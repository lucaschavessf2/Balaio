'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { listarColetivos } from '@/services/api/coletivos.servico'
import type { Artesao } from '@/types/dominio'
import type { Coletivo } from '@/mocks/coletivos'
import type { OpcaoFrete } from '@/mocks/frete'
import { listarFretes } from '@/services/api/conta.servico'

type Dados = { artesaos: Artesao[]; coletivos: Coletivo[]; fretes: OpcaoFrete[]; carregando: boolean; erro: string | null }
const inicial: Dados = { artesaos: [], coletivos: [], fretes: [], carregando: true, erro: null }
const Contexto = createContext<Dados>(inicial)

export function DadosProvider({ children }: { children: ReactNode }) {
  const [dados, definirDados] = useState<Dados>(inicial)
  useEffect(() => {
    let vivo = true
    Promise.all([listarArtesaos(), listarColetivos(), listarFretes()]).then(([a, c, f]) => {
      if (vivo) definirDados({ artesaos: a.dados ?? [], coletivos: c.dados ?? [], fretes: f.dados ?? [], carregando: false, erro: a.erro?.mensagem ?? c.erro?.mensagem ?? f.erro?.mensagem ?? null })
    })
    return () => { vivo = false }
  }, [])
  return <Contexto.Provider value={dados}>{children}</Contexto.Provider>
}

export const useDados = () => useContext(Contexto)
