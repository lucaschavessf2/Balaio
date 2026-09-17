// O servidor valida colisões; o sufixo permite publicar eventos com nomes repetidos.
export function gerarSlugEvento(nome: string): string {
  const base = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return (base || 'evento') + '-' + crypto.randomUUID().slice(0, 8)
}
