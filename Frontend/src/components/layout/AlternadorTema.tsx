'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { definirTema, inscrever, lerTema } from '@/store/tema'

export default function AlternadorTema() {
  const tema = useSyncExternalStore(inscrever, lerTema, () => null)

  const escuro = tema === 'escuro'
  const rotulo = escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'

  return (
    <button
      type="button"
      className="cabecalho-link alternador"
      onClick={() => definirTema(escuro ? 'claro' : 'escuro')}
      title={rotulo}
      aria-label={rotulo}
    >
      {tema === null ? (
        <span className="alternador-espaco" aria-hidden />
      ) : escuro ? (
        <Sun size={18} strokeWidth={2} aria-hidden />
      ) : (
        <Moon size={18} strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
