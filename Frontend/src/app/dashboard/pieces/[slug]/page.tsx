import { notFound } from 'next/navigation'
import FormPeca from '@/components/painel/FormPeca'
import { obterPeca } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

type Props = { params: Promise<{ slug: string }> }

export default async function EditarPeca({ params }: Props) {
  const { artesao, token } = await exigirArtesao()
  const { slug } = await params
  const resposta = await obterPeca(slug, token)
  const peca = resposta.dados
  if (!peca || peca.artesao !== artesao.slug) notFound()
  return <FormPeca key={peca.slug} peca={peca} />
}
