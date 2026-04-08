export interface Mission {
  id: string
  description: string
  xp: number
  category: 'completion' | 'exploration' | 'interaction'
}

export interface ChapterMissions {
  chapterId: string
  missions: Mission[]
}

export const CHAPTER_MISSIONS: Record<string, Mission[]> = {
  'sistema-solar': [
    { id: 'completion', description: 'Concluir a Jornada do Conhecimento', xp: 500, category: 'completion' },
    { id: 'view-planet', description: 'Visitar todos os 8 planetas', xp: 160, category: 'exploration' }, // 20 XP x 8
    { id: 'interact-3d', description: 'Interagir com os modelos 3D', xp: 160, category: 'interaction' }, // 20 XP x 8
    { id: 'stat-detail', description: 'Ver fichas técnicas dos astros', xp: 320, category: 'exploration' }, // 10 XP x 32 (4 por planeta)
    { id: 'share-planet', description: 'Compartilhar descobertas espaciais', xp: 400, category: 'exploration' }, // 50 XP x 8
    { id: 'theo-bulb', description: 'Ouvir curiosidade especial do Théo', xp: 100, category: 'interaction' },
  ],
  'movimentos-da-terra': [
    { id: 'completion', description: 'Concluir a Jornada do Conhecimento', xp: 400, category: 'completion' },
    { id: 'view-motion', description: 'Assistir Rotação e Translação', xp: 200, category: 'exploration' }, // 100 XP x 2
    { id: 'interact-motion-3d', description: 'Explorar a órbita terrestre em 3D', xp: 100, category: 'interaction' }, // 50 XP x 2
    { id: 'motion-detail', description: 'Ver detalhes sobre o Sol e a Terra', xp: 200, category: 'exploration' }, // 25 XP x 8
  ],
  'constelaçoes': [
    { id: 'completion', description: 'Concluir a Jornada do Conhecimento', xp: 500, category: 'completion' },
    { id: 'view-constellation', description: 'Encontrar as constelações', xp: 400, category: 'exploration' },
    { id: 'reveal-constellation', description: 'Revelar desenhos nas estrelas', xp: 200, category: 'interaction' },
    { id: 'const-intro-guide', description: 'Seguir o guia estelar do Théo', xp: 200, category: 'interaction' },
  ],
  'fases-da-lua': [
    { id: 'completion', description: 'Concluir a Jornada do Conhecimento', xp: 1000, category: 'completion' },
    { id: 'view-moon-phase', description: 'Observar as 4 fases principais', xp: 400, category: 'exploration' }, // 100 XP x 4
  ]
}

