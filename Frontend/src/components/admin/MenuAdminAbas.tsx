import Link from 'next/link'
import { itensAdmin, type ChaveAdmin } from '@/components/admin/itensAdmin'

export default function MenuAdminAbas({ ativo }: { ativo: ChaveAdmin }) {
  return (
    <nav className="painel-abas" aria-label="Menu da administração">
      {itensAdmin().map((item) => (
        <Link
          key={item.chave}
          href={item.href}
          className={`painel-aba${item.chave === ativo ? ' painel-aba-ativa' : ''}`}
          aria-current={item.chave === ativo ? 'page' : undefined}
        >
          {item.icone}
          <span>{item.textoCurto}</span>
          {item.marcador && (
            <span className={`painel-aba-marcador${item.marcador.alerta ? ' painel-aba-marcador-alerta' : ''}`}>
              <span className="so-leitor">{item.marcador.texto}</span>
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}
