import type { ReactNode } from 'react'
import {
  IconeCadeado,
  IconeCaminhao,
  IconeJarra,
  IconeQuadro,
  IconeRenda,
  IconeSelo,
  IconeVestuario,
  IconeXicara,
  IconeBrilho,
} from '@/components/ui/Icones'
import type { TipoPeca } from '@/constants/referencias'

export type Garantia = { icone: ReactNode; titulo: string; texto: string; resumo: string }

export const garantias: Garantia[] = [
  {
    icone: <IconeSelo />,
    titulo: 'Artesão verificado',
    texto: 'A curadoria confere, com a associação do território, que o ateliê faz à mão o que vende.',
    resumo: 'Autoria conferida pela curadoria',
  },
  {
    icone: <IconeCadeado />,
    titulo: 'Pagamento retido',
    texto: 'Processado pelo Mercado Pago; liberado ao artesão só após a entrega.',
    resumo: 'Só vai ao ateliê depois da entrega',
  },
  {
    icone: <IconeCaminhao />,
    titulo: 'Envio rastreado',
    texto: 'A peça sai da oficina com código de rastreio e prazo estimado.',
    resumo: 'Código de rastreio em todo pedido',
  },
]

export const iconePorTipo: Record<TipoPeca, ReactNode> = {
  'Jarras & Vasos': <IconeJarra tamanho={26} />,
  'Esculturas & Bonecos': <IconeBrilho tamanho={26} />,
  'Mesa & Cozinha': <IconeXicara tamanho={26} />,
  'Toalhas & Rendas': <IconeRenda tamanho={26} />,
  'Couro: Bolsas, Cintos & Gibões': <IconeVestuario tamanho={26} />,
  'Gravuras & Cordéis': <IconeQuadro tamanho={26} />,
}

export const destaquesEditoriais = [
  { slug: 'o-casamento-de-barro', titulo: 'A matéria ganha vida pelas mãos de Vitalino' },
  { slug: 'leao-imperial-de-tracunhaem', titulo: 'O guardião de barro que leva quatro dias de juba' },
  { slug: 'toalha-renascenca-florescer', titulo: 'Renascença: a renda que respira no ponto aranha' },
  { slug: 'painel-xilogravura-sertaneja', titulo: 'O sertão gravado a goiva, do avesso para a luz' },
]
