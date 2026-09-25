import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESSAO, destinoInicial, destinoSeguro, lerSessaoDoCookie, rotaDeLogin } from '@/services/sessao/cookie'

const ROTAS_DE_CONTA = ['/account', '/orders', '/checkout', '/confirmation', '/dashboard', '/admin']
const ROTAS_SO_DE_VISITANTE = ['/login', '/login/register']

const comecaCom = (caminho: string, rota: string) => caminho === rota || caminho.startsWith(`${rota}/`)

export function proxy(requisicao: NextRequest) {
  const { pathname, search, searchParams } = requisicao.nextUrl
  const sessao = lerSessaoDoCookie(requisicao.cookies.get(COOKIE_SESSAO)?.value)
  const irPara = (destino: string) => NextResponse.redirect(new URL(destino, requisicao.url))

  if (ROTAS_SO_DE_VISITANTE.includes(pathname)) {
    return sessao ? irPara(destinoSeguro(searchParams.get('proximo') ?? undefined) ?? destinoInicial(sessao)) : NextResponse.next()
  }

  if (!ROTAS_DE_CONTA.some((rota) => comecaCom(pathname, rota))) return NextResponse.next()
  if (!sessao) return irPara(rotaDeLogin(pathname + search))
  if (comecaCom(pathname, '/dashboard') && sessao.papel !== 'artesao') return irPara(destinoInicial(sessao))
  if (comecaCom(pathname, '/admin') && sessao.papel !== 'admin') return irPara(destinoInicial(sessao))
  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/checkout', '/confirmation/:path*', '/dashboard/:path*', '/admin/:path*', '/login', '/login/register'],
}
