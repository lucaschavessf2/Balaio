import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_AUTENTICACAO, destinoInicial, destinoSeguro, rotaDeLogin } from '@/services/sessao/cookie'
import { papelDaRota, rotaProtegida } from '@/services/sessao/rotas'
import { validarSessaoBackend } from '@/services/sessao/validacao'

const ROTAS_SO_DE_VISITANTE = ['/login', '/login/register']

export async function proxy(requisicao: NextRequest) {
  const { pathname, search, searchParams } = requisicao.nextUrl
  if (pathname === '/api/v1/checkout' || pathname === '/api/v1/pedidos' || pathname.startsWith('/api/v1/pedidos/')
      || pathname === '/api/v1/admin/mediacoes' || pathname.startsWith('/api/v1/admin/mediacoes/')
      || pathname === '/api/v1/artesao/pedidos-pendentes' || pathname === '/api/v1/artesao/vendas') {
    const token = requisicao.cookies.get(COOKIE_AUTENTICACAO)?.value
    if (!token) return NextResponse.next()
    const headers = new Headers(requisicao.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return NextResponse.next({ request: { headers } })
  }
  if ((pathname === '/api/v1/pecas' && requisicao.method === 'POST')
      || (/^\/api\/v1\/pecas\/[^/]+$/.test(pathname) && requisicao.method === 'PATCH')) {
    const token = requisicao.cookies.get(COOKIE_AUTENTICACAO)?.value
    if (token) {
      const headers = new Headers(requisicao.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return NextResponse.next({ request: { headers } })
    }
    return NextResponse.next()
  }
  if (pathname === '/api/v1/pecas' || pathname.startsWith('/api/v1/pecas/')) return NextResponse.next()
  if (pathname === '/api/v1/usuario' && requisicao.method === 'GET') {
    const token = requisicao.cookies.get(COOKIE_AUTENTICACAO)?.value
    if (!token) return NextResponse.next()
    const headers = new Headers(requisicao.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return NextResponse.next({ request: { headers } })
  }
  const soVisitante = ROTAS_SO_DE_VISITANTE.includes(pathname)
  if (!soVisitante && !rotaProtegida(pathname)) return NextResponse.next()
  const sessao = await validarSessaoBackend(requisicao.cookies.get(COOKIE_AUTENTICACAO)?.value)
  const irPara = (destino: string) => NextResponse.redirect(new URL(destino, requisicao.url))

  if (soVisitante) {
    return sessao ? irPara(destinoSeguro(searchParams.get('proximo') ?? undefined) ?? destinoInicial(sessao)) : NextResponse.next()
  }

  if (!sessao) return irPara(rotaDeLogin(pathname + search))
  const papel = papelDaRota(pathname)
  if (papel && sessao.papel !== papel) return irPara(destinoInicial(sessao))
  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/checkout', '/confirmation/:path*', '/dashboard/:path*', '/admin/:path*', '/login', '/login/register', '/api/v1/pecas/:path*', '/api/v1/usuario', '/api/v1/checkout', '/api/v1/pedidos/:path*', '/api/v1/admin/mediacoes/:path*', '/api/v1/artesao/pedidos-pendentes', '/api/v1/artesao/vendas'],
}
