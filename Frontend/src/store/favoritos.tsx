import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { obterEstado, salvarFavoritos } from '@/services/api/estado.servico'

type ContextoFavoritos = {
  slugs: string[]
  pronto: boolean
  alternar: (slug: string) => boolean
  ehFavorito: (slug: string) => boolean
}

const Contexto = createContext<ContextoFavoritos | null>(null)

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    let vivo = true
    obterEstado().then(({ dados }) => {
      if (vivo) setSlugs(dados?.favoritos ?? [])
    }).finally(() => { if (vivo) setPronto(true) })
    return () => { vivo = false }
  }, [])

  function alternar(slug: string): boolean {
    const jaTem = slugs.includes(slug)
    const proximos = jaTem ? slugs.filter((s) => s !== slug) : [...slugs, slug]
    setSlugs(proximos)
    void salvarFavoritos(proximos)
    return !jaTem
  }

  function ehFavorito(slug: string): boolean {
    return slugs.includes(slug)
  }

  return <Contexto.Provider value={{ slugs, pronto, alternar, ehFavorito }}>{children}</Contexto.Provider>
}

export function useFavoritos(): ContextoFavoritos {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useFavoritos precisa estar dentro de FavoritosProvider')
  return contexto
}
