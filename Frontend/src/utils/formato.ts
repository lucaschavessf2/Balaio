import type { Peca } from '@/types/dominio'

export function emReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function precoComDesconto(peca: Pick<Peca, 'preco' | 'desconto'>): number {
  if (!peca.desconto) return peca.preco
  return Math.round(peca.preco * (100 - peca.desconto)) / 100
}
