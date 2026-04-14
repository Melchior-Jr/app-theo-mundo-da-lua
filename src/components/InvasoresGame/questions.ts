import { Question } from './types';

export const QUESTIONS_DATABASE: Question[] = [
  // --- SISTEMA SOLAR ---
  {
    id: 'astro-01',
    category: 'Sistema Solar',
    text: 'Qual é o maior planeta do nosso Sistema Solar?',
    correct: 'Júpiter',
    alternatives: ['Saturno', 'Netuno', 'Terra'],
    explanation: 'Júpiter é um gigante gasoso e o maior planeta do Sistema Solar!',
    level: 'Fácil'
  },
  {
    id: 'astro-02',
    category: 'Sistema Solar',
    text: 'Qual planeta é conhecido como o "Planeta Vermelho"?',
    correct: 'Marte',
    alternatives: ['Vênus', 'Mercúrio', 'Júpiter'],
    explanation: 'Marte tem essa cor por causa do óxido de ferro em sua superfície!',
    level: 'Fácil'
  },
  {
    id: 'astro-03',
    category: 'Sistema Solar',
    text: 'Qual destes planetas tem os anéis mais visíveis?',
    correct: 'Saturno',
    alternatives: ['Urano', 'Júpiter', 'Netuno'],
    explanation: 'Saturno é famoso por seus belos e grandes anéis compostos de gelo e rocha!',
    level: 'Fácil'
  },
  {
    id: 'astro-04',
    category: 'Sistema Solar',
    text: 'Quantos planetas existem no nosso Sistema Solar?',
    correct: '8',
    alternatives: ['9', '7', '10'],
    explanation: 'Atualmente temos 8 planetas oficiais. Plutão é considerado um planeta anão!',
    level: 'Médio'
  },

  // --- LUA ---
  {
    id: 'astro-05',
    category: 'Lua',
    text: 'Quanto tempo a Lua leva para dar uma volta na Terra?',
    correct: 'Aproximadamente 27 dias',
    alternatives: ['7 dias', '365 dias', '24 horas'],
    explanation: 'O ciclo lunar completo leva cerca de 27.3 dias terrestres!',
    level: 'Médio'
  },
  {
    id: 'astro-06',
    category: 'Lua',
    text: 'Qual é a fase da Lua que não conseguimos ver no céu noturno?',
    correct: 'Lua Nova',
    alternatives: ['Lua Cheia', 'Quarto Crescente', 'Quarto Minguante'],
    explanation: 'Na Lua Nova, a parte iluminada está voltada para o Sol, longe da Terra!',
    level: 'Fácil'
  },
  {
    id: 'astro-07',
    category: 'Lua',
    text: 'A Lua brilha porque...',
    correct: 'Reflete a luz do Sol',
    alternatives: ['Tem luz própria', 'É feita de fogo', 'Tem eletricidade'],
    explanation: 'A Lua funciona como um espelho gigante que reflete a luz solar!',
    level: 'Fácil'
  },

  // --- ESTRELAS ---
  {
    id: 'astro-08',
    category: 'Estrelas',
    text: 'Qual é a estrela mais próxima da Terra?',
    correct: 'Sol',
    alternatives: ['Sirius', 'Proxima Centauri', 'Estrela Polar'],
    explanation: 'O Sol é a nossa estrela central!',
    level: 'Fácil'
  },
  {
    id: 'astro-09',
    category: 'Estrelas',
    text: 'O que é uma Supernova?',
    correct: 'A explosão de uma estrela',
    alternatives: ['Uma estrela bebê', 'Um planeta novo', 'Um buraco negro'],
    explanation: 'Supernova é a fase final e explosiva de estrelas muito grandes!',
    level: 'Médio'
  },

  // --- EXPLORAÇÃO ESPACIAL ---
  {
    id: 'astro-10',
    category: 'Exploração Espacial',
    text: 'Quem foi o primeiro ser humano a ir ao espaço?',
    correct: 'Yuri Gagarin',
    alternatives: ['Neil Armstrong', 'Buzz Aldrin', 'Marcos Pontes'],
    explanation: 'O soviético Yuri Gagarin foi o primeiro em 1961!',
    level: 'Médio'
  },
  {
    id: 'astro-11',
    category: 'Exploração Espacial',
    text: 'Em que ano o homem pisou na Lua pela primeira vez?',
    correct: '1969',
    alternatives: ['1959', '1975', '1961'],
    explanation: 'A missão Apollo 11 pousou na Lua em 20 de julho de 1969!',
    level: 'Difícil'
  },

  // --- PLANETAS ---
  {
    id: 'astro-12',
    category: 'Planetas',
    text: 'Qual é o planeta mais quente do Sistema Solar?',
    correct: 'Vênus',
    alternatives: ['Mercúrio', 'Marte', 'Sol'],
    explanation: 'Vênus é mais quente que Mercúrio devido ao seu forte efeito estufa!',
    level: 'Difícil'
  },
  {
    id: 'astro-13',
    category: 'Planetas',
    text: 'Qual planeta gira "de lado" (eixo inclinado quase 90 graus)?',
    correct: 'Urano',
    alternatives: ['Netuno', 'Saturno', 'Júpiter'],
    explanation: 'Urano é único por seu eixo de rotação ser quase paralelo ao seu plano orbital!',
    level: 'Difícil'
  }
];
