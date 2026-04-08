export type GameState = 'START' | 'CHAPTER_SELECT' | 'MODO_COMBATE' | 'MODO_DESAFIO' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

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

export type AlienType = 'NORMAL' | 'EXPLORADOR' | 'SHOOTER' | 'CONFUSOR' | 'GUARDIAN' | 'MESTRE' | 'CHEFÃO_CÓSMICO' | 'BOSS_EDUCATIVO';

export interface Alien extends GameObject {
  id: string;
  type: AlienType;
  points: number;
  speedY: number;
  speedX?: number; 
  health: number;
  maxHealth?: number;
  phase?: number;
}

export interface Bullet extends GameObject {
  owner: 'PLAYER' | 'ENEMY';
  speedY: number;
}

export type AnswerType = 'CORRETA' | 'ERRADA_COMUM' | 'ERRADA_PERIGOSA' | 'TRAP' | 'BONUS';

export interface AnswerItem extends GameObject {
  text: string;
  type: AnswerType;
  speedY: number;
  speedX: number; // Para oscilação lateral
  amplitude: number; // Intensidade da oscilação
  id: string;
  creationTime: number; // Para cálculo de seno/oscilação
  health: number;
  maxHealth: number;
}

export type QuestionLevel = 'Fácil' | 'Médio' | 'Difícil';
export type QuestionCategory = 'Sistema Solar' | 'Terra' | 'Lua' | 'Constelações' | 'Sol' | 'Exploração Espacial';

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  correct: string;
  alternatives: string[];
  explanation: string;
  level: QuestionLevel;
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
  is_perfect_run: boolean;
  correct_answers_by_category: Record<string, number>;
  max_streak: number;
}

export interface Chapter {
  id: number;
  slug: string;
  title: string;
  category: QuestionCategory;
  minScoreToUnlock: number;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
}

export interface UserProgressData {
  unlockedChapters: number[];
  highScores: Record<number, number>;
}

export interface QuestionEvent {
  user_id: string;
  game_slug: 'invasores-conhecimento';
  chapter_id: number;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  response_time_ms: number;
  difficulty: QuestionLevel;
}

export interface PedagogicalStats {
  accuracy_rate: number;
  avg_response_time: number;
  total_questions: number;
  mastered_categories: string[];
}
