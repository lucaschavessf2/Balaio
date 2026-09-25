import type { Peca } from '@/types/dominio'

export function emReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function precoComDesconto(peca: Pick<Peca, 'preco' | 'desconto'>): number {
  if (!peca.desconto) return peca.preco
  return Math.round(peca.preco * (100 - peca.desconto)) / 100
}

export function emMilhares(n: number): string {
  if (n < 1000) return String(n)
  const valor = n / 1000
  return `${valor.toFixed(valor >= 10 ? 0 : 1).replace('.', ',')} mil`
}
