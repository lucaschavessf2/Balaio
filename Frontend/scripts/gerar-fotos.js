const fs = require('fs')
const path = require('path')

const destino = process.argv[2] || 'public/fotos'

const paletas = {
  barro: { ceu: ['#f0d9c0', '#d9a273'], chao: '#b5713f', corpo: '#c2703c', sombra: '#8f4d22', luz: '#e6b384', traco: '#5c2c11' },
  renda: { ceu: ['#fbf6ec', '#e6dac4'], chao: '#cbbb9c', corpo: '#ffffff', sombra: '#d8ccb4', luz: '#fffdf8', traco: '#8a7a5e' },
  madeira: { ceu: ['#e8c79a', '#b98650'], chao: '#7a4a22', corpo: '#a9703c', sombra: '#6b421d', luz: '#d8ab77', traco: '#3d2310' },
  couro: { ceu: ['#e0b487', '#a9723f'], chao: '#6d3d1c', corpo: '#9c5f2e', sombra: '#5e3517', luz: '#c98f5c', traco: '#3d1f0b' },
  xilo: { ceu: ['#f5efe2', '#ded3bd'], chao: '#3a2e22', corpo: '#2b2119', sombra: '#1a1410', luz: '#f7f2e7', traco: '#1a1410' },
  oficina: { ceu: ['#8a6a4a', '#3d2914'], chao: '#241708', corpo: '#a87648', sombra: '#5c3a1c', luz: '#c99a68', traco: '#150d04' },
}

function semente(texto) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function sorteador(valor) {
  let estado = valor
  return function () {
    estado = (estado + 0x6d2b79f5) | 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cenario(p, sorte) {
  const prateleiras = []
  for (let i = 0; i < 4; i++) {
    const y = 96 + i * 30 + Math.round(sorte() * 14)
    const largura = 140 + Math.round(sorte() * 240)
    const x = Math.round(sorte() * (800 - largura))
    prateleiras.push(`<rect x="${x}" y="${y}" width="${largura}" height="7" rx="3" fill="${p.luz}" opacity="0.22"/>`)
  }
  return `<rect width="800" height="600" fill="url(#ceu)"/>
${prateleiras.join('\n')}
<path d="M0 460h800v140H0z" fill="${p.chao}"/>
<ellipse cx="400" cy="460" rx="320" ry="26" fill="${p.sombra}" opacity="0.5"/>`
}

function leao(p, pequeno) {
  const e = pequeno ? 0.6 : 1
  const cx = 400
  const cy = pequeno ? 320 : 262
  const jubas = []
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2
    jubas.push(
      `<circle cx="${(cx + Math.cos(ang) * 92 * e).toFixed(1)}" cy="${(cy + Math.sin(ang) * 92 * e).toFixed(1)}" r="${(29 * e).toFixed(1)}" fill="${p.sombra}"/>`,
    )
  }
  return `<g>
<ellipse cx="${cx + 78 * e}" cy="${cy + 128 * e}" rx="${142 * e}" ry="${72 * e}" fill="${p.corpo}"/>
<rect x="${cx + 8 * e}" y="${cy + 168 * e}" width="${32 * e}" height="${64 * e}" rx="${14 * e}" fill="${p.sombra}"/>
<rect x="${cx + 130 * e}" y="${cy + 168 * e}" width="${32 * e}" height="${64 * e}" rx="${14 * e}" fill="${p.sombra}"/>
<path d="M${cx + 214 * e} ${cy + 110 * e}q${54 * e} ${-26 * e} ${34 * e} ${-84 * e}" stroke="${p.corpo}" stroke-width="${17 * e}" fill="none" stroke-linecap="round"/>
${jubas.join('\n')}
<circle cx="${cx}" cy="${cy}" r="${84 * e}" fill="${p.corpo}"/>
<ellipse cx="${cx - 30 * e}" cy="${cy - 16 * e}" rx="${11 * e}" ry="${13 * e}" fill="${p.traco}"/>
<ellipse cx="${cx + 30 * e}" cy="${cy - 16 * e}" rx="${11 * e}" ry="${13 * e}" fill="${p.traco}"/>
<path d="M${cx} ${cy + 8 * e}l${-15 * e} ${18 * e}h${30 * e}z" fill="${p.traco}"/>
<path d="M${cx - 26 * e} ${cy + 44 * e}q${26 * e} ${22 * e} ${52 * e} 0" stroke="${p.traco}" stroke-width="${7 * e}" fill="none" stroke-linecap="round"/>
<path d="M${cx - 62 * e} ${cy - 62 * e}q${16 * e} ${-24 * e} ${34 * e} ${-6 * e}" stroke="${p.traco}" stroke-width="${6 * e}" fill="none" stroke-linecap="round"/>
<path d="M${cx + 62 * e} ${cy - 62 * e}q${-16 * e} ${-24 * e} ${-34 * e} ${-6 * e}" stroke="${p.traco}" stroke-width="${6 * e}" fill="none" stroke-linecap="round"/>
</g>`
}

function jarra(p) {
  const faixas = []
  for (let i = 0; i < 3; i++) {
    const y = 316 + i * 40
    faixas.push(`<path d="M${306 + i * 5} ${y}q94 ${20 - i * 5} 188 0" stroke="${p.traco}" stroke-width="6" fill="none" opacity="0.65"/>`)
  }
  return `<g>
<path d="M400 176q-40 20-40 58 0 24 14 42-62 42-62 122 0 92 88 92t88-92q0-80-62-122 14-18 14-42 0-38-40-58z" fill="${p.corpo}"/>
<ellipse cx="400" cy="186" rx="44" ry="15" fill="${p.luz}"/>
<path d="M358 258q-70 10-70 72 0 44 32 64" stroke="${p.sombra}" stroke-width="19" fill="none" stroke-linecap="round"/>
<path d="M442 258q70 10 70 72 0 44-32 64" stroke="${p.sombra}" stroke-width="19" fill="none" stroke-linecap="round"/>
${faixas.join('\n')}
<circle cx="400" cy="396" r="24" fill="${p.luz}" opacity="0.9"/>
<circle cx="400" cy="396" r="11" fill="${p.traco}" opacity="0.55"/>
<ellipse cx="400" cy="458" rx="66" ry="14" fill="${p.sombra}"/>
</g>`
}

function renda(p) {
  const flores = []
  for (let lin = 0; lin < 3; lin++) {
    for (let col = 0; col < 4; col++) {
      const cx = 238 + col * 108
      const cy = 214 + lin * 100
      const petalas = []
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2
        const px = cx + Math.cos(ang) * 25
        const py = cy + Math.sin(ang) * 25
        petalas.push(
          `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="12" ry="6.5" fill="none" stroke="${p.traco}" stroke-width="2.4" transform="rotate(${((ang * 180) / Math.PI).toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`,
        )
      }
      flores.push(`<g opacity="0.92">${petalas.join('')}<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${p.traco}" stroke-width="2.4"/></g>`)
    }
  }
  const festone = []
  for (let i = 0; i < 13; i++) {
    festone.push(`<circle cx="${190 + i * 35}" cy="470" r="17" fill="none" stroke="${p.traco}" stroke-width="2.4"/>`)
  }
  return `<g>
<rect x="170" y="146" width="460" height="326" rx="6" fill="${p.corpo}"/>
<rect x="188" y="164" width="424" height="290" fill="none" stroke="${p.traco}" stroke-width="2.4" opacity="0.55"/>
${flores.join('\n')}
${festone.join('\n')}
</g>`
}

function figuraMusico(x, escala, chapeu, p) {
  return `<g transform="translate(${x} 0) scale(${escala}) translate(${(x - x * escala) / escala} 0)">
<rect x="-28" y="300" width="20" height="92" rx="9" fill="${p.sombra}"/>
<rect x="8" y="300" width="20" height="92" rx="9" fill="${p.sombra}"/>
<path d="M-46 198q46-26 92 0l14 110q-60 22-120 0z" fill="${p.corpo}"/>
<circle cx="0" cy="152" r="43" fill="${p.luz}"/>
<circle cx="-14" cy="146" r="5.5" fill="${p.traco}"/>
<circle cx="14" cy="146" r="5.5" fill="${p.traco}"/>
<path d="M-12 170q12 10 24 0" stroke="${p.traco}" stroke-width="4" fill="none" stroke-linecap="round"/>
${chapeu ? `<path d="M-60 118h120" stroke="${p.traco}" stroke-width="10" stroke-linecap="round"/><path d="M-36 118q36-44 72 0z" fill="${p.traco}"/>` : ''}
<rect x="-42" y="232" width="32" height="58" rx="5" fill="${p.traco}"/>
<rect x="18" y="232" width="32" height="58" rx="5" fill="${p.traco}"/>
<rect x="-8" y="236" width="24" height="50" fill="${p.luz}"/>
<path d="M-8 244h24M-8 254h24M-8 264h24M-8 274h24" stroke="${p.traco}" stroke-width="3"/>
</g>`
}

function musico(p) {
  return figuraMusico(400, 1.06, true, p)
}

function banda(p) {
  return `<g>${figuraMusico(246, 0.74, true, p)}${figuraMusico(400, 0.9, false, p)}${figuraMusico(558, 0.74, true, p)}</g>`
}

function xilogravura(p) {
  const hachuras = []
  for (let i = 0; i < 27; i++) {
    hachuras.push(`<path d="M${192 + i * 16} 166v268" stroke="${p.traco}" stroke-width="${i % 3 === 0 ? 4 : 2}" opacity="0.14"/>`)
  }
  const raios = []
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2
    raios.push(
      `<path d="M${(318 + Math.cos(ang) * 44).toFixed(1)} ${(240 + Math.sin(ang) * 44).toFixed(1)}L${(318 + Math.cos(ang) * 72).toFixed(1)} ${(240 + Math.sin(ang) * 72).toFixed(1)}" stroke="${p.traco}" stroke-width="7" stroke-linecap="round"/>`,
    )
  }
  return `<g>
<rect x="180" y="150" width="440" height="300" fill="${p.luz}"/>
${hachuras.join('\n')}
<rect x="180" y="150" width="440" height="300" fill="none" stroke="${p.traco}" stroke-width="12"/>
<circle cx="318" cy="240" r="40" fill="${p.traco}"/>
${raios.join('\n')}
<path d="M470 432V320q0-30 26-30t26 30v112z" fill="${p.traco}"/>
<path d="M496 354q-34-6-34-44" stroke="${p.traco}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M496 374q34-6 34-46" stroke="${p.traco}" stroke-width="11" fill="none" stroke-linecap="round"/>
<path d="M212 432h376" stroke="${p.traco}" stroke-width="10"/>
<path d="M244 432l36-58 36 58z" fill="${p.traco}"/>
</g>`
}

function couro(p) {
  const franjas = []
  for (let i = 0; i < 11; i++) {
    franjas.push(`<path d="M${292 + i * 22} 404v54" stroke="${p.sombra}" stroke-width="7" stroke-linecap="round"/>`)
  }
  const costuras = []
  for (let i = 0; i < 14; i++) {
    costuras.push(`<circle cx="${306 + i * 14}" cy="218" r="3" fill="${p.luz}" opacity="0.85"/>`)
  }
  return `<g>
<path d="M400 158q-52 0-84 26l-58 34 40 74 30-18v130h144V274l30 18 40-74-58-34q-32-26-84-26z" fill="${p.corpo}"/>
<path d="M400 158v246" stroke="${p.sombra}" stroke-width="6" stroke-dasharray="12 10"/>
<path d="M400 158q-24 30-24 62 0 22 10 40" stroke="${p.sombra}" stroke-width="6" fill="none"/>
<path d="M400 158q24 30 24 62 0 22-10 40" stroke="${p.sombra}" stroke-width="6" fill="none"/>
${franjas.join('\n')}
${costuras.join('\n')}
<circle cx="400" cy="306" r="15" fill="${p.luz}" opacity="0.75"/>
<circle cx="400" cy="350" r="15" fill="${p.luz}" opacity="0.75"/>
</g>`
}

function casal(p) {
  return `<g>
<rect x="248" y="422" width="304" height="38" rx="10" fill="${p.sombra}"/>
<g>
<path d="M340 252q-42 20-42 68l12 102h60l12-102q0-48-42-68z" fill="${p.corpo}"/>
<circle cx="340" cy="216" r="40" fill="${p.luz}"/>
<path d="M300 212q0-52 40-52t40 52q-20-18-40-18t-40 18z" fill="${p.traco}"/>
<circle cx="328" cy="214" r="5" fill="${p.traco}"/>
<circle cx="352" cy="214" r="5" fill="${p.traco}"/>
<path d="M330 236q10 8 20 0" stroke="${p.traco}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
</g>
<g>
<path d="M462 252q-46 22-46 74l14 96h64l14-96q0-52-46-74z" fill="${p.luz}"/>
<circle cx="462" cy="216" r="40" fill="${p.corpo}"/>
<path d="M420 208q0-56 42-56t42 56q0 40-42 40t-42-40z" fill="${p.luz}" opacity="0.5"/>
<circle cx="450" cy="214" r="5" fill="${p.traco}"/>
<circle cx="474" cy="214" r="5" fill="${p.traco}"/>
<path d="M452 236q10 8 20 0" stroke="${p.traco}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
</g>
<path d="M384 320h34" stroke="${p.traco}" stroke-width="9" stroke-linecap="round"/>
</g>`
}

function oficina(p) {
  const partes = []
  const alturas = [62, 82, 52, 72, 58]
  for (let prateleira = 0; prateleira < 2; prateleira++) {
    const base = 262 + prateleira * 118
    for (let i = 0; i < 5; i++) {
      const h = alturas[(i + prateleira) % alturas.length]
      const x = 192 + i * 104
      const larg = h * 0.44
      partes.push(
        `<path d="M${x} ${base}q${-larg} ${h * 0.3} ${-larg} ${h * 0.6} 0 ${h * 0.4} ${larg} ${h * 0.4}t${larg} ${-h * 0.4}q0 ${-h * 0.3} ${-larg} ${-h * 0.6}z" fill="${p.corpo}" opacity="${(0.72 + (i % 3) * 0.09).toFixed(2)}"/>`,
        `<ellipse cx="${x}" cy="${base}" rx="${(h * 0.3).toFixed(0)}" ry="${(h * 0.1).toFixed(0)}" fill="${p.luz}" opacity="0.9"/>`,
      )
    }
    partes.push(`<rect x="148" y="${base + 68}" width="504" height="12" rx="4" fill="${p.sombra}"/>`)
  }
  return `<g>
<rect x="148" y="146" width="504" height="360" rx="10" fill="${p.sombra}" opacity="0.3"/>
${partes.join('\n')}
</g>`
}

const motivos = {
  leao: function (p) { return leao(p, false) },
  leaozinho: function (p) { return leao(p, true) },
  jarra: jarra,
  renda: renda,
  musico: musico,
  banda: banda,
  xilogravura: xilogravura,
  couro: couro,
  casal: casal,
  oficina: oficina,
}

const arquivos = [
  ['leao-imperial', 'barro', 'leao'],
  ['leaozinho-bolso', 'barro', 'leaozinho'],
  ['jarra-cabocla', 'barro', 'jarra'],
  ['jarra-imperial', 'barro', 'jarra'],
  ['jarra-boiadeira', 'barro', 'jarra'],
  ['toalha-renascenca', 'renda', 'renda'],
  ['passadeira-renascenca', 'renda', 'renda'],
  ['casa-renascenca', 'renda', 'renda'],
  ['sanfoneiro-imburana', 'madeira', 'musico'],
  ['banda-pifanos', 'barro', 'banda'],
  ['painel-xilogravura', 'xilo', 'xilogravura'],
  ['atelie-dila', 'xilo', 'xilogravura'],
  ['gibao-couro', 'couro', 'couro'],
  ['couraria-pajeu', 'couro', 'couro'],
  ['casamento-de-barro', 'barro', 'casal'],
  ['atelier-nuca', 'oficina', 'oficina'],
  ['alto-do-moura', 'oficina', 'oficina'],
  ['barro-ipojuca', 'barro', 'oficina'],
  ['oficina-imburana', 'madeira', 'oficina'],
]

function gerar(nome, tipoPaleta, tipoMotivo) {
  const p = paletas[tipoPaleta]
  const sorte = sorteador(semente(nome))
  const anguloCeu = Math.round(sorte() * 40 + 150)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img">
<defs>
<linearGradient id="ceu" gradientTransform="rotate(${anguloCeu})">
<stop offset="0%" stop-color="${p.ceu[0]}"/>
<stop offset="100%" stop-color="${p.ceu[1]}"/>
</linearGradient>
<radialGradient id="vinheta" cx="50%" cy="44%" r="74%">
<stop offset="58%" stop-color="#000" stop-opacity="0"/>
<stop offset="100%" stop-color="#000" stop-opacity="0.32"/>
</radialGradient>
<clipPath id="corte"><rect width="800" height="600"/></clipPath>
</defs>
<g clip-path="url(#corte)">
${cenario(p, sorte)}
${motivos[tipoMotivo](p)}
<rect width="800" height="600" fill="url(#vinheta)"/>
</g>
</svg>
`
}

fs.mkdirSync(destino, { recursive: true })
for (const [nome, tipoPaleta, tipoMotivo] of arquivos) {
  fs.writeFileSync(path.join(destino, `${nome}.svg`), gerar(nome, tipoPaleta, tipoMotivo), 'utf8')
}
console.log(`gerados ${arquivos.length} arquivos em ${destino}`)
