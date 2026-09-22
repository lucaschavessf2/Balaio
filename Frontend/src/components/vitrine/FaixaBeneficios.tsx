import { garantias } from '@/constants/vitrine'

export default function FaixaBeneficios({ compacta = false }: { compacta?: boolean }) {
  return (
    <ul className={`faixa-beneficios${compacta ? ' faixa-beneficios-compacta' : ''}`} aria-label="Garantias do Balaio">
      {garantias.map((garantia) => (
        <li className="beneficio" key={garantia.titulo}>
          <span className="beneficio-icone">{garantia.icone}</span>
          <span>
            <strong className="beneficio-titulo">{garantia.titulo}</strong>
            <span className="beneficio-texto">{compacta ? garantia.resumo : garantia.texto}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
