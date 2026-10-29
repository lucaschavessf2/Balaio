'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useSessao } from '@/store/sessao'
import { destinoInicial, destinoSeguro, rotaDeLogin } from '@/services/sessao/cookie'
import { rotaProtegida, rotaContaDisponivel } from '@/services/sessao/rotas'
import BotaoSair from '@/components/conta/BotaoSair'

export default function ProtecaoRotas({ children }: { children: ReactNode }) {
  const caminho = usePathname()
  const roteador = useRouter()
  const { sessao, estado, revalidar, saidaPendente } = useSessao()
  const protegida = rotaProtegida(caminho)
  const pendente = protegida && !rotaContaDisponivel(caminho)
  const visitante = caminho === '/login' || caminho === '/login/register'
  useEffect(() => {
    if (protegida && estado === 'anonima' && !saidaPendente) roteador.replace(rotaDeLogin(caminho + window.location.search))
    else if (pendente && estado === 'autenticada') roteador.replace('/account')
    else if (visitante && estado === 'autenticada' && sessao) {
      const proximo = destinoSeguro(new URLSearchParams(window.location.search).get('proximo') ?? undefined)
      roteador.replace(proximo && (!rotaProtegida(proximo.split('?')[0]) || rotaContaDisponivel(proximo.split('?')[0])) ? proximo : destinoInicial(sessao))
    }
  }, [caminho, protegida, pendente, visitante, estado, sessao, roteador, saidaPendente])
  if (!protegida) return children
  if (saidaPendente) return <main className="pagina"><p role="alert">A saída não foi confirmada pelo servidor. Os dados locais foram limpos; tente encerrar a sessão novamente.</p><BotaoSair /></main>
  if (estado === 'verificando' || estado === 'anonima') return <main className="pagina" role="status">Verificando sessão…</main>
  if (estado === 'indisponivel') return <main className="pagina"><p role="alert">Não foi possível validar sua sessão.</p>
    <button className="botao botao-primario" onClick={() => void revalidar()}>Tentar novamente</button><BotaoSair /></main>
  if (estado === 'sem-permissao') return <main className="pagina">
    <h1>Acesso não permitido</h1><p role="alert">Sua conta não possui permissão para esta área (403).</p><Link href="/account">Voltar para minha conta</Link>
  </main>
  return pendente ? null : children
}
