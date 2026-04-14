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
    xpAward: 1000,
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
    xpAward: 700,
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
    xpAward: 500,
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
    xpAward: 1000,
  },
  {
    id: 'estrutura-interna',
    order: 1,
    title: 'Estrutura Interna da Terra',
    subtitle: 'Capítulo 1',
    description: 'Descubra o que existe debaixo dos nossos pés, da crosta ao núcleo super quente!',
    icon: '🌍',
    color: '#E63946',
    colorDim: '#b22d37',
    colorBg: 'rgba(230, 57, 70, 0.08)',
    path: '/capitulos/estrutura-interna/overview',
    intro: 'Você sabia que a Terra é como uma cebola, cheia de camadas? Por fora temos a crosta, onde vivemos, mas lá no fundo existe um núcleo tão quente quanto o Sol!',
    funFact: 'O núcleo da Terra é uma bola de metal super quente e sólida, cercada por metal líquido! 🔥',
    xpAward: 500,
  },
  {
    id: 'rochas-minerais',
    order: 2,
    title: 'Rochas e Minerais',
    subtitle: 'Capítulo 2',
    description: 'Aprenda como as pedras se formam e por que elas são tão diferentes umas das outras.',
    icon: '🪨',
    color: '#A88532',
    colorDim: '#866a28',
    colorBg: 'rgba(168, 133, 50, 0.08)',
    path: '/capitulos/rochas-minerais/overview',
    intro: 'Nem toda pedra é igual! Algumas nascem do fogo dos vulcões, outras do acúmulo de areia e até de restos de conchas de milhões de anos atrás.',
    funFact: 'O diamante é o mineral mais duro que existe na natureza. Só outro diamante pode riscá-lo! 💎',
    xpAward: 500,
  },
  {
    id: 'formacao-solo',
    order: 3,
    title: 'Formação do Solo',
    subtitle: 'Capítulo 3',
    description: 'Entenda como as rochas viram terra e como isso permite que as plantas cresçam.',
    icon: '🌄',
    color: '#8B5E34',
    colorDim: '#6f4b29',
    colorBg: 'rgba(139, 94, 52, 0.08)',
    path: '/capitulos/formacao-solo/overview',
    intro: 'A terra onde as plantas crescem levou milhares de anos para se formar. É um processo incrível onde a chuva, o vento e o sol quebram as rochas bem devagar.',
    funFact: 'Leva cerca de 500 anos para a natureza criar apenas 2 centímetros de solo fértil! ⏳',
    xpAward: 500,
  },
  {
    id: 'erosao-relevo',
    order: 4,
    title: 'Erosão e Relevo',
    subtitle: 'Capítulo 4',
    description: 'Descubra como o vento e a água esculpem as montanhas e vales do nosso planeta.',
    icon: '🌧️',
    color: '#457B9D',
    colorDim: '#37627e',
    colorBg: 'rgba(69, 123, 157, 0.08)',
    path: '/capitulos/erosao-relevo/overview',
    intro: 'As montanhas e rios que vemos hoje não foram sempre assim. A água e o vento funcionam como artistas que esculpem a paisagem da Terra o tempo todo.',
    funFact: 'O Grand Canyon, nos EUA, foi todinho esculpido pela força da água de um rio durante milhões de anos! 🏞️',
    xpAward: 500,
  },
  {
    id: 'vulcoes-terremotos',
    order: 5,
    title: 'Vulcões e Terremotos',
    subtitle: 'Capítulo 5',
    description: 'Entenda as forças poderosas que fazem a Terra tremer e o fogo subir das profundezas.',
    icon: '🌋',
    color: '#D00000',
    colorDim: '#a60000',
    colorBg: 'rgba(208, 0, 0, 0.08)',
    path: '/capitulos/vulcoes-terremotos/overview',
    intro: 'A Terra é viva e barulhenta por dentro! Às vezes, as grandes peças que formam o chão se mexem, criando terremotos ou deixando o magma sair pelos vulcões.',
    funFact: 'Existem mais de 1.500 vulcões ativos no mundo, e muitos deles estão escondidos no fundo do mar! 🌊',
    xpAward: 800,
  },
  {
    id: 'fenomenos-naturais',
    order: 6,
    title: 'Fenômenos Naturais',
    subtitle: 'Capítulo 6',
    description: 'Explore raios, furacões e outros eventos incríveis que acontecem na nossa atmosfera.',
    icon: '🌪️',
    color: '#F4A261',
    colorDim: '#c3824e',
    colorBg: 'rgba(244, 162, 97, 0.08)',
    path: '/capitulos/fenomenos-naturais/overview',
    intro: 'A natureza pode ser muito poderosa! Ventos fortes, chuvas de gelo e raios são formas da Terra liberar energia e manter tudo em equilíbrio.',
    funFact: 'Um único raio pode ser cinco vezes mais quente que a superfície do Sol! ⚡',
    xpAward: 600,
  },
  {
    id: 'acao-humana',
    order: 7,
    title: 'Ação Humana no Relevo',
    subtitle: 'Capítulo 7',
    description: 'Veja como nós transformamos o planeta para construir cidades e estradas.',
    icon: '🏙️',
    color: '#2A9D8F',
    colorDim: '#217e72',
    colorBg: 'rgba(42, 157, 143, 0.08)',
    path: '/capitulos/acao-humana/overview',
    intro: 'Os seres humanos mudam muito o lugar onde vivem. Nós cavamos túneis, construímos cidades e mudamos até o curso de rios para podermos viver melhor.',
    funFact: 'As cidades são tão pesadas que podem fazer o solo abaixo delas afundar um pouquinho ao longo dos anos! 🏢',
    xpAward: 600,
  },
  {
    id: 'sustentabilidade',
    order: 8,
    title: 'Sustentabilidade',
    subtitle: 'Capítulo 8',
    description: 'Aprenda como podemos cuidar da Terra para que ela continue sendo um lar maravilhoso.',
    icon: '🌱',
    color: '#2D6A4F',
    colorDim: '#24553f',
    colorBg: 'rgba(45, 106, 79, 0.08)',
    path: '/capitulos/sustentabilidade/overview',
    intro: 'Agora que você conhece a Terra, sabe que precisamos cuidar dela. Pequenas ações ajudam a proteger o solo, a água e todos os seres vivos que moram aqui.',
    funFact: 'Reciclar uma única lata de alumínio economiza energia suficiente para manter uma TV ligada por 3 horas! 📺',
    xpAward: 1000,
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
