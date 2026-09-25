export function camposAlterados<T extends Record<string, unknown>>(original: T, atual: T): Partial<T> {
  const alterados: Partial<T> = {}
  for (const chave of Object.keys(atual) as (keyof T)[]) {
    if (atual[chave] !== original[chave]) alterados[chave] = atual[chave]
  }
  return alterados
}

export function listarRotulos<T>(alterados: Partial<T>, rotulos: Record<keyof T, string>): string[] {
  return (Object.keys(alterados) as (keyof T)[]).map((chave) => rotulos[chave])
}
