export function validarObrigatorio(valor: string, mensagem = 'Preencha este campo'): string | null {
  return valor.trim() ? null : mensagem
}

export function validarCEP(valor: string): string | null {
  return /^\d{5}-?\d{3}$/.test(valor.trim()) ? null : 'Digite um CEP válido, como 50000-000'
}

export function validarEmail(valor: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ? null : 'Digite um e-mail válido, como voce@exemplo.com'
}

export function validarSenha(valor: string): string | null {
  if (!valor.trim()) return 'Crie uma senha'
  return valor.length >= 8 ? null : 'A senha precisa de no mínimo 8 caracteres'
}

export function validarPreco(valor: string): string | null {
  const numero = numeroDoPreco(valor)
  if (!valor.trim() || Number.isNaN(numero) || numero <= 0) return 'Digite um preço válido, como 180,00'
  return null
}

export function numeroDoPreco(valor: string): number {
  const limpo = valor.trim().replace(/[^\d,.-]/g, '')
  if (!limpo) return Number.NaN
  return Number(limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo)
}

export function validarPrazoDias(valor: string): string | null {
  const numero = Number(valor)
  if (!Number.isInteger(numero) || numero < 1) return 'Digite um prazo em dias inteiros, no mínimo 1'
  if (numero > 120) return 'O prazo máximo é de 120 dias'
  return null
}

export function validarEstado(valor: string): string | null {
  return /^[A-Z]{2}$/.test(valor.trim()) ? null : 'Selecione uma UF válida na lista'
}
