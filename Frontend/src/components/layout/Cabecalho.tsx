'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import BarraDepartamentos from '@/components/layout/BarraDepartamentos'
import BuscaCabecalho from '@/components/layout/BuscaCabecalho'
import { IconeBusca, IconeSacola } from '@/components/ui/Icones'
import AlternadorTema from '@/components/layout/AlternadorTema'
import ContadorSacola from '@/components/carrinho/ContadorSacola'
import MenuPerfil from '@/components/perfil/MenuPerfil'
import { listarArtesaos } from '@/services/api/artesaos.servico'
import { listarPecas } from '@/services/api/pecas.servico'
import { obterReferencias } from '@/services/api/referencias.servico'

function BuscaInicial() {
  return (
    <div className="cabecalho-busca">
      <form action="/search" role="search">
        <button type="submit" className="cabecalho-busca-botao" aria-label="Buscar"><IconeBusca /></button>
        <label className="so-leitor" htmlFor="busca-topo">Buscar peças</label>
        <input id="busca-topo" name="q" type="search" placeholder="Buscar técnica, artesão, território..." autoComplete="off" />
      </form>
    </div>
  )
}

export default function Cabecalho() {
  const [sugestoes, definirSugestoes] = useState<string[]>([])

  useEffect(() => {
    let ativo = true
    void Promise.all([listarPecas(), obterReferencias(), listarArtesaos()]).then(([pecasResp, refs, autores]) => {
      if (!ativo) return
      const base = refs.dados ? [...refs.dados.tipos, ...refs.dados.tecnicas, ...refs.dados.territorios, ...refs.dados.categorias] : []
      definirSugestoes(Array.from(new Set([
        ...(pecasResp.dados ?? []).map((peca) => peca.nome),
        ...base,
        ...(autores.dados ?? []).map((artesao) => artesao.nome),
      ])))
    })
    return () => { ativo = false }
  }, [])

  return (
    <header className="cabecalho">
      <div className="container cabecalho-linha">
        <Link href="/" className="marca" aria-label="Balaio, artesanato de Pernambuco">
          <img className="marca-logo" src="/balaio-logo.svg" alt="" width={52} height={52} />
          <span>
            <span className="marca-nome">Balaio</span>
            <span className="marca-linha">Artesanato de Pernambuco</span>
          </span>
        </Link>

        <Suspense fallback={<BuscaInicial />}>
          <BuscaCabecalho sugestoes={sugestoes} />
        </Suspense>

        <div className="cabecalho-acoes">
          <AlternadorTema />

          <MenuPerfil />

          <Link href="/cart" className="cabecalho-link sacola">
            <IconeSacola />
            Sacola
            <ContadorSacola />
          </Link>
        </div>
      </div>
      <Suspense>
        <BarraDepartamentos />
      </Suspense>
    </header>
  )
}
