'use client'

import Link from 'next/link'
import { Retrato } from '@/components/ui/Basicos'
import { IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { useDados } from '@/store/dados'
import { artesaoDoPainel, itensPorGrupo, type ChavePainel } from '@/components/painel/itensPainel'

export default function MenuPainelLateral({ ativo }: { ativo: ChavePainel }) {
  const { artesaos } = useDados()
  const artesao = artesaos.find((a) => a.slug === artesaoDoPainel)

  return (
    <nav className="menu-lateral" aria-label="Menu do painel">
      {artesao && (
        <div className="menu-oficina">
          <Retrato imagem={artesao.imagem} tamanho={44} />
          <div className="encolhivel">
            <p className="menu-oficina-nome">{artesao.atelie}</p>
            <p className="menu-oficina-local">{artesao.territorio}</p>
          </div>
        </div>
      )}

      {itensPorGrupo().map((grupo) => (
        <div className="menu-grupo" key={grupo.grupo}>
          <p className="menu-grupo-rotulo">{grupo.rotulo}</p>
          {grupo.itens.map((item) => (
            <Link
              key={item.chave}
              href={item.href}
              className={`menu-item${item.chave === ativo ? ' menu-item-ativo' : ''}`}
              aria-current={item.chave === ativo ? 'page' : undefined}
            >
              {item.icone}
              {item.texto}
              {item.marcador && (
                <span className={`menu-marcador${item.marcador.alerta ? ' menu-marcador-alerta' : ''}`}>
                  {item.marcador.texto}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}

      {artesao && (
        <Link href={`/artisans/${artesao.slug}`} className="menu-ver-loja">
          <IconeSelo tamanho={16} />
          Ver minha loja
          <IconeSetaDireita tamanho={14} />
        </Link>
      )}
    </nav>
  )
}
