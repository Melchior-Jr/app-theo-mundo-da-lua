export type QuestionType = 'multiple-choice' | 'true-false'

export interface QuizQuestion {
  id: string
  chapterId: string
  type: QuestionType
  question: string
  options?: string[] // Apenas para multiple-choice
  correctAnswer: string | boolean
  explanation: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Capítulo 1: Sistema Solar
  {
    id: 'q1',
    chapterId: 'sistema-solar',
    type: 'multiple-choice',
    question: 'Qual é o maior planeta do nosso Sistema Solar?',
    options: ['Terra', 'Marte', 'Júpiter', 'Saturno'],
    correctAnswer: 'Júpiter',
    explanation: 'Júpiter é tão grande que caberiam mais de mil Terras dentro dele! 🌌',
  },
  {
    id: 'q2',
    chapterId: 'sistema-solar',
    type: 'true-false',
    question: 'O Sol é uma estrela.',
    correctAnswer: true,
    explanation: 'Isso aí! O Sol é a estrela mais próxima da Terra e nos dá luz e calor. ☀️',
  },
  {
    id: 'q3',
    chapterId: 'sistema-solar',
    type: 'multiple-choice',
    question: 'Qual planeta tem os anéis mais impressionantes e brilhantes?',
    options: ['Netuno', 'Marte', 'Saturno', 'Vênus'],
    correctAnswer: 'Saturno',
    explanation: 'Os anéis de Saturno são gigantes e feitos principalmente de gelo e rochas! 🪐',
  },
  {
    id: 'q4',
    chapterId: 'sistema-solar',
    type: 'multiple-choice',
    question: 'Como chamamos carinhosamente o planeta Marte?',
    options: ['Planeta Azul', 'Planeta Vermelho', 'Planeta Gasoso', 'Planeta Gelo'],
    correctAnswer: 'Planeta Vermelho',
    explanation: 'Marte é chamado assim por causa da poeira avermelhada que cobre todo o planeta! 🔴',
  },
  {
    id: 'q5',
    chapterId: 'sistema-solar',
    type: 'multiple-choice',
    question: 'Qual é o oitavo e último planeta do nosso Sistema Solar?',
    options: ['Júpiter', 'Saturno', 'Urano', 'Netuno'],
    correctAnswer: 'Netuno',
    explanation: 'Netuno é o planeta mais afastado do Sol e por isso é muito gelado e escuro! 🥶',
  },
  {
    id: 'q6',
    chapterId: 'sistema-solar',
    type: 'multiple-choice',
    question: 'A Terra é qual planeta a partir do Sol?',
    options: ['Primeiro', 'Segundo', 'Terceiro', 'Quarto'],
    correctAnswer: 'Terceiro',
    explanation: 'Isso! Estamos exatamente na distância perfeita para ter água líquida e vida! 🌍',
  },
  {
    id: 'q7',
    chapterId: 'sistema-solar',
    type: 'true-false',
    question: 'Vênus é o planeta mais frio de todos.',
    correctAnswer: false,
    explanation: 'Muito pelo contrário! Vênus é o planeta mais quente do Sistema Solar por causa de suas nuvens espessas! 🔥',
  },

  // Capítulo 2: Movimentos da Terra
  {
    id: 'q8',
    chapterId: 'movimentos-da-terra',
    type: 'multiple-choice',
    question: 'Quanto tempo a Terra leva para dar uma volta completa em torno de si mesma?',
    options: ['1 mês', '24 horas', '365 dias', '12 horas'],
    correctAnswer: '24 horas',
    explanation: 'Esse movimento se chama Rotação e é ele que cria o dia e a noite! 🌍',
  },
  {
    id: 'q9',
    chapterId: 'movimentos-da-terra',
    type: 'multiple-choice',
    question: 'Como se chama o movimento que a Terra faz ao redor do Sol?',
    options: ['Rotação', 'Translação', 'Órbita', 'Giro'],
    correctAnswer: 'Translação',
    explanation: 'A Translação leva um ano inteiro (cerca de 365 dias) para ser concluída! ⏳',
  },
  {
    id: 'q10',
    chapterId: 'movimentos-da-terra',
    type: 'multiple-choice',
    question: 'O movimento de Rotação é responsável por gerar o quê?',
    options: ['As Estações do Ano', 'O Dia e a Noite', 'A Chuva', 'As Fases da Lua'],
    correctAnswer: 'O Dia e a Noite',
    explanation: 'Enquanto a Terra gira, a parte virada para o Sol fica de dia, e a que fica escondida, de noite! ☀️🌙',
  },
  {
    id: 'q11',
    chapterId: 'movimentos-da-terra',
    type: 'true-false',
    question: 'O eixo de rotação da Terra é totalmente reto.',
    correctAnswer: false,
    explanation: 'O eixo da Terra é inclinado! E é essa pequena inclinação que forma as Estações do Ano. 🍂❄️🌸',
  },
  {
    id: 'q12',
    chapterId: 'movimentos-da-terra',
    type: 'true-false',
    question: 'Mesmo sem sentirmos, a Terra viaja muito rápido no espaço.',
    correctAnswer: true,
    explanation: 'Durante a translação, a Terra viaja a mais de 100 mil km/h! Segurem-se! 🚀',
  },
  {
    id: 'q13',
    chapterId: 'movimentos-da-terra',
    type: 'multiple-choice',
    question: 'O que acontece na parte do planeta que não está recebendo a luz do Sol?',
    options: ['Fica de Dia', 'Ocorre um Eclipse', 'Fica de Noite', 'Fica Inverno'],
    correctAnswer: 'Fica de Noite',
    explanation: 'Exato! A sombra da própria Terra nos deixa no escurinho para dormir. 💤',
  },

  // Capítulo 3: Constelações
  {
    id: 'q14',
    chapterId: 'constelaçoes',
    type: 'true-false',
    question: 'As constelações são desenhos reais feitos por cordas no espaço.',
    correctAnswer: false,
    explanation: 'Aquelas linhas são apenas imaginárias! Nós as criamos unindo os pontos de luz para contar histórias. ✨',
  },
  {
    id: 'q15',
    chapterId: 'constelaçoes',
    type: 'multiple-choice',
    question: 'Qual o nome das três estrelas que formam o cinto do guerreiro Órion?',
    options: ['As Três Estrelas', 'As Três Marias', 'As Três Irmãs', 'As Três Amigas'],
    correctAnswer: 'As Três Marias',
    explanation: 'Essas três ficam alinhadas e são muito famosas nas noites de verão aqui no Brasil! 🏹',
  },
  {
    id: 'q16',
    chapterId: 'constelaçoes',
    type: 'multiple-choice',
    question: 'Qual constelação em formato de cruz servia de bússola para antigos marinheiros no hemisfério sul?',
    options: ['Ursa Maior', 'Cão Maior', 'Cruzeiro do Sul', 'Escorpião'],
    correctAnswer: 'Cruzeiro do Sul',
    explanation: 'O Cruzeiro do Sul aponta com precisão para o Pólo Sul do nosso planeta! ✝️',
  },
  {
    id: 'q17',
    chapterId: 'constelaçoes',
    type: 'true-false',
    question: 'Sirius, a estrela mais brilhante do céu noturno, fica na constelação de Cão Maior.',
    correctAnswer: true,
    explanation: 'Isso é verdade! O Grande Cachorro segue brilhante pelo universo como o melhor amigo dos astrônomos! 🐕',
  },
  {
    id: 'q18',
    chapterId: 'constelaçoes',
    type: 'multiple-choice',
    question: 'Quem usava as constelações como mapa antes do GPS e da bússola existirem?',
    options: ['Navegadores e marinheiros', 'Aviadores a jato', 'Bombeiros', 'Mergulhadores'],
    correctAnswer: 'Navegadores e marinheiros',
    explanation: 'Antigamente, as estrelas eram os guias mais confiáveis nos mares escuros. ⛵',
  },
  {
    id: 'q19',
    chapterId: 'constelaçoes',
    type: 'multiple-choice',
    question: 'Na mitologia grega, a Ursa Maior estava escondendo quem?',
    options: ['Uma princesa', 'Um guerreiro', 'Um gigante', 'Um cavalo alado'],
    correctAnswer: 'Uma princesa',
    explanation: 'Conta a lenda que a princesa Calisto foi transformada em Ursa para se esconder no céu! 🐻',
  },

  // Capítulo 4: Fases da Lua
  {
    id: 'q20',
    chapterId: 'fases-da-lua',
    type: 'multiple-choice',
    question: 'Qual é a fase em que a Lua parece um círculo inteirinho iluminado?',
    options: ['Nova', 'Crescente', 'Cheia', 'Minguante'],
    correctAnswer: 'Cheia',
    explanation: 'A Lua Cheia acontece quando a face virada para nós fica totalmente iluminada pelo Sol! 🌕',
  },
  {
    id: 'q21',
    chapterId: 'fases-da-lua',
    type: 'true-false',
    question: 'A Lua brilha porque tem luz própria como uma lâmpada gigante.',
    correctAnswer: false,
    explanation: 'A Lua é como um espelho de rocha, o brilho que vemos nela é a luz do Sol refletida! ☀️➡️🌙',
  },
  {
    id: 'q22',
    chapterId: 'fases-da-lua',
    type: 'multiple-choice',
    question: 'Durante qual fase nós quase não conseguimos enxergar a Lua no céu noturno?',
    options: ['Quarto Crescente', 'Lua Nova', 'Lua Cheia', 'Quarto Minguante'],
    correctAnswer: 'Lua Nova',
    explanation: 'Na Lua Nova, a parte iluminada fica do outro lado, longe da nossa visão! 🌑',
  },
  {
    id: 'q23',
    chapterId: 'fases-da-lua',
    type: 'multiple-choice',
    question: 'Quando a Lua tem o formato de uma letra "C" brilhante no céu ocidental logo após o poente, ela está...',
    options: ['Crescente', 'Amarela', 'Sorrindo', 'Dormindo'],
    correctAnswer: 'Crescente',
    explanation: 'Quando forma o clássico desenho de meio-crescente ("C" no hemisfério sul), dizemos que ela está Crescente! 🌒',
  },
  {
    id: 'q24',
    chapterId: 'fases-da-lua',
    type: 'true-false',
    question: 'A Lua é imensamente maior do que o Planeta Terra.',
    correctAnswer: false,
    explanation: 'Na verdade, a Terra é cerca de 4 vezes maior do que a nossa pequena vizinha lunar! 🌍>🌝',
  },
  {
    id: 'q25',
    chapterId: 'fases-da-lua',
    type: 'multiple-choice',
    question: 'Qual nome damos à fase quando a luz da Lua vai diminuindo dia após dia, antes de virar Nova de novo?',
    options: ['Crescente', 'Cheia', 'Minguante', 'Escondida'],
    correctAnswer: 'Minguante',
    explanation: 'A Lua Minguante indica que o ciclo lunar está chegando ao seu fim. 🌘',
  }
]
