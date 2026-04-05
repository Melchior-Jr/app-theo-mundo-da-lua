export type TrophyCategory = 'exploracao' | 'quiz' | 'minigame' | 'progresso' | 'desafio' | 'secreto'
export type TrophyRarity = 'comum' | 'raro' | 'epico' | 'lendario'

export interface Trophy {
  id: string
  name: string
  description: string
  category: TrophyCategory
  rarity: TrophyRarity
  icon: string // Lucide icon name or emoji
  progressType: 'contador' | 'unico'
  goal: number
  rewardXp: number
  hidden?: boolean
  order: number
}

export const TROPHIES: Trophy[] = [
  // EXPLORAÇÃO
  {
    id: 'exp_first_chapter',
    name: 'Explorador Iniciante',
    description: 'Sua primeira viagem oficial! Agora não tem mais volta, o universo te espera. 🚀',
    category: 'exploracao',
    rarity: 'comum',
    icon: 'Rocket',
    progressType: 'contador',
    goal: 1,
    rewardXp: 100,
    order: 1
  },
  {
    id: 'exp_moon_module',
    name: 'Pé na Lua',
    description: 'Um pequeno passo para o Théo, um salto gigante para o seu conhecimento! 🌕',
    category: 'exploracao',
    rarity: 'raro',
    icon: 'Moon',
    progressType: 'unico',
    goal: 1,
    rewardXp: 300,
    order: 2
  },
  {
    id: 'exp_five_chapters',
    name: 'Turista do Espaço',
    description: 'Cinco capítulos na conta? Você já está quase pedindo cidadania espacial! 🪐',
    category: 'exploracao',
    rarity: 'epico',
    icon: 'Compass',
    progressType: 'contador',
    goal: 5,
    rewardXp: 500,
    order: 3
  },
  {
    id: 'exp_all_chapters',
    name: 'Desbravador Galáctico',
    description: 'Completou tudo? O Théo agora te chama de mestre. O universo não tem mais segredos! 🌌',
    category: 'exploracao',
    rarity: 'lendario',
    icon: 'MilkyWay',
    progressType: 'unico',
    goal: 1,
    rewardXp: 1500,
    order: 4
  },

  // QUIZ
  {
    id: 'quiz_first_correct',
    name: 'Primeira Resposta',
    description: 'Acertou de primeira! O cérebro está aquecido, hein? 🧠✨',
    category: 'quiz',
    rarity: 'comum',
    icon: 'CheckCircle',
    progressType: 'contador',
    goal: 1,
    rewardXp: 50,
    order: 10
  },
  {
    id: 'quiz_streak_5',
    name: 'Sequência Inteligente',
    description: 'Cinco seguidas sem errar? Alguém andou estudando na biblioteca da lua! 😎',
    category: 'quiz',
    rarity: 'raro',
    icon: 'Zap',
    progressType: 'unico',
    goal: 1,
    rewardXp: 200,
    order: 11
  },
  {
    id: 'quiz_total_20',
    name: 'Mente Cósmica',
    description: 'Vinte acertos acumulados. Você já sabe mais que muito computador de bordo por aí! 📡',
    category: 'quiz',
    rarity: 'epico',
    icon: 'Brain',
    progressType: 'contador',
    goal: 20,
    rewardXp: 500,
    order: 12
  },
  {
    id: 'quiz_perfect_score',
    name: 'Mestre do Quiz',
    description: '100% de aproveitamento! Se o Théo fosse professor, te dava nota 11. 🏆',
    category: 'quiz',
    rarity: 'lendario',
    icon: 'Star',
    progressType: 'unico',
    goal: 1,
    rewardXp: 1000,
    order: 13
  },

  // MINIGAMES (Invasores do Espaço)
  {
    id: 'game_kills_50',
    name: 'Caçador de Aliens',
    description: 'Cinquenta aliens devidamente... "convidados a sair". Muito bom de mira! 👾❌',
    category: 'minigame',
    rarity: 'raro',
    icon: 'Target',
    progressType: 'contador',
    goal: 50,
    rewardXp: 300,
    order: 20
  },
  {
    id: 'game_survival_60s',
    name: 'Sobrevivente Espacial',
    description: 'Aguentou um minuto inteiro no caos? O Théo te daria um abraço (se tivesse braços longos). 🤗🚀',
    category: 'minigame',
    rarity: 'epico',
    icon: 'Heart',
    progressType: 'unico',
    goal: 60, // segundos
    rewardXp: 400,
    order: 21
  },

  // PROGRESSÃO
  {
    id: 'prog_first_action',
    name: 'Primeiros Passos',
    description: 'Bem-vindo ao Mundo da Lua! O primeiro passo é sempre o mais emocionante. 👣✨',
    category: 'progresso',
    rarity: 'comum',
    icon: 'User',
    progressType: 'unico',
    goal: 1,
    rewardXp: 50,
    order: 30
  },
  {
    id: 'prog_level_5',
    name: 'Astrônomo Júnior',
    description: 'Chegou no Nível 5! Já sabe diferenciar um meteoro de um queijo espacial. 🧀☄️',
    category: 'progresso',
    rarity: 'raro',
    icon: 'Medal',
    progressType: 'unico',
    goal: 5,
    rewardXp: 400,
    order: 31
  },
  {
    id: 'prog_level_12',
    name: 'Lenda Intergaláctica',
    description: 'Nível Máximo! Você agora é imortal na história do Théo. O próprio sol te saúda! ☀️👑',
    category: 'progresso',
    rarity: 'lendario',
    icon: 'Crown',
    progressType: 'unico',
    goal: 12,
    rewardXp: 2000,
    order: 32
  },

  // SECRETOS
  {
    id: 'secret_easter_egg',
    name: 'Curioso do Espaço',
    description: 'Achou o segredo, né? O Théo sabia que você ia clicar em tudo! 😂🔍',
    category: 'secreto',
    rarity: 'epico',
    icon: 'Search',
    progressType: 'unico',
    goal: 1,
    rewardXp: 1000,
    hidden: true,
    order: 100
  }
]
