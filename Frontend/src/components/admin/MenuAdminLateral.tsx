import Link from 'next/link'
import BotaoSair from '@/components/conta/BotaoSair'
import { IconeSelo, IconeSetaDireita } from '@/components/ui/Icones'
import { itensAdminPorGrupo, type ChaveAdmin, type ContagensAdmin } from '@/components/admin/itensAdmin'

export default function MenuAdminLateral({ ativo, contagens }: { ativo: ChaveAdmin; contagens: ContagensAdmin }) {
  return (
    <nav className="menu-lateral" aria-label="Menu da administração">
      <div className="menu-oficina">
        <span className="menu-admin-selo" aria-hidden>
          <IconeSelo tamanho={20} />
        </span>
        <div className="encolhivel">
          <p className="menu-oficina-nome">Curadoria</p>
          <p className="menu-oficina-local">Administração da plataforma</p>
        </div>
      </div>

      {itensAdminPorGrupo(contagens).map((grupo) => (
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

      <Link href="/" className="menu-ver-loja">
        <IconeSetaDireita tamanho={14} />
        Ver o catálogo
        <IconeSetaDireita tamanho={14} />
      </Link>

      <div className="menu-sair">
        <BotaoSair />
      </div>
    </nav>
  )
}
