/**
 * Sistema de Legendas Sincronizadas (Subtitles)
 * 
 * Cada entrada mapeia um ID de narração para uma lista de segmentos
 * com o tempo de início (em segundos) e o texto a ser exibido.
 */

export interface SubtitleSegment {
  startTime: number
  text: string
}

export type SubtitlesMap = Record<string, SubtitleSegment[]>

export const SUBTITLES: SubtitlesMap = {
  'chapter-2': [
    { startTime: 0, text: "Você sabia que a Terra nunca para?" },
    { startTime: 2.2, text: "Ela tá sempre em movimento e a gente nem percebe... 😳" },
    { startTime: 5.5, text: "E o mais doido... é que ela faz dois movimentos ao mesmo tempo!" },
    { startTime: 9.2, text: "A de rotação... e translação!" },
    { startTime: 11.5, text: "E é por causa disso que existem o dia e a noite..." },
    { startTime: 14.5, text: " e até as estações do ano! 🌎✨🌙" },
    { startTime: 18, text: "Agora clica aí neles... e vamos entender melhor isso! 😄" }
  ],
  'const-intro': [
    { startTime: 0, text: "Agora esquece um pouco os planetas... e só olha para o céu!" },
    { startTime: 4, text: "As constelações são tipo desenhos que a gente enxerga no céu... ligando as estrelas!" },
    { startTime: 10, text: "Tipo brincar de ligar os pontinhos 😄" },
    { startTime: 14, text: "Mas tem um detalhe muito doido... as estrelas nem estão tão perto assim uma das outras! 😳" },
    { startTime: 19, text: "Elas só parecem estar juntas por causa que a gente tá vendo de muito longe." },
    { startTime: 24, text: "Antigamente, as pessoas usavam isso pra se guiar... tipo um mapa do céu!" },
    { startTime: 30, text: "E ainda inventavam altas histórias com elas!" },
    { startTime: 34, text: "Várias dessas constelações ficaram famosas por causa dos signos... 👀" },
    { startTime: 39, text: "Tipo Sagitário, Escorpião, Gêmeos... talvez até o seu esteja aqui! 😄" },
    { startTime: 45, text: "Enfim... o céu cheio de desenhos, só que em uma escala gigantesca! 😂" },
    { startTime: 51, text: "Chegam mais pra ver algumas dessas constelações bem de perto... 👀✨" }
  ],
  'chapter-4': [
    { startTime: 0, text: "Agora vamos dar uma olhada num lugar mais perto… a Lua! 🌙" },
    { startTime: 4, text: "Ela é o nosso satélite natural…" },
    { startTime: 6, text: "ou seja, ela gira em volta da Terra!" },
    { startTime: 9, text: "E só pra deixar claro…" },
    { startTime: 10, text: "a Lua não é de queijo tá, lá é pura pedra 😂" },
    { startTime: 13, text: "você já percebeu que ela muda de forma lá no céu? 😳" },
    { startTime: 16.5, text: "Tem dia que ela tá cheia…" },
    { startTime: 18.5, text: "tem dia que parece só um pedacinho…" },
    { startTime: 21, text: "Mas calma… ela não muda de forma de verdade não!" },
    { startTime: 25, text: "O que muda é a parte iluminada pelo Sol…" },
    { startTime: 28, text: "E isso acontece porque a Lua tá sempre girando em volta da Terra!" },
    { startTime: 33, text: "Essas mudanças são chamadas de fases da Lua! ✨" },
    { startTime: 37.5, text: "E olha que legal…" },
    { startTime: 39, text: "todo esse ciclo demora mais ou menos 29 dias pra se completar! 😳" },
    { startTime: 44, text: "Ou seja… quase um mês inteiro!" },
    { startTime: 47, text: "Agora vamos ver cada uma dessas fases 👀" }
  ],
  'moon-nova': [
    { startTime: 0, text: "Essa é a Lua Nova! 🌑" },
    { startTime: 2.5, text: "Nessa fase… a Lua tá praticamente invisível! 😳" },
    { startTime: 5.5, text: "Porque a parte iluminada pelo Sol…" },
    { startTime: 8, text: "não está virada pra Terra!" },
    { startTime: 10.5, text: "Ou seja… a lua tá lá…" },
    { startTime: 12, text: "mas a gente quase não consegue ver porque o lado está escuro." }
  ],
  'moon-crescente': [
    { startTime: 0, text: "Essa é a Lua Crescente! 🌓" },
    { startTime: 2.5, text: "Aqui a Lua começa a aparecer…" },
    { startTime: 4.5, text: "metade iluminada e metade escura!" },
    { startTime: 7, text: "Tipo o cabelo da Cruela 😂" },
    { startTime: 9, text: "Parece que ela tá crescendo no céu! 😄" },
    { startTime: 11.5, text: "E a cada dia… dá pra ver mais um pouquinho dela!" }
  ],
  'moon-cheia': [
    { startTime: 0, text: "Essa é a Lua Cheia! 🌕" },
    { startTime: 2.5, text: "Agora sim… ela aparece completamente iluminada!" },
    { startTime: 5.5, text: "Linda, redonda… brilhando no céu! ✨" },
    { startTime: 8.5, text: "Isso acontece porque o Sol ilumina toda a parte da Lua..." },
    { startTime: 12, text: "que a gente consegue ver da Terra!" }
  ],
  'moon-minguante': [
    { startTime: 0, text: "Essa é a Lua Minguante! 🌗" },
    { startTime: 2.5, text: "Agora ela começa a diminuir…" },
    { startTime: 5, text: "A parte iluminada vai ficando cada vez menor…" },
    { startTime: 8, text: "até quase sumir de novo!" },
    { startTime: 10.5, text: "E aí… o ciclo recomeça! 🔄" }
  ]
}

/**
 * Helper para buscar a legenda correta com base no tempo atual do áudio
 */
export function getCaption(narrationId: string, currentTime: number): string | null {
  const segments = SUBTITLES[narrationId]
  if (!segments) return null

  // Encontra o último segmento cujo startTime seja menor ou igual ao tempo atual
  const activeSegment = [...segments]
    .reverse()
    .find(s => currentTime >= s.startTime)

  return activeSegment ? activeSegment.text : null
}
