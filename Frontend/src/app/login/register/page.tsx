import Link from 'next/link'
import LayoutAuth from '@/components/auth/LayoutAuth'
import FormCadastro from '@/components/forms/FormCadastro'
import { obterReferencias } from '@/services/api/referencias.servico'

export const metadata = {
  title: 'Criar conta no Balaio',
  description: 'Cadastro de comprador ou artesão no Balaio.',
}

const vantagens = [
  'Uma conta só para comprar e para vender',
  'Artesãos informais vendem normalmente, sem CNPJ',
  'Seu ateliê ganha uma loja com a sua história',
]

export default async function Cadastrar() {
  const { dados } = await obterReferencias()

  return (
    <LayoutAuth
      trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar', href: '/login' }, { texto: 'Criar conta' }]}
      titulo="Criar sua conta"
      apoio="Leva menos de dois minutos. O que pedimos muda conforme você vem comprar ou vender."
      frase="Quem faz e quem compra, no mesmo balaio."
      destaques={vantagens}
      rodape={
        <p>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      }
    >
      <FormCadastro tecnicas={dados?.tecnicas ?? []} territorios={dados?.territorios ?? []} />
    </LayoutAuth>
  )
}
