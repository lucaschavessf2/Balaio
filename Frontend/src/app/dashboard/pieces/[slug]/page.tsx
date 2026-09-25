import { notFound } from 'next/navigation'
import FormPeca from '@/components/painel/FormPeca'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

type Props = { params: Promise<{ slug: string }> }

export default async function EditarPeca({ params }: Props) {
  const { artesao } = await exigirArtesao()
  const { slug } = await params
  const resposta = await pecasPorArtesao(artesao.slug)
  const peca = resposta.dados?.find((item) => item.slug === slug)
  if (!peca) notFound()
  return <FormPeca key={peca.slug} peca={peca} />
}
