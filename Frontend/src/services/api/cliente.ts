import { falha, type RespostaApi } from './tipos'

const BASE = typeof window === 'undefined'
  ? (process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1')
  : '/api/v1'

export async function buscar<T>(caminho: string, opcoes?: RequestInit): Promise<RespostaApi<T>> {
  try {
    const resposta = await fetch(`${BASE}${caminho}`, {
      cache: 'no-store',
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes?.headers },
      signal: opcoes?.signal ?? AbortSignal.timeout(10000),
    })
    const corpo = await resposta.json().catch(() => null)
    if (!resposta.ok) {
      return falha(corpo?.erro?.codigo ?? `HTTP_${resposta.status}`, corpo?.erro?.mensagem ?? 'Não foi possível concluir a solicitação.')
    }
    if (!corpo || !('dados' in corpo) || !('erro' in corpo)) return falha('RESPOSTA_INVALIDA', 'O servidor retornou uma resposta inválida.')
    return corpo as RespostaApi<T>
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
