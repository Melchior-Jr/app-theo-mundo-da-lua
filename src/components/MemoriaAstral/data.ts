import { GameCategory, AstralCard } from './types';

export interface SmartPair {
  pairId: string;
  left: Omit<AstralCard, 'id' | 'pairId' | 'description'>;
  right: Omit<AstralCard, 'id' | 'pairId' | 'description'>;
  description: string;
}

export const ASTRAL_DATA: Record<GameCategory, SmartPair[]> = {
  PLANETS: [
    { pairId: 'jupiter', left: { content: 'Jupiter', type: 'ICON', name: 'Júpiter' }, right: { content: 'Júpiter', type: 'TEXT', name: 'Júpiter' }, description: 'O gigante gasoso e o maior de todos!' },
    { pairId: 'mars', left: { content: 'Mars', type: 'ICON', name: 'Marte' }, right: { content: 'Marte', type: 'TEXT', name: 'Marte' }, description: 'O planeta vermelho com o maior vulcão do sistema solar.' },
    { pairId: 'earth', left: { content: 'Globe2', type: 'ICON', name: 'Terra' }, right: { content: 'Terra', type: 'TEXT', name: 'Terra' }, description: 'Nossa casa azul, cheia de vida e água!' },
    { pairId: 'saturn', left: { content: 'Orbit', type: 'ICON', name: 'Saturno' }, right: { content: 'Saturno', type: 'TEXT', name: 'Saturno' }, description: 'Famoso pelos seus anéis deslumbrantes.' },
    { pairId: 'venus', left: { content: 'Cloud', type: 'ICON', name: 'Vênus' }, right: { content: 'Vênus', type: 'TEXT', name: 'Vênus' }, description: 'O planeta mais quente e brilhante.' },
    { pairId: 'mercury', left: { content: 'Zap', type: 'ICON', name: 'Mercúrio' }, right: { content: 'Mercúrio', type: 'TEXT', name: 'Mercúrio' }, description: 'O vizinho mais próximo do Sol.' },
    { pairId: 'neptune', left: { content: 'Wind', type: 'ICON', name: 'Netuno' }, right: { content: 'Netuno', type: 'TEXT', name: 'Netuno' }, description: 'Longe e gelado, com ventos super rápidos.' },
    { pairId: 'uranus', left: { content: 'RefreshCcw', type: 'ICON', name: 'Urano' }, right: { content: 'Urano', type: 'TEXT', name: 'Urano' }, description: 'Um gigante de gelo que gira de lado!' }
  ],
  CURIOSITIES: [
    { pairId: 'saturn-ring', left: { content: 'Orbit', type: 'ICON', name: 'Saturno' }, right: { content: 'Tem anéis', type: 'TEXT', name: 'Curiosidade' }, description: 'Os anéis de Saturno são feitos de gelo e poeira.' },
    { pairId: 'mars-red', left: { content: 'Circle', type: 'ICON', name: 'Marte' }, right: { content: 'Vermelho', type: 'TEXT', name: 'Curiosidade' }, description: 'Marte parece vermelho por causa da ferrugem no solo.' },
    { pairId: 'sun-big', left: { content: 'Sun', type: 'ICON', name: 'Sol' }, right: { content: 'Gigante', type: 'TEXT', name: 'Curiosidade' }, description: 'Caberia mais de 1 milhão de Terras dentro do Sol!' },
    { pairId: 'moon-walk', left: { content: 'Footprints', type: 'ICON', name: 'Lua' }, right: { content: 'Pegadas', type: 'TEXT', name: 'Curiosidade' }, description: 'As pegadas dos astronautas na Lua ficam lá por milhões de anos.' },
    { pairId: 'blackhole', left: { content: 'Target', type: 'ICON', name: 'Buraco Negro' }, right: { content: 'Puxa Tudo', type: 'TEXT', name: 'Curiosidade' }, description: 'A gravidade é tão forte que nem a luz escapa.' },
    { pairId: 'stars-count', left: { content: 'Stars', type: 'ICON', name: 'Estrelas' }, right: { content: 'Infinitas', type: 'TEXT', name: 'Curiosidade' }, description: 'Existem mais estrelas no céu do que grãos de areia na Terra.' }
  ],
  MOON: [
    { pairId: 'new-moon', left: { content: 'MoonIcon', type: 'ICON', name: 'Nova' }, right: { content: 'Lua Nova', type: 'TEXT', name: 'Fase' }, description: 'Quando a Lua está entre a Terra e o Sol.' },
    { pairId: 'full-moon', left: { content: 'Sun', type: 'ICON', name: 'Cheia' }, right: { content: 'Lua Cheia', type: 'TEXT', name: 'Fase' }, description: 'A Lua está toda iluminada pelo Sol!' },
    { pairId: 'crescent', left: { content: 'Moon', type: 'ICON', name: 'Crescente' }, right: { content: 'Crescente', type: 'TEXT', name: 'Fase' }, description: 'Parece uma pequena unha ou sorriso no céu.' },
    { pairId: 'waning', left: { content: 'Moon', type: 'ICON', name: 'Minguante' }, right: { content: 'Minguante', type: 'TEXT', name: 'Fase' }, description: 'A parte iluminada está ficando menor.' }
  ],
  CONCEPTS: [
    { pairId: 'gravity', left: { content: 'Gravidade', type: 'TEXT', name: 'Conceito' }, right: { content: 'Força que puxa', type: 'TEXT', name: 'Explicação' }, description: 'A gravidade mantém nossos pés no chão!' },
    { pairId: 'orbit', left: { content: 'Órbita', type: 'TEXT', name: 'Conceito' }, right: { content: 'Caminho circular', type: 'TEXT', name: 'Explicação' }, description: 'A Terra orbita o Sol em um círculo gigante.' },
    { pairId: 'vacuum', left: { content: 'Vácuo', type: 'TEXT', name: 'Conceito' }, right: { content: 'Espaço vazio', type: 'TEXT', name: 'Explicação' }, description: 'No espaço não tem ar para respirar ou som para ouvir.' },
    { pairId: 'lightspeed', left: { content: 'Velocidade Luz', type: 'TEXT', name: 'Conceito' }, right: { content: 'Muito rápido', type: 'TEXT', name: 'Explicação' }, description: 'Nada no universo corre mais rápido que a luz!' }
  ],
  CONSTELLATIONS: [
    { pairId: 'cruzeiro', left: { content: 'Plus', type: 'ICON', name: 'Cruz' }, right: { content: 'Sul', type: 'TEXT', name: 'Constelação' }, description: 'Ajuda os navegantes a encontrar o Sul.' },
    { pairId: 'orion', left: { content: 'Sword', type: 'ICON', name: 'Caçador' }, right: { content: 'Órion', type: 'TEXT', name: 'Constelação' }, description: 'Famosa pelas "Três Marias" no seu cinturão.' },
    { pairId: 'ursa', left: { content: 'BearIcon', type: 'ICON', name: 'Ursa Maior' }, right: { content: 'Ursa', type: 'TEXT', name: 'Constelação' }, description: 'Parece uma colher gigante no céu do hemisfério Norte.' }
  ]
};
