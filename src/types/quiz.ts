export type QuizQuestionType = 
  | 'multiple-choice' 
  | 'true-false' 
  | 'drag-drop-order' 
  | 'drag-drop-match' 
  | 'image-id' 
  | 'fast-response' 
  | 'fill-blanks' 
  | 'scene-selection' 
  | 'audio-guess' 
  | 'logical-sequence'

export interface QuizQuestion {
  id: string
  subject?: 'astronomy' | 'geosciences'
  level: number
  challenge: number
  type: QuizQuestionType
  question: string
  options?: string[]
  items?: { id: string; label: string; matchId?: string }[]
  correctAnswer: any
  explanation: string
  image?: string
  audio?: string
  explanationAudio?: string
  modelUrl?: string
  timeLimit?: number
}

export interface QuizLevel {
  id: number
  title: string
  description: string
  icon: string
}

export interface QuizResult {
  xpGained: number
  correctCount: number
  totalQuestions: number
  status: 'finished' | 'gameover'
}

export interface QuestionLogEntry {
  questionId: string
  isCorrect: boolean
  timeSpent: number // seconds
}

export interface QuizState {
  currentIdx: number
  lives: number
  xp: number
  combo: number
  status: 'playing' | 'feedback' | 'finished' | 'gameover'
  lastAnswerCorrect: boolean | null
  correctCount: number
  hasMistakes: boolean
  maxCombo: number
  questionsLog: QuestionLogEntry[]
}
