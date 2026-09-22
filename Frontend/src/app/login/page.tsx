import Link from 'next/link'
import LayoutAuth from '@/components/auth/LayoutAuth'
import FormEntrar from '@/components/forms/FormEntrar'
import { destinoSeguro } from '@/services/sessao/cookie'

const promessas = [
  'Origem e autoria verificadas em cada peça',
  'Converse com o artesão antes de comprar',
  'O repasse só chega ao ateliê depois da entrega',
]

type Props = { searchParams: Promise<{ proximo?: string }> }

export default async function Entrar({ searchParams }: Props) {
  const { proximo } = await searchParams

  return (
    <LayoutAuth
      trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar' }]}
      titulo="Entrar"
      apoio="Uma conta só para comprar, vender e acompanhar seus pedidos."
      frase="Do barro, da linha e da madeira de Pernambuco, direto de quem faz."
      destaques={promessas}
      rodape={
        <p>
          Ainda não tem conta? <Link href="/login/register">Criar conta</Link>
        </p>
      }
    >
      <FormEntrar proximo={destinoSeguro(proximo)} />
    </LayoutAuth>
  )
}
