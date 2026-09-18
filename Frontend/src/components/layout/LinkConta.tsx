'use client'

import Link from 'next/link'
import { IconeUsuario } from '@/components/ui/Icones'
import { destinoInicial, ROTULO_AREA_POR_PAPEL } from '@/services/sessao/cookie'
import { useSessao } from '@/store/sessao'

export default function LinkConta() {
  const { sessao } = useSessao()

  if (!sessao) {
    return (
      <Link href="/login" className="cabecalho-link">
        <IconeUsuario />
        <span className="rotulo-acao">Entrar</span>
      </Link>
    )
  }

  const rotulo = sessao.papel === 'comprador' ? sessao.nome.split(' ')[0] : ROTULO_AREA_POR_PAPEL[sessao.papel]

  return (
    <Link href={destinoInicial(sessao)} className="cabecalho-link" title={`Conectado como ${sessao.nome}`}>
      <IconeUsuario />
      <span className="rotulo-acao">{rotulo}</span>
    </Link>
  )
}
