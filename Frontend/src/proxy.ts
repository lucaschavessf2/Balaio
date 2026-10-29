import { NextResponse, type NextRequest } from 'next/server'

export function proxy(requisicao: NextRequest) {
  // Path=/api/v1 não chega às páginas. O guard cliente consulta /usuario;
  // nenhum JSON de navegação é usado como identidade no servidor.
  void requisicao
  const resposta = NextResponse.next()
  resposta.headers.set('Cache-Control', 'no-store')
  return resposta
}

export const config = {
  matcher: ['/account/:path*', '/orders/:path*', '/checkout', '/confirmation/:path*', '/dashboard/:path*', '/admin/:path*', '/login', '/login/register'],
}
