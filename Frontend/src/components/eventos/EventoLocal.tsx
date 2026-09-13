'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { EstadoVazio } from '@/components/ui/Basicos'
import { IconeCalendario } from '@/components/ui/Icones'
import DetalheEvento from '@/components/eventos/DetalheEvento'
import { acharEventoLocal } from '@/components/eventos/eventosLocais'
import type { Evento } from '@/mocks/eventos'

export default function EventoLocal({ slug }: { slug: string }) {
  const [evento, definirEvento] = useState<Evento | null | undefined>(undefined)

  useEffect(() => {
    definirEvento(acharEventoLocal(slug) ?? null)
  }, [slug])

  if (evento === undefined) return null

  if (evento === null) {
    return (
      <EstadoVazio
        icone={<IconeCalendario tamanho={34} />}
        titulo="Evento não encontrado"
        descricao="Ele pode ter sido publicado em outro navegador. Sem o backend, cada evento criado fica salvo só no aparelho de quem criou."
        acao={
          <Link href="/events" className="botao botao-primario">
            Ver a agenda de eventos
          </Link>
        }
      />
    )
  }

  return <DetalheEvento evento={{ ...evento, criadoPorVoce: true }} />
}
