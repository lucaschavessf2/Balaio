import Link from 'next/link'
import { IconeCalendario, IconeMapa } from '@/components/ui/Icones'
import { resumoParticipantes, rotuloTipoEvento, type Evento } from '@/mocks/eventos'

export default function CartaoEventoMini({ evento }: { evento: Evento }) {
  return (
    <Link href={`/events/${evento.slug}`} className="cartao-evento cartao-evento-mini">
      <span className="cartao-evento-selos">
        <span className="selo selo-neutro">{rotuloTipoEvento[evento.tipo]}</span>
        <span className="cartao-evento-meta cartao-evento-entrada">{evento.entrada}</span>
      </span>
      <span className="cartao-evento-nome">{evento.nome}</span>
      <span className="cartao-evento-meta linha-flex">
        <IconeCalendario tamanho={14} />
        {evento.periodo}
      </span>
      <span className="cartao-evento-meta linha-flex">
        <IconeMapa tamanho={14} />
        {evento.cidade}
      </span>
      <span className="cartao-evento-rodape">
        <span className="cartao-evento-meta">{resumoParticipantes(evento)}</span>
      </span>
    </Link>
  )
}
