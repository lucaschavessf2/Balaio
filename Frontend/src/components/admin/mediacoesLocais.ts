import { mediacoes } from '@/mocks/pedidos'
import { type Mediacao } from '@/types/dominio'

const CHAVE = 'al-mediacoes'

export function lerMediacoesLocais(): Mediacao[] {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return []
    const lista: unknown = JSON.parse(bruto)
    if (!Array.isArray(lista)) return []
    return lista.filter(
      (item): item is Mediacao =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Mediacao).id === 'string' &&
        typeof (item as Mediacao).pedido === 'string' &&
        typeof (item as Mediacao).assunto === 'string',
    )
  } catch {
    return []
  }
}

export function salvarMediacaoLocal(mediacao: Mediacao) {
  try {
    const demais = lerMediacoesLocais().filter((m) => m.id !== mediacao.id)
    localStorage.setItem(CHAVE, JSON.stringify([...demais, mediacao]))
  } catch {}
}

export function mediacaoDoPedido(pedidoId: string): Mediacao | undefined {
  return lerMediacoesLocais().find((m) => m.pedido === pedidoId)
}

export function proximoIdMediacao(): string {
  const maiorSemente = mediacoes.reduce((maior, m) => {
    const numero = Number(m.id.replace('MED-', ''))
    return Number.isFinite(numero) ? Math.max(maior, numero) : maior
  }, 0)
  return `MED-${maiorSemente + lerMediacoesLocais().length + 1}`
}
