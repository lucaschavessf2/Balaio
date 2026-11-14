import type { Papel, UsuarioAutenticado } from '@/services/api/auth.servico'
import type { Usuario } from '@/types/dominio'

export type Sessao = UsuarioAutenticado

export const COOKIE_SESSAO = 'balaio-sessao'
export const COOKIE_AUTENTICACAO = 'balaio_sessao'
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7

const PAPEIS: Papel[] = ['comprador', 'artesao', 'admin']

const DESTINO_POR_PAPEL: Record<Papel, string> = {
  comprador: '/account',
  artesao: '/dashboard',
  admin: '/admin',
}

export function sessaoDoUsuario(usuario: Usuario): Sessao | null {
  const papel = usuario.papel ?? usuario.perfil
  if (!usuario.id || !usuario.nome || !usuario.email || !PAPEIS.includes(papel as Papel)) return null
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    imagem: usuario.imagem,
    papel: papel as Papel,
    telefone: usuario.telefone,
    artesao: usuario.artesaoId,
  }
}

export function lerSessaoDoCookie(valor: string | undefined): Sessao | null {
  void valor
  return null
}

export function destinoInicial(sessao: Sessao): string {
  return DESTINO_POR_PAPEL[sessao.papel]
}

export function destinoSeguro(proximo: unknown): string | undefined {
  if (typeof proximo !== 'string' || !proximo.startsWith('/') || proximo.startsWith('//')) return undefined
  if (/[\\\u0000- \u007f]/.test(proximo)) return undefined
  if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f])/i.test(proximo)) return undefined
  return proximo
}

export function rotaDeLogin(proximo: string): string {
  return `/login?proximo=${encodeURIComponent(proximo)}`
}
