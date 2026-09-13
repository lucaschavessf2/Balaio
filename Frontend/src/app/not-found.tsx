import Link from 'next/link'
import Pagina from '@/components/layout/Pagina'
import { IconeBusca, IconeSetaDireita } from '@/components/ui/Icones'

function PedestalVazio() {
  return (
    <svg viewBox="0 0 320 260" className="pedestal" role="img" aria-label="Pedestal vazio">
      <defs>
        <linearGradient id="barro404" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9a273" />
          <stop offset="100%" stopColor="#a85a2c" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="232" rx="112" ry="16" fill="#111625" opacity="0.12" />
      <path d="M96 232h128l-12-64H108z" fill="url(#barro404)" />
      <rect x="88" y="150" width="144" height="20" rx="6" fill="#c2703c" />
      <rect x="100" y="140" width="120" height="12" rx="5" fill="#e0a878" />
      <g stroke="#0045a9" strokeWidth="3" strokeDasharray="10 9" fill="none" opacity="0.55">
        <path d="M160 44q-34 18-34 50 0 20 12 34-50 34-50 100" />
        <path d="M160 44q34 18 34 50 0 20-12 34 50 34 50 100" />
        <ellipse cx="160" cy="44" rx="34" ry="12" />
      </g>
      <circle cx="160" cy="116" r="7" fill="#ed1c24" opacity="0.9" />
    </svg>
  )
}

export default function NaoEncontrada() {
  return (
    <Pagina>
      <div className="tela-404">
        <section className="bloco-404">
          <div className="bloco-404-arte">
            <PedestalVazio />
          </div>

          <p className="numero-404" aria-hidden>
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </p>
          <h1 className="titulo-pagina">Esta peça não está mais aqui</h1>
          <p className="subtitulo-pagina">
            O endereço pode estar errado, ou a peça era única e alguém levou primeiro. Acontece: no artesanato, cada
            uma existe uma vez só.
          </p>

          <div className="acoes-linha bloco-404-acoes">
            <Link href="/" className="botao botao-primario">
              Voltar ao catálogo
              <IconeSetaDireita />
            </Link>
            <Link href="/search" className="botao botao-secundario">
              <IconeBusca />
              Buscar uma peça
            </Link>
          </div>
        </section>
      </div>
    </Pagina>
  )
}
