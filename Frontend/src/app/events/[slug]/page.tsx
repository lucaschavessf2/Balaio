import Pagina from '@/components/layout/Pagina'
import { Migalhas } from '@/components/ui/Basicos'
import DetalheEvento from '@/components/eventos/DetalheEvento'
import { notFound } from 'next/navigation'
import EstadoErro from '@/components/feedback/EstadoErro'
import { obterEvento } from '@/services/api/eventos.servico'

export const dynamic = 'force-dynamic'

export default async function PaginaEvento({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { dados: evento, erro } = await obterEvento(slug)

  if (erro?.codigo === 'RECURSO_NAO_ENCONTRADO') notFound()
  return (
    <Pagina>
      <Migalhas
        trilha={[
          { texto: 'Início', href: '/' },
          { texto: 'Eventos', href: '/events' },
          { texto: evento ? evento.nome : 'Evento' },
        ]}
      />

      {erro ? <EstadoErro mensagem={erro.mensagem} /> : evento && <DetalheEvento evento={evento} />}
    </Pagina>
  )
}
