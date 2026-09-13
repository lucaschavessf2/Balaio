import { Open_Sans, Poiret_One } from 'next/font/google'

export const fonteCorpo = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--fonte',
  display: 'swap',
})

export const fonteTitulo = Poiret_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--fonte-titulo',
  display: 'swap',
})

export const classesDeFonte = `${fonteCorpo.variable} ${fonteTitulo.variable}`
