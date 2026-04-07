/**
 * Dados dos capítulos educativos de "Théo no Mundo da Lua".
 * Cada capítulo representa uma unidade de aprendizado sobre astronomia.
 */
export interface Chapter {
  id: string
  order: number
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  colorDim: string
  colorBg: string
  path: string
  intro: string
  funFact: string
  xpAward: number
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'sistema-solar',
    order: 1,
    title: 'Sistema Solar',
    subtitle: 'Capítulo 1',
    description: 'Explore os planetas que orbitam o Sol e descubra as maravilhas do nosso sistema planetário.',
    icon: '☀️',
    color: '#FF6B35',
    colorDim: '#cc5529',
    colorBg: 'rgba(255, 107, 53, 0.08)',
    path: '/capitulos/sistema-solar/overview',
    intro: 'O Sistema Solar é o nosso lar no universo! Ele é formado pelo Sol — uma enorme estrela no centro — e oito planetas que giram ao seu redor. Théo vai te mostrar cada um deles!',
    funFact: 'Sabia que o Sol representa 99,8% de toda a massa do Sistema Solar? É gigante mesmo! 🌞',
    xpAward: 360,
  },
  {
    id: 'movimentos-da-terra',
    order: 2,
    title: 'Movimentos da Terra',
    subtitle: 'Capítulo 2',
    description: 'Entenda como a rotação e translação da Terra criam os dias, noites e as estações do ano.',
    icon: '🌍',
    color: '#4ECDC4',
    colorDim: '#3aada4',
    colorBg: 'rgba(78, 205, 196, 0.08)',
    path: '/capitulos/movimentos-da-terra/overview',
    intro: 'A Terra nunca para de se mover! Ela gira ao redor de si mesma (rotação) e também orbita o Sol (translação). São esses movimentos que criam os dias, as noites e as estações do ano.',
    funFact: 'A Terra gira a mais de 1.600 km/h em torno do seu próprio eixo! É mais rápido que um avião! ✈️',
    xpAward: 300,
  },
  {
    id: 'constelaçoes',
    order: 3,
    title: 'Constelações',
    subtitle: 'Capítulo 3',
    description: 'Descubra os desenhos que as estrelas formam no céu noturno e as histórias por trás deles.',
    icon: '⭐',
    color: '#FFD166',
    colorDim: '#cc9e3d',
    colorBg: 'rgba(255, 209, 102, 0.08)',
    path: '/capitulos/constelaçoes/overview',
    intro: 'Olhar para o céu à noite é como ver um enorme mapa de estrelas! As constelações são grupos de estrelas que, quando ligadas por lines imaginárias, formam desenhos e figuras. Théo adora explorá-las!',
    funFact: 'Existem 88 constelações oficiais reconhecidas pela astronomia. A mais conhecida é Órion! 🌟',
    xpAward: 300,
  },
  {
    id: 'fases-da-lua',
    order: 4,
    title: 'Fases da Lua',
    subtitle: 'Capítulo 4',
    description: 'Aprenda por que a Lua parece mudar de forma ao longo do mês e seus efeitos na Terra.',
    icon: '🌙',
    color: '#7EFBFD',
    colorDim: '#5dcecf',
    colorBg: 'rgba(126, 251, 253, 0.08)',
    path: '/capitulos/fases-da-lua/overview',
    intro: 'Você já reparou que a Lua parece diferente a cada noite? Às vezes ela é uma bolinha cheia, às vezes uma fatia fina. Isso acontece porque ela orbita a Terra e o Sol ilumina partes diferentes dela!',
    funFact: 'A Lua leva cerca de 29,5 dias para completar todas as suas fases — quase um mês! 🌕',
    xpAward: 500,
  },
]

/** Retorna um capítulo pelo seu ID. */
export function getChapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

/** Retorna o capítulo anterior e o próximo dado um ID. */
export function getAdjacentChapters(id: string) {
  const index = CHAPTERS.findIndex((c) => c.id === id)
  return {
    previous: index > 0 ? CHAPTERS[index - 1] : null,
    next: index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : null,
  }
}
