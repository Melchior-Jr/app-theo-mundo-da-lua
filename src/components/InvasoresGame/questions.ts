export interface Question {
  id: string;
  theme: 'SISTEMA_SOLAR' | 'PLANETAS' | 'TERRA' | 'LUA' | 'CONSTELACOES';
  text: string;
  correct: string;
  alternatives: string[]; // Erros
  difficulty: number;
}

export const INVASORES_QUESTIONS: Question[] = [
  // --- NÍVEL 1: Super Curtas e Fáceis ---
  {
    id: 'q1',
    theme: 'SISTEMA_SOLAR',
    text: 'Maior planeta?',
    correct: 'Júpiter',
    alternatives: ['Marte', 'Terra', 'Vênus'],
    difficulty: 1
  },
  {
    id: 'q2',
    theme: 'SISTEMA_SOLAR',
    text: 'O Sol é uma...',
    correct: 'Estrela',
    alternatives: ['Planeta', 'Lua', 'Buraco'],
    difficulty: 1
  },
  {
    id: 'q3',
    theme: 'LUA',
    text: 'A Lua é um...',
    correct: 'Satélite',
    alternatives: ['Planeta', 'Estrela', 'Meteoro'],
    difficulty: 1
  },
  {
    id: 'q4',
    theme: 'PLANETAS',
    text: 'Planeta Vermelho?',
    correct: 'Marte',
    alternatives: ['Saturno', 'Mercúrio', 'Netuno'],
    difficulty: 1
  },
  {
    id: 'q5',
    theme: 'PLANETAS',
    text: 'Tem anéis?',
    correct: 'Saturno',
    alternatives: ['Urano', 'Júpiter', 'Vênus'],
    difficulty: 1
  },
  {
    id: 'q6',
    theme: 'PLANETAS',
    text: 'Perto do Sol?',
    correct: 'Mercúrio',
    alternatives: ['Vênus', 'Marte', 'Terra'],
    difficulty: 1
  },
  {
    id: 'q7',
    theme: 'LUA',
    text: 'Fase da lua cheia?',
    correct: 'Iluminada',
    alternatives: ['Escura', 'Metade', 'Sumiu'],
    difficulty: 1
  },

  // --- NÍVEL 2: Médias ---
  {
    id: 'q8',
    theme: 'TERRA',
    text: 'Gira nela mesma?',
    correct: 'Rotação',
    alternatives: ['Translação', 'Órbita', 'Eclipse'],
    difficulty: 2
  },
  {
    id: 'q9',
    theme: 'SISTEMA_SOLAR',
    text: 'Quantos planetas?',
    correct: '8 planetas',
    alternatives: ['10 planetas', '9 planetas', '5 planetas'],
    difficulty: 2
  },
  {
    id: 'q10',
    theme: 'TERRA',
    text: 'Gira no Sol?',
    correct: 'Translação',
    alternatives: ['Rotação', 'Gravidade', 'Inclinação'],
    difficulty: 2
  },

  // --- NÍVEL 3: Desafiadoras ---
  {
    id: 'q11',
    theme: 'LUA',
    text: '"Manchas" na Lua?',
    correct: 'Mares',
    alternatives: ['Crateras', 'Buracos', 'Nuvens'],
    difficulty: 3
  },
  {
    id: 'q12',
    theme: 'CONSTELACOES',
    text: 'Desenho de estrelas?',
    correct: 'Constelação',
    alternatives: ['Galáxia', 'Nebulosa', 'Aglomerado'],
    difficulty: 2
  }
];
