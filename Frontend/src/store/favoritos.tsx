import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const SEMENTE = ['painel-xilogravura-sertaneja', 'toalha-renascenca-florescer', 'sanfoneiro-em-imburana']

const CHAVE = 'al-favoritos'

type ContextoFavoritos = {
  slugs: string[]
  pronto: boolean
  alternar: (slug: string) => boolean
  ehFavorito: (slug: string) => boolean
}

const Contexto = createContext<ContextoFavoritos | null>(null)

function guardar(slugs: string[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(slugs))
  } catch {}
}

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>(SEMENTE)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo === null) {
        guardar(SEMENTE)
      } else {
        setSlugs(JSON.parse(salvo))
      }
    } catch {}
    setPronto(true)
  }, [])

  function alternar(slug: string): boolean {
    const jaTem = slugs.includes(slug)
    const proximos = jaTem ? slugs.filter((s) => s !== slug) : [...slugs, slug]
    setSlugs(proximos)
    guardar(proximos)
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
