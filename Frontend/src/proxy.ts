import { NextResponse, type NextRequest } from 'next/server'
import { obterUsuario } from '@/services/api/conta.servico'
import { COOKIE_AUTENTICACAO, destinoInicial, destinoSeguro, rotaDeLogin, sessaoDoUsuario } from '@/services/sessao/cookie'

const ROTAS_DE_CONTA = ['/account', '/orders', '/checkout', '/confirmation', '/dashboard', '/admin']
const ROTAS_SO_DE_VISITANTE = ['/login', '/login/register']

const comecaCom = (caminho: string, rota: string) => caminho === rota || caminho.startsWith(`${rota}/`)

export async function proxy(requisicao: NextRequest) {
  const { pathname, search, searchParams } = requisicao.nextUrl
  const soVisitante = ROTAS_SO_DE_VISITANTE.includes(pathname)
  if (!soVisitante && !ROTAS_DE_CONTA.some((rota) => comecaCom(pathname, rota))) return NextResponse.next()
  const token = requisicao.cookies.get(COOKIE_AUTENTICACAO)?.value
  const usuario = token ? (await obterUsuario(token)).dados : null
  const sessao = usuario ? sessaoDoUsuario(usuario) : null
  const irPara = (destino: string) => NextResponse.redirect(new URL(destino, requisicao.url))

  if (soVisitante) {
    return sessao ? irPara(destinoSeguro(searchParams.get('proximo') ?? undefined) ?? destinoInicial(sessao)) : NextResponse.next()
  }

  if (!sessao) return irPara(rotaDeLogin(pathname + search))
  if (comecaCom(pathname, '/dashboard') && sessao.papel !== 'artesao') return irPara(destinoInicial(sessao))
  if (comecaCom(pathname, '/admin') && sessao.papel !== 'admin') return irPara(destinoInicial(sessao))
  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/checkout', '/confirmation/:path*', '/dashboard/:path*', '/admin/:path*', '/login', '/login/register'],
}
