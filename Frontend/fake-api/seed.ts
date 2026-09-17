import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pecas } from '../src/mocks/pecas'
import { artesaos } from '../src/mocks/artesaos'
import { coletivos } from '../src/mocks/coletivos'
import { eventos } from '../src/mocks/eventos'
import { videos, comentarios, etiquetasEmAlta } from '../src/mocks/videos'
import { pedidos, conversa, conversasArtesao, pedidosPendentesArtesao, filaCuradoria, mediacoes } from '../src/mocks/pedidos'
import { usuarioAtual } from '../src/mocks/usuario'
import { opcoesFrete } from '../src/mocks/frete'
import { tecnicas, territorios, categorias } from '../src/constants/referencias'

const comId = <T extends { slug: string }>(itens: T[]) => itens.map((item) => ({ ...item, id: item.slug }))
const dados = {
  pecas: comId(pecas), artesaos: comId(artesaos), coletivos: comId(coletivos), eventos: comId(eventos),
  videos, pedidos, conversasArtesao, pedidosPendentes: pedidosPendentesArtesao,
  curadoria: filaCuradoria, mediacoes,
  mensagens: conversa.map((mensagem, i) => ({ ...mensagem, id: `msg-${i + 1}`, pedidoId: pedidos[0].id })),
  comentarios: Object.entries(comentarios).flatMap(([videoId, itens]) => itens.map((item, i) => ({ ...item, id: `${videoId}-${i}`, videoId }))),
  usuario: usuarioAtual, fretes: opcoesFrete,
  referencias: { tecnicas, territorios, categorias, etiquetas: etiquetasEmAlta },
  avaliacoes: [],
}
writeFileSync(fileURLToPath(new URL('./seed.json', import.meta.url)), JSON.stringify(dados, null, 2) + '\n')
console.log('Seed gerado a partir dos dados de demonstração do Balaio.')
