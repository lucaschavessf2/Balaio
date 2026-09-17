import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { obterUsuario } from '@/services/api/conta.servico'

export const COOKIE_SESSAO = 'balaio_sessao'

export async function exigirUsuario() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value
  if (!token) redirect('/login')
  const { dados } = await obterUsuario(token)
  if (!dados) redirect('/login')
  return dados
}
