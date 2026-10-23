import { falha, type RespostaApi } from './tipos'

export type OrigemApi = 'fake' | 'gateway'
type OpcoesRequisicao = RequestInit & { origem?: OrigemApi }

export async function buscar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<RespostaApi<T>> {
  const { origem = 'fake', ...opcoesFetch } = opcoes
  const noServidor = typeof window === 'undefined'
  if (origem === 'gateway' && !noServidor) {
    return falha('ORIGEM_INDISPONIVEL', 'A origem Gateway está disponível apenas no servidor.')
  }
  const gateway = noServidor ? process.env.GATEWAY_API_URL?.trim() : undefined
  if (origem === 'gateway' && !gateway) {
    return falha('GATEWAY_NAO_CONFIGURADO', 'Configure GATEWAY_API_URL para acessar o Gateway.')
  }
  const base = origem === 'gateway'
    ? gateway!
    : noServidor ? (process.env.API_URL ?? 'http://127.0.0.1:3001/api/v1') : '/api/v1'

  try {
    const resposta = await fetch(`${base.replace(/\/$/, '')}${caminho}`, {
      cache: 'no-store',
      ...opcoesFetch,
      headers: { 'Content-Type': 'application/json', ...opcoesFetch.headers },
      signal: opcoesFetch.signal ?? AbortSignal.timeout(10000),
    })
    const corpo = await resposta.json().catch(() => null)
    if (!resposta.ok) {
      return falha(corpo?.erro?.codigo ?? `HTTP_${resposta.status}`, corpo?.erro?.mensagem ?? 'Não foi possível concluir a solicitação.', corpo?.erro?.campos)
    }
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo) || !('dados' in corpo) || !('erro' in corpo)) return falha('RESPOSTA_INVALIDA', 'O servidor retornou uma resposta inválida.')
    return corpo as RespostaApi<T>
  } catch {
    return falha('ERRO_REDE', 'Não foi possível falar com o servidor.')
  }
}

export function enviar<T>(caminho: string, corpo: unknown, metodo = 'POST', origem: OrigemApi = 'fake'): Promise<RespostaApi<T>> {
  return buscar<T>(caminho, { method: metodo, body: JSON.stringify(corpo), origem })
}

export function montarQuery(filtros: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor))
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}
