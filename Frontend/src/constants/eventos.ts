import type { Ponto, TipoEvento } from '@/types/dominio'

export const rotuloTipoEvento: Record<TipoEvento, string> = {
  feira: 'Feira',
  festival: 'Festival',
  exposicao: 'Exposição',
  oficina: 'Oficina aberta',
}

export const pontoPadrao: Ponto = { lat: -8.0631, lng: -34.8711 }

export const municipiosPE: ({ nome: string } & Ponto)[] = [
  { nome: 'Recife', lat: -8.0631, lng: -34.8711 },
  { nome: 'Olinda', lat: -8.0089, lng: -34.8553 },
  { nome: 'Caruaru', lat: -8.2829, lng: -35.9722 },
  { nome: 'Tracunhaém', lat: -7.8047, lng: -35.24 },
  { nome: 'Goiana', lat: -7.5606, lng: -35.0025 },
  { nome: 'Gravatá', lat: -8.2015, lng: -35.5646 },
  { nome: 'Bezerros', lat: -8.2333, lng: -35.7971 },
  { nome: 'Pesqueira', lat: -8.3576, lng: -36.6966 },
  { nome: 'Garanhuns', lat: -8.8829, lng: -36.4966 },
  { nome: 'Serra Talhada', lat: -7.9856, lng: -38.2963 },
  { nome: 'Petrolina', lat: -9.3891, lng: -40.503 },
  { nome: 'Ipojuca', lat: -8.3989, lng: -35.0637 },
]
