import Link from 'next/link'
import LayoutAuth from '@/components/auth/LayoutAuth'
import FormRecuperar from '@/components/forms/FormRecuperar'

const ajudas = [
  'O link chega no e-mail que você usou no cadastro',
  'Se você se cadastrou pela associação do seu território, ela pode pedir a recuperação por você',
  'O suporte responde em até um dia útil',
]

export default function Recuperar() {
  return (
    <LayoutAuth
      trilha={[{ texto: 'Início', href: '/' }, { texto: 'Entrar', href: '/login' }, { texto: 'Recuperar senha' }]}
      titulo="Recuperar sua senha"
      apoio="Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova."
      frase="Acontece com todo mundo. Em um minuto você volta para o seu ateliê."
      destaques={ajudas}
      rodape={
        <p>
          Lembrou a senha? <Link href="/login">Voltar para o login</Link>
        </p>
      }
    >
      <FormRecuperar />
    </LayoutAuth>
  )
}
