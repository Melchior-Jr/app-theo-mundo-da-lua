/**
 * Utilitários para processamento de XP, Nível e Títulos de Jogadores.
 */

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Perdido no Espaço',
  2: 'Recruta Espacial',
  3: 'Curioso das Estrelas',
  4: 'Aprendiz Estelar',
  5: 'Astrônomo Júnior',
  6: 'Explorador Lunar',
  7: 'Navegador Planetário',
  8: 'Desbravador Galáctico',
  9: 'Especialista Cósmico',
  10: 'Comandante Espacial',
  11: 'Brabo do Universo',
  12: 'Lenda Intergaláctica'
}

/** Calcula o nível com base no XP total (cada 1000 XP = 1 Nível) */
export const calcLevel = (xp = 0): number => {
  const lvl = Math.floor(xp / 1000) + 1
  return Math.min(lvl, 12) // Limitamos ao nível 12 conforme a tabela de títulos
}

/** Retorna o título amigável de um nível */
export const getLevelTitle = (level: number): string => {
  return LEVEL_TITLES[level] || 'Explorador'
}

/** Calcula a porcentagem de progresso para o próximo nível (0-100) */
export const calcLevelProgress = (xp = 0): number => {
  return (xp % 1000) / 10
}
