import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import DetalheEvento from '@/components/eventos/DetalheEvento'
import EventoLocal from '@/components/eventos/EventoLocal'
import { obterEvento, listarEventos } from '@/services/api/eventos.servico'

export async function generateStaticParams() {
  const { dados } = await listarEventos()
  return (dados ?? []).map((e) => ({ slug: e.slug }))
}

export default async function PaginaEvento({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: evento } = await obterEvento(slug)

  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Eventos', href: '/events' },
          { texto: evento ? evento.nome : 'Evento' },
        ]}
      />

      {evento ? <DetalheEvento evento={evento} /> : <EventoLocal slug={slug} />}
    </Pagina>
  )
}
