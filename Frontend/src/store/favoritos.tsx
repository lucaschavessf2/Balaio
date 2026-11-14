import { createContext, useContext, type ReactNode } from 'react'
import { salvarFavoritos } from '@/services/api/estado.servico'
import { useEstadoCliente } from '@/store/estadoCliente'
import { useEstadoPersistido } from '@/hooks/useEstadoPersistido'

type ContextoFavoritos = {
  slugs: string[]
  pronto: boolean
  erro: string | null
  recarregar: () => void
  alternar: (slug: string) => boolean
  ehFavorito: (slug: string) => boolean
}

const Contexto = createContext<ContextoFavoritos | null>(null)
const FAVORITOS_VAZIOS: string[] = []

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const { estado, pronto, erro, recarregar } = useEstadoCliente()
  const { valor: slugs, atualizar } = useEstadoPersistido(
    estado?.favoritos ?? FAVORITOS_VAZIOS,
    salvarFavoritos,
    'Não foi possível salvar os favoritos',
  )

  function alternar(slug: string): boolean {
    const proximos = atualizar((atuais) => atuais.includes(slug) ? atuais.filter((s) => s !== slug) : [...atuais, slug])
    return proximos.includes(slug)
  }

  function ehFavorito(slug: string): boolean {
    return slugs.includes(slug)
  }

  return <Contexto.Provider value={{ slugs, pronto, erro, recarregar, alternar, ehFavorito }}>{children}</Contexto.Provider>
}

export function useFavoritos(): ContextoFavoritos {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useFavoritos precisa estar dentro de FavoritosProvider')
  return contexto
}
