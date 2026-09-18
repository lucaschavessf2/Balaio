import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { COOKIE_SESSAO, destinoInicial, lerSessaoDoCookie, rotaDeLogin, type Sessao } from './cookie'

export async function lerSessao(): Promise<Sessao | null> {
  const armazenamento = await cookies()
  return lerSessaoDoCookie(armazenamento.get(COOKIE_SESSAO)?.value)
}

export async function exigirSessao(proximo: string): Promise<Sessao> {
  const sessao = await lerSessao()
  if (!sessao) redirect(rotaDeLogin(proximo))
  return sessao
}

export async function exigirArtesao(): Promise<Sessao & { artesao: string }> {
  const sessao = await exigirSessao('/dashboard')
  if (sessao.papel !== 'artesao' || !sessao.artesao) redirect(destinoInicial(sessao))
  return sessao as Sessao & { artesao: string }
}

export async function exigirAdmin(proximo: string): Promise<Sessao> {
  const sessao = await exigirSessao(proximo)
  if (sessao.papel !== 'admin') redirect(destinoInicial(sessao))
  return sessao
}

export async function exigirDonoDoPedido(pedido: { id: string; compradorId?: string } | null, proximo: string) {
  const sessao = await exigirSessao(proximo)
  if (!pedido || pedido.compradorId !== sessao.id) notFound()
  return sessao
}
