import Link from 'next/link'

const grupos = [
  {
    titulo: 'Plataforma',
    itens: [
      { texto: 'Explorar o catálogo', href: '/search' },
      { texto: 'Ateliê ao vivo', href: '/videos' },
      { texto: 'Agenda de eventos', href: '/events' },
      { texto: 'Para cooperativas', href: '/about/cooperatives' },
    ],
  },
  {
    titulo: 'Institucional',
    itens: [
      { texto: 'Quem somos', href: '/about/who-we-are' },
      { texto: 'Imprensa', href: '/about/press' },
      { texto: 'Termos de uso', href: '/about/terms' },
      { texto: 'Privacidade', href: '/about/privacy' },
      { texto: 'Mapa de telas', href: '/screens' },
    ],
  },
]

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape-grade">
          <div className="rodape-marca">
            <Link href="/" className="rodape-logo" aria-label="Balaio, artesanato de Pernambuco">
              <img className="marca-logo" src="/balaio-logo.svg" alt="" width={48} height={48} />
              <span className="marca-nome">Balaio</span>
            </Link>
            <p className="rodape-sobre">
              Artesanato de Pernambuco, direto de quem faz. Origem, técnica e história em cada peça.
            </p>
          </div>

          <div className="rodape-colunas">
            {grupos.map((grupo) => (
              <nav key={grupo.titulo} aria-label={grupo.titulo}>
                <p className="rodape-titulo">{grupo.titulo}</p>
                <ul className="rodape-lista">
                  {grupo.itens.map((item) => (
                    <li key={item.texto}>
                      <Link href={item.href}>{item.texto}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="rodape-base">
          <span>© 2026 Balaio</span>
          <span className="rodape-nota">Marketplace do artesanato de Pernambuco. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  )
}
