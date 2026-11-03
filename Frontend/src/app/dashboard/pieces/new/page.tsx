import FormPeca from '@/components/painel/FormPeca'
import { obterPeca } from '@/services/api/pecas.servico'
import { exigirArtesao } from '@/services/autenticacao'

type Props = { searchParams: Promise<{ base?: string | string[] }> }

export default async function NovaPeca({ searchParams }: Props) {
  const { artesao, token } = await exigirArtesao()
  const { base } = await searchParams
  const slugModelo = Array.isArray(base) ? base[0] : base
  if (!slugModelo) return <FormPeca />
  const resposta = await obterPeca(slugModelo, token)
  const modelo = resposta.dados?.artesao === artesao.slug ? resposta.dados : undefined
  return <FormPeca modelo={modelo} />
}
