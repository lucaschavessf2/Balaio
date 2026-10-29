// Revisão local para impedir que respostas de uma sessão anterior afetem a atual.
let revisao = 0

export const revisaoDaSessao = () => revisao
export const renovarRequisicoesDaSessao = () => { revisao++ }
