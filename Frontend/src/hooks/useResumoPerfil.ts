'use client'

import type { Sessao } from '@/services/sessao/cookie'
import type { Artesao, EstadoSelo } from '@/types/dominio'

export type ResumoPerfil = {
  pedidosEmAndamento?: number
  pendentes?: number
  naoLidas?: number
  artesao?: Artesao
  selo?: EstadoSelo
  filaCuradoria?: number
  mediacoes?: number
}

export function useResumoPerfil(sessao: Sessao | null, aberto: boolean): ResumoPerfil {
  // O menu identifica a conta real. Contadores Fake ficam nas telas marcadas
  // como demonstração, sem atribuí-los ao UUID autenticado no profile.
  void sessao
  void aberto
  return {}
}
