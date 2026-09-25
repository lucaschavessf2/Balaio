import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { obterUsuario } from '@/services/api/conta.servico'
import { obterMeuAtelie } from '@/services/api/artesaos.servico'

export const COOKIE_SESSAO = 'balaio_sessao'

export async function tokenDaSessao() {
  return (await cookies()).get(COOKIE_SESSAO)?.value
}

export async function exigirSessao() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value
  if (!token) redirect('/login')
  const { dados } = await obterUsuario(token)
  if (!dados) redirect('/login')
  return { usuario: dados, token }
}

export async function exigirUsuario() {
  return (await exigirSessao()).usuario
}

export async function exigirArtesao() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value
  if (!token) redirect('/login')
  const [{ dados: usuario }, { dados: artesao }] = await Promise.all([obterUsuario(token), obterMeuAtelie(token)])
  if (!usuario || !artesao) redirect('/account')
  return { usuario, artesao, token }
}
