import { falha, type RespostaApi } from './tipos'

export const API_FAKE = process.env.NEXT_PUBLIC_API_FAKE !== 'false'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

export async function buscar<T>(caminho: string, opcoes?: RequestInit): Promise<RespostaApi<T>> {
  try {
    const resposta = await fetch(`${BASE}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    })
    return (await resposta.json()) as RespostaApi<T>
  } catch {
    return falha('ERRO_REDE', 'Não foi possível falar com o servidor.')
  }
}

export function enviar<T>(caminho: string, corpo: unknown, metodo = 'POST'): Promise<RespostaApi<T>> {
  return buscar<T>(caminho, { method: metodo, body: JSON.stringify(corpo) })
}

export function montarQuery(filtros: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor))
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}
