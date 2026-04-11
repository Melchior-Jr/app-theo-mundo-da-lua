export type CardDisplayType = 'ICON' | 'TEXT' | 'IMAGE';

export interface AstralCard {
  id: string;             // ID único da instância da carta
  pairId: string;         // ID do par (para dar match)
  content: string;        // Nome da classe da imagem, ícone lucide ou texto
  type: CardDisplayType;  // Como renderizar o conteúdo
  name: string;           // Nome legível do astro
  description?: string;    // Curiosidade/Explicação
}

export type CardStatus = 'HIDDEN' | 'FLIPPED' | 'MATCHED';

export interface AstralCardInstance extends AstralCard {
  instanceId: string;
  status: CardStatus;
}

export type GameMode = 'CLASSIC' | 'EDUCATIONAL' | 'RAPID' | 'EXPLORATION';
export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type GameCategory = 'PLANETS' | 'CURIOSITIES' | 'MOON' | 'CONCEPTS' | 'CONSTELLATIONS';

export interface GameSettings {
  timeEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  mode: GameMode;
  difficulty: GameDifficulty;
  category: GameCategory;
}

export interface GameState {
  cards: AstralCardInstance[];
  flippedIndices: number[];
  isProcessing: boolean;
  matchesCount: number;
  score: number;
  attempts: number;
  combo: number;
  maxCombo: number;
  message: string;
  isGameFinished: boolean;
  timeSeconds: number;
  startTime: number | null;
  settings: GameSettings;
  lastMatchIndices: number[];
  theoState: 'HAPPY' | 'NEUTRAL' | 'SAD' | 'THINKING';
  currentExplanation?: string; // Explicação para o modo educativo
}
