import { falha, type RespostaApi } from './tipos'
import { revisaoDaSessao } from '@/services/sessao/requisicoes'

const BASE = typeof window === 'undefined'
  ? (process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1')
  : '/api/v1'

export async function buscar<T>(caminho: string, opcoes?: RequestInit, baseUrl = BASE): Promise<RespostaApi<T>> {
  const revisao = revisaoDaSessao()
  try {
    const resposta = await fetch(`${baseUrl}${caminho}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes?.headers },
      signal: opcoes?.signal ?? AbortSignal.timeout(10000),
    })
    const corpo = await resposta.json().catch(() => null)
    if (!resposta.ok) {
      if (typeof window !== 'undefined' && revisao === revisaoDaSessao()
        && resposta.headers.get('X-Balaio-Sessao') === 'invalida') {
        window.dispatchEvent(new Event('balaio:sessao-invalida'))
      }
      const resultado = falha(corpo?.erro?.codigo ?? `HTTP_${resposta.status}`, corpo?.erro?.mensagem ?? 'Não foi possível concluir a solicitação.')
      resultado.erro!.status = resposta.status
      return resultado
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
