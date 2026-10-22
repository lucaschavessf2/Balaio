import { createContext, useContext, type ReactNode } from 'react'
import { salvarSacola } from '@/services/api/estado.servico'
import { useEstadoCliente } from '@/store/estadoCliente'
import { useEstadoPersistido } from '@/hooks/useEstadoPersistido'

export type ItemSacola = { slug: string; quantidade: number }

export type ResultadoAdicionar = 'adicionada' | 'ja-esta'

type ContextoSacola = {
  itens: ItemSacola[]
  pronto: boolean
  erro: string | null
  recarregar: () => void
  adicionar: (slug: string, unica?: boolean) => ResultadoAdicionar
  remover: (slug: string) => void
  repor: (item: ItemSacola, posicao: number) => void
  alterarQuantidade: (slug: string, quantidade: number) => void
  limpar: () => void
}

const Contexto = createContext<ContextoSacola | null>(null)
const SACOLA_VAZIA: ItemSacola[] = []

export function SacolaProvider({ children }: { children: ReactNode }) {
  const { estado, pronto, erro, recarregar } = useEstadoCliente()
  const { valor: itens, atualizar } = useEstadoPersistido(
    estado?.sacola ?? SACOLA_VAZIA,
    salvarSacola,
    'Não foi possível salvar a sacola',
  )

  function adicionar(slug: string, unica = false): ResultadoAdicionar {
    let resultado: ResultadoAdicionar = 'adicionada'
    atualizar((atuais) => {
      const existente = atuais.find((item) => item.slug === slug)
      if (!existente) return [...atuais, { slug, quantidade: 1 }]
      if (unica || existente.quantidade >= 3) {
        resultado = 'ja-esta'
        return atuais
      }
      return atuais.map((item) => item.slug === slug ? { ...item, quantidade: item.quantidade + 1 } : item)
    })
    return resultado
  }

  function remover(slug: string) {
    atualizar((atuais) => atuais.filter((i) => i.slug !== slug))
  }

  function repor(item: ItemSacola, posicao: number) {
    atualizar((atuais) => {
      const proximos = atuais.filter((i) => i.slug !== item.slug)
      proximos.splice(Math.min(posicao, proximos.length), 0, item)
      return proximos
    })
  }

  function alterarQuantidade(slug: string, quantidade: number) {
    atualizar((atuais) => atuais.map((i) => (i.slug === slug ? { ...i, quantidade } : i)))
  }

  function limpar() {
    atualizar(() => [])
  }

  return (
    <Contexto.Provider value={{ itens, pronto, erro, recarregar, adicionar, remover, repor, alterarQuantidade, limpar }}>
      {children}
    </Contexto.Provider>
  )
}

export function useSacola(): ContextoSacola {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useSacola precisa estar dentro de SacolaProvider')
  return contexto
}

export function useTotalSacola(): { total: number; pronto: boolean } {
  const { itens, pronto } = useSacola()
  return { total: itens.reduce((soma, item) => soma + item.quantidade, 0), pronto }
}
