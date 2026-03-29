/**
 * Informações base da aplicação.
 * Centraliza todo o conteúdo textual do projeto escolar.
 */
export const APP_INFO = {
  title: 'Théo no Mundo da Lua',
  subject: 'Trabalho de Ciências',
  grade: '5º Ano C',
  school: 'Escola Arassuay Gomes de Castro',
  teacher: 'Professora Marta',
  character: 'Théo',
} as const

/**
 * Dados dos temas que serão explorados na aplicação.
 */
export const SPACE_TOPICS = [
  {
    id: 'sistema-solar',
    title: 'Sistema Solar',
    icon: '☀️',
    description: 'Explore os planetas que orbitam o Sol.',
    color: '#FFD166',
    path: '/sistema-solar',
  },
  {
    id: 'lua',
    title: 'A Lua',
    icon: '🌙',
    description: 'Descubra os segredos da nossa Lua.',
    color: '#7EFBFD',
    path: '/lua',
  },
  {
    id: 'estrelas',
    title: 'Estrelas',
    icon: '⭐',
    description: 'Como as estrelas nascem e morrem.',
    color: '#FF6B35',
    path: '/estrelas',
  },
  {
    id: 'universo',
    title: 'O Universo',
    icon: '🌌',
    description: 'O universo é enorme! Vamos explorar.',
    color: '#F0F4FF',
    path: '/universo',
  },
] as const
