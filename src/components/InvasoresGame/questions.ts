import { Question } from './types';

export const QUESTIONS_DATABASE: Question[] = [
  // --- SISTEMA SOLAR ---
  {
    id: 'ss-01',
    category: 'Sistema Solar',
    text: 'Qual é o maior planeta do Sistema Solar?',
    correct: 'Júpiter',
    alternatives: ['Saturno', 'Terra', 'Marte'],
    explanation: 'Júpiter tem mais que o dobro da massa de todos os outros planetas juntos!',
    level: 'Fácil'
  },
  {
    id: 'ss-02',
    category: 'Sistema Solar',
    text: 'Qual é o planeta mais quente do Sistema Solar?',
    correct: 'Vênus',
    alternatives: ['Mercúrio', 'Marte', 'Júpiter'],
    explanation: 'Mesmo Mercúrio estando mais perto do Sol, a atmosfera de Vênus prende o calor como uma estufa!',
    level: 'Médio'
  },
  {
    id: 'ss-03',
    category: 'Sistema Solar',
    text: 'Qual planeta tem os anéis mais visíveis?',
    correct: 'Saturno',
    alternatives: ['Urano', 'Netuno', 'Júpiter'],
    explanation: 'Embora outros planetas tenham anéis, os de Saturno são os maiores e mais brilhantes.',
    level: 'Médio'
  },
  {
    id: 'ss-04',
    category: 'Sistema Solar',
    text: 'Plutão é atualmente classificado como:',
    correct: 'Planeta anão',
    alternatives: ['Planeta principal', 'Lua de Netuno', 'Asteróide'],
    explanation: 'Plutão foi reclassificado em 2006 por não ter "limpado" sua própria órbita.',
    level: 'Difícil'
  },
  {
    id: 'ss-05',
    category: 'Sistema Solar',
    text: 'Qual é o planeta conhecido como "Planeta Vermelho"?',
    correct: 'Marte',
    alternatives: ['Vênus', 'Mercúrio', 'Saturno'],
    explanation: 'Marte tem essa cor por causa do óxido de ferro (ferrugem) em sua superfície.',
    level: 'Fácil'
  },
  // --- TERRA ---
  {
    id: 'tr-01',
    category: 'Terra',
    text: 'Qual destes é o único planeta conhecido por ter vida?',
    correct: 'Terra',
    alternatives: ['Marte', 'Vênus', 'Júpiter'],
    explanation: 'Até agora, a Terra é o único lugar no universo onde sabemos que existe vida!',
    level: 'Fácil'
  },
  {
    id: 'tr-02',
    category: 'Terra',
    text: 'O movimento da Terra em torno do seu próprio eixo chama-se:',
    correct: 'Rotação',
    alternatives: ['Translação', 'Nutação', 'Revolução'],
    explanation: 'A rotação dura aproximadamente 24 horas e é responsável pelo dia e pela noite.',
    level: 'Fácil'
  },
  {
    id: 'tr-03',
    category: 'Terra',
    text: 'O que causa as estações do ano?',
    correct: 'Inclinação do eixo da Terra',
    alternatives: ['Distância do Sol', 'A velocidade do vento', 'Fases da Lua'],
    explanation: 'A inclinação de 23.5 graus faz com que a luz solar atinja os hemisférios de forma diferente ao longo do ano.',
    level: 'Difícil'
  },
  {
    id: 'tr-04',
    category: 'Terra',
    text: 'A camada de ar que envolve a Terra chama-se:',
    correct: 'Atmosfera',
    alternatives: ['Hidrosfera', 'Litosfera', 'Biosfera'],
    explanation: 'A atmosfera nos protege e contém o oxigênio que respiramos.',
    level: 'Médio'
  },
  // --- LUA ---
  {
    id: 'lu-01',
    category: 'Lua',
    text: 'A Lua é um satélite natural de qual planeta?',
    correct: 'Terra',
    alternatives: ['Marte', 'Júpiter', 'Saturno'],
    explanation: 'A Lua orbita a Terra a uma distância média de 384.400 km.',
    level: 'Fácil'
  },
  {
    id: 'lu-02',
    category: 'Lua',
    text: 'Em qual fase a Lua fica totalmente iluminada pelo Sol?',
    correct: 'Lua Cheia',
    alternatives: ['Lua Nova', 'Quarto Crescente', 'Quarto Minguante'],
    explanation: 'Na Lua Cheia, a Terra está entre o Sol e a Lua, permitindo ver toda a face iluminada.',
    level: 'Médio'
  },
  {
    id: 'lu-03',
    category: 'Lua',
    text: 'Como a Lua influencia os oceanos da Terra?',
    correct: 'Criação das marés',
    alternatives: ['Aumento das ondas', 'Corrente de ar', 'Salinidade'],
    explanation: 'A gravidade da Lua puxa a água dos oceanos, criando o ciclo de maré alta e baixa.',
    level: 'Difícil'
  },
  {
    id: 'lu-04',
    category: 'Lua',
    text: 'Quantas pessoas já pisaram na Lua até hoje?',
    correct: '12',
    alternatives: ['1', '50', 'Nenhuma'],
    explanation: 'Entre 1969 e 1972, 12 astronautas americanos caminharam na superfície lunar.',
    level: 'Difícil'
  },
  // --- CONSTELAÇÕES ---
  {
    id: 'cs-01',
    category: 'Constelações',
    text: 'Qual estrela é usada para encontrar o Sul aqui no Brasil?',
    correct: 'Cruzeiro do Sul',
    alternatives: ['Estrela Polar', 'Sirius', 'Betelgeuse'],
    explanation: 'O Cruzeiro do Sul é a menor constelação, mas muito importante para navegação no hemisfério sul.',
    level: 'Fácil'
  },
  {
    id: 'cs-02',
    category: 'Constelações',
    text: 'As "Três Marias" fazem parte de qual constelação?',
    correct: 'Orion',
    alternatives: ['Centauro', 'Lira', 'Pegaso'],
    explanation: 'Elas formam o cinturão do caçador mitológico Orion.',
    level: 'Médio'
  },
  {
    id: 'cs-03',
    category: 'Constelações',
    text: 'Como se chamam os desenhos formados por estrelas no céu?',
    correct: 'Constelações',
    alternatives: ['Galáxias', 'Nebulosas', 'Cometas'],
    explanation: 'Civilizações antigas criaram esses desenhos para contar histórias e se localizar.',
    level: 'Fácil'
  },
  // --- EXPLORAÇÃO ESPACIAL ---
  {
    id: 'ex-01',
    category: 'Exploração Espacial',
    text: 'Quem foi o primeiro ser humano a ir para o espaço?',
    correct: 'Yuri Gagarin',
    alternatives: ['Neil Armstrong', 'Marcos Pontes', 'Buzz Aldrin'],
    explanation: 'O russo Yuri Gagarin foi ao espaço em 1961 e disse: "A Terra é azul!".',
    level: 'Médio'
  },
  {
    id: 'ex-02',
    category: 'Exploração Espacial',
    text: 'Qual é o nome da agência espacial dos Estados Unidos?',
    correct: 'NASA',
    alternatives: ['ESA', 'AEB', 'SpaceX'],
    explanation: 'A NASA foi criada em 1958 e é responsável pelas missões Apollo que foram à Lua.',
    level: 'Fácil'
  },
  {
    id: 'ex-03',
    category: 'Exploração Espacial',
    text: 'Onde os astronautas moram quando estão no espaço?',
    correct: 'Estação Espacial Internacional',
    alternatives: ['Em um ônibus espacial', 'Na Lua', 'Em Marte'],
    explanation: 'A Estação Espacial (ISS) orbita a Terra e recebe cientistas de vários países.',
    level: 'Médio'
  }
];
