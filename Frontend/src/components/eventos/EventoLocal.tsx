'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import EstadoVazio from '@/components/feedback/EstadoVazio'
import { IconeCalendario } from '@/components/ui/Icones'
import DetalheEvento from '@/components/eventos/DetalheEvento'
import { obterEvento } from '@/services/api/eventos.servico'
import type { Evento } from '@/types/dominio'

export default function EventoLocal({ slug }: { slug: string }) {
  const [evento, definirEvento] = useState<Evento | null | undefined>(undefined)

  useEffect(() => {
    let vivo = true
    obterEvento(slug).then((r) => { if (vivo) definirEvento(r.dados) })
    return () => { vivo = false }
  }, [slug])

  if (evento === undefined) return null

  if (evento === null) {
    return (
      <EstadoVazio
        icone={<IconeCalendario tamanho={34} />}
        titulo="Evento não encontrado"
        descricao="O evento não está disponível. Volte para a agenda e tente novamente."
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
