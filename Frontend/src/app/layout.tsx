import type { Metadata } from 'next'
import Provedores from '@/store/provedores'
import { lerSessao } from '@/services/sessao/servidor'
import { Avisador } from '@/components/feedback/Avisos'
import { classesDeFonte } from './fontes'
import '@/styles/index.css'

export const metadata: Metadata = {
  title: 'Balaio: artesanato de Pernambuco',
  description:
    'Marketplace da economia criativa e do artesanato de Pernambuco. Conecta artesãos a compradores destacando origem, técnica e a história de cada peça.',
  icons: { icon: '/balaio-logo.svg' },
}

const aplicarTemaSalvo = `try{var t=localStorage.getItem('tema');if(t==='claro'||t==='escuro'){document.documentElement.dataset.tema=t}}catch(erro){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessao = await lerSessao()
  return (
    <html lang="pt-BR" className={classesDeFonte} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: aplicarTemaSalvo }} />
      </head>
      <body>
        <Provedores sessao={sessao}>{children}</Provedores>
        <Avisador />
      </body>
    </html>
  )
}
