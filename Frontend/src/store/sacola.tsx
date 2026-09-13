import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ItemSacola = { slug: string; quantidade: number }

export type ResultadoAdicionar = 'adicionada' | 'ja-esta'

const SEMENTE: ItemSacola[] = [
  { slug: 'leao-imperial-de-tracunhaem', quantidade: 1 },
  { slug: 'jarra-de-ceramica-cabocla', quantidade: 1 },
]

const CHAVE = 'al-sacola'

type ContextoSacola = {
  itens: ItemSacola[]
  pronto: boolean
  adicionar: (slug: string, unica?: boolean) => ResultadoAdicionar
  remover: (slug: string) => void
  repor: (item: ItemSacola, posicao: number) => void
  alterarQuantidade: (slug: string, quantidade: number) => void
  limpar: () => void
}

const Contexto = createContext<ContextoSacola | null>(null)

function guardar(itens: ItemSacola[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(itens))
  } catch {}
}

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>(SEMENTE)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo === null) {
        guardar(SEMENTE)
      } else {
        setItens(JSON.parse(salvo))
      }
    } catch {}
    setPronto(true)
  }, [])

  function atualizar(proximos: ItemSacola[]) {
    setItens(proximos)
    guardar(proximos)
  }

  function adicionar(slug: string, unica = false): ResultadoAdicionar {
    const existente = itens.find((i) => i.slug === slug)
    if (existente) {
      if (unica) return 'ja-esta'
      atualizar(itens.map((i) => (i.slug === slug ? { ...i, quantidade: i.quantidade + 1 } : i)))
      return 'adicionada'
    }
    atualizar([...itens, { slug, quantidade: 1 }])
    return 'adicionada'
  }

  function remover(slug: string) {
    atualizar(itens.filter((i) => i.slug !== slug))
  }

  function repor(item: ItemSacola, posicao: number) {
    const proximos = itens.filter((i) => i.slug !== item.slug)
    proximos.splice(Math.min(posicao, proximos.length), 0, item)
    atualizar(proximos)
  }

  function alterarQuantidade(slug: string, quantidade: number) {
    atualizar(itens.map((i) => (i.slug === slug ? { ...i, quantidade } : i)))
  }

  function limpar() {
    atualizar([])
  }

  return (
    <Contexto.Provider value={{ itens, pronto, adicionar, remover, repor, alterarQuantidade, limpar }}>
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
