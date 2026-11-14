import { sessaoDoUsuario, type Sessao } from './cookie'
import { urlDoGateway } from '@/services/api/gateway'
import type { Usuario } from '@/types/dominio'

export async function validarSessaoBackend(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null
  const base = urlDoGateway() ?? (process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1').replace(/\/$/, '')
  try {
    const resposta = await fetch(`${base}/usuario`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!resposta.ok) return null
    const corpo = await resposta.json()
    return corpo?.dados ? sessaoDoUsuario(corpo.dados as Usuario) : null
  } catch {
    return null
  }
}
