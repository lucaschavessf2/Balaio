import type { Papel, UsuarioAutenticado } from '@/services/api/auth.servico'

export type Sessao = UsuarioAutenticado

export const COOKIE_SESSAO = 'balaio-sessao'
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7

const PAPEIS: Papel[] = ['comprador', 'artesao', 'admin']

const DESTINO_POR_PAPEL: Record<Papel, string> = {
  comprador: '/account',
  artesao: '/dashboard',
  admin: '/admin',
}

export const ROTULO_AREA_POR_PAPEL: Record<Papel, string> = {
  comprador: 'Minha conta',
  artesao: 'Meu painel',
  admin: 'Curadoria',
}

export function lerSessaoDoCookie(valor: string | undefined): Sessao | null {
  if (!valor) return null
  try {
    const sessao = JSON.parse(decodeURIComponent(valor)) as Partial<Sessao>
    if (!sessao.id || !sessao.nome || !PAPEIS.includes(sessao.papel as Papel)) return null
    return sessao as Sessao
  } catch {
    return null
  }
}

export function destinoInicial(sessao: Sessao): string {
  return DESTINO_POR_PAPEL[sessao.papel]
}

export function destinoSeguro(proximo: string | undefined): string | undefined {
  return proximo?.startsWith('/') && !proximo.startsWith('//') ? proximo : undefined
}

export function rotaDeLogin(proximo: string): string {
  return `/login?proximo=${encodeURIComponent(proximo)}`
}
