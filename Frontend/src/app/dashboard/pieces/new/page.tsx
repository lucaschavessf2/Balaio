import FormPeca from '@/components/painel/FormPeca'
import { pecasPorArtesao } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

type Props = { searchParams: Promise<{ base?: string | string[] }> }

export default async function NovaPeca({ searchParams }: Props) {
  const { artesao } = await exigirArtesao()
  const { base } = await searchParams
  const slugModelo = Array.isArray(base) ? base[0] : base
  if (!slugModelo) return <FormPeca />
  const resposta = await pecasPorArtesao(artesao.slug)
  const modelo = resposta.dados?.find((peca) => peca.slug === slugModelo)
  return <FormPeca modelo={modelo} />
}
