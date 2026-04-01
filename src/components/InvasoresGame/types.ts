export type GameState = 'START' | 'PLAYING' | 'QUESTION_ACTIVE' | 'PAUSED' | 'GAMEOVER';

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  lives: number;
  speed: number;
}

export interface Alien extends GameObject {
  id: string;
  type: 'NORMAL' | 'FAST' | 'SPECIAL';
  points: number;
  speedY: number;
  health: number;
}

export interface Bullet extends GameObject {
  owner: 'PLAYER' | 'ENEMY';
  speedY: number;
}

export interface AnswerItem extends GameObject {
  text: string;
  isCorrect: boolean;
  speedY: number;
  id: string;
}

export interface Question {
  id: string;
  theme: 'SISTEMA_SOLAR' | 'PLANETAS' | 'TERRA' | 'LUA' | 'CONSTELACOES';
  text: string;
  correct: string;
  alternatives: string[]; // Erros
  difficulty: number;
}

export interface GameResult {
  game_slug: 'invasores-conhecimento';
  score: number;
  xp_earned: number;
  aliens_destroyed: number;
  correct_answers: number;
  wrong_answers_hit: number;
  wrong_answers_destroyed: number;
  max_combo: number;
  duration: number;
  lives_remaining: number;
}
