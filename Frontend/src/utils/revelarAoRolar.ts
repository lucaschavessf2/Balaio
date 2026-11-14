const LINHA_DE_REVELACAO = '0px 0px -10% 0px'

export function revelarAoRolar(elemento: HTMLElement | null) {
  if (!elemento || elemento.getBoundingClientRect().top < window.innerHeight) return

  elemento.dataset.revelar = 'aguardando'
  const observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return
    delete elemento.dataset.revelar
    observador.disconnect()
  }, { rootMargin: LINHA_DE_REVELACAO })
  observador.observe(elemento)

  return () => observador.disconnect()
}
