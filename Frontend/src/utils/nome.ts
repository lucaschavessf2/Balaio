const TRATAMENTOS_QUE_ACOMPANHAM_O_NOME = new Set(['mestre', 'mestra', 'dona', 'seu'])
const PREFIXOS_DESCARTADOS = new Set(['artesao', 'artesa'])
const ACENTOS = /[\u0300-\u036f]/g

function semAcento(palavra: string): string {
  return palavra.normalize('NFD').replace(ACENTOS, '').toLowerCase()
}

export function nomeCurto(nome: string): string {
  const palavras = nome.replace(/\([^)]*\)/g, ' ').trim().split(/\s+/).filter(Boolean)
  while (palavras.length > 1 && PREFIXOS_DESCARTADOS.has(semAcento(palavras[0]))) palavras.shift()
  if (!palavras.length) return nome.trim()
  if (palavras.length > 1 && TRATAMENTOS_QUE_ACOMPANHAM_O_NOME.has(semAcento(palavras[0]))) return `${palavras[0]} ${palavras[1]}`
  return palavras[0]
}
