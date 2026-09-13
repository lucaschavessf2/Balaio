export default function EstadoCarregando({
  rotulo = 'Carregando…',
  cartoes = 6,
}: {
  rotulo?: string
  cartoes?: number
}) {
  return (
    <div className="estado-carregando" role="status" aria-live="polite">
      <span className="so-leitor">{rotulo}</span>
      <div className="esqueleto esqueleto-titulo" aria-hidden />
      <div className="esqueleto esqueleto-subtitulo" aria-hidden />
      <div className="grade-pecas" aria-hidden>
        {Array.from({ length: cartoes }).map((_, i) => (
          <div className="esqueleto esqueleto-cartao" key={i} />
        ))}
      </div>
    </div>
  )
}
