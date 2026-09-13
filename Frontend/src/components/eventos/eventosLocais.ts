import { acharEvento, eventos, type Evento } from '@/mocks/eventos'

const CHAVE = 'al-eventos'

export function lerEventosLocais(): Evento[] {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return []
    const lista: unknown = JSON.parse(bruto)
    if (!Array.isArray(lista)) return []
    return lista.filter(
      (item): item is Evento =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Evento).slug === 'string' &&
        typeof (item as Evento).nome === 'string' &&
        typeof (item as Evento).lat === 'number' &&
        typeof (item as Evento).lng === 'number',
    )
  } catch {
    return []
  }
}

export function salvarEventoLocal(evento: Evento) {
  try {
    const demais = lerEventosLocais().filter((e) => e.slug !== evento.slug)
    localStorage.setItem(CHAVE, JSON.stringify([...demais, evento]))
  } catch {}
}

export function acharEventoLocal(slug: string): Evento | undefined {
  return lerEventosLocais().find((e) => e.slug === slug)
}

export function todosOsEventos(): Evento[] {
  return [...eventos, ...lerEventosLocais()]
}

export function gerarSlugEvento(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  let slug = base || 'evento'
  let contador = 2
  while (acharEvento(slug) || acharEventoLocal(slug)) {
    slug = `${base}-${contador}`
    contador += 1
  }
  return slug
}
