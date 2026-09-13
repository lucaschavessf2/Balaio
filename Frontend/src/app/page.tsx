import Pagina from '@/components/layout/Pagina'
import CatalogoFiltrado from '@/components/produto/CatalogoFiltrado'
import CarrosselDestaques from '@/components/produto/CarrosselDestaques'
import EstadoErro from '@/components/feedback/EstadoErro'
import { listarPecas, obterPeca } from '@/services/api/pecas.servico'

const escolhidos = [
  { slug: 'o-casamento-de-barro', titulo: 'A matéria ganha vida pelas mãos de Vitalino' },
  { slug: 'leao-imperial-de-tracunhaem', titulo: 'O guardião de barro que leva quatro dias de juba' },
  { slug: 'toalha-renascenca-florescer', titulo: 'Renascença: a renda que respira no ponto aranha' },
  { slug: 'painel-xilogravura-sertaneja', titulo: 'O sertão gravado a goiva, do avesso para a luz' },
]

export default async function Home() {
  const respostas = await Promise.all(escolhidos.map(({ slug }) => obterPeca(slug)))
  const destaques = respostas.flatMap((resposta, i) => {
    const peca = resposta.dados
    return peca
      ? [
          {
            slug: peca.slug,
            titulo: escolhidos[i].titulo,
            nome: peca.nome,
            territorio: peca.territorio,
            resumo: peca.historia[0],
            preco: peca.preco,
            imagem: peca.imagem,
          },
        ]
      : []
  })

  const { dados, erro } = await listarPecas()
  if (erro) {
    return (
      <Pagina>
        <EstadoErro mensagem={erro.mensagem} />
      </Pagina>
    )
  }
  const vitrine = (dados ?? []).filter((p) => p.slug !== 'o-casamento-de-barro')

  return (
    <Pagina>
      <CarrosselDestaques destaques={destaques} comEventos />
      <CatalogoFiltrado pecas={vitrine} />
    </Pagina>
  )
}
