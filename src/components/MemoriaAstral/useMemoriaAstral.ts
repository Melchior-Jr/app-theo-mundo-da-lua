import { useState, useCallback, useEffect } from 'react';
import { AstralCardInstance, GameState, GameMode, GameCategory, GameSettings } from './types';
import { ASTRAL_DATA } from './data';
import { useSound } from '@/context/SoundContext';

export const useMemoriaAstral = (initialPairs: number = 6, initialMode: GameMode = 'EDUCATIONAL', initialCategory: GameCategory = 'PLANETS') => {
  const [state, setState] = useState<GameState>({
    cards: [],
    flippedIndices: [],
    isProcessing: false,
    matchesCount: 0,
    score: 0,
    attempts: 0,
    combo: 0,
    maxCombo: 0,
    message: "Bem-vindo ao Laboratório Espacial!",
    isGameFinished: false,
    timeSeconds: 0,
    startTime: null,
    settings: {
      timeEnabled: initialMode === 'RAPID',
      soundEnabled: true,
      reducedMotion: false,
      mode: initialMode,
      difficulty: initialPairs === 4 ? 'EASY' : initialPairs === 8 ? 'HARD' : 'MEDIUM',
      category: initialCategory
    },
    lastMatchIndices: [],
    theoState: 'NEUTRAL',
    currentExplanation: undefined
  });

  const { playSFX, playBGMusic, stopBGMusic } = useSound();
  const [isGameOver, setIsGameOver] = useState(false);

  const HIT_MESSAGES = ["Incrível!", "Uau!", "Estelar!", "Você é demais!", "Foco total!"];
  const MISS_MESSAGES = ["Quase lá!", "Tente de novo!", "Continue explorando!", "Ops, quase!"];

  const getRapidTimeLimit = () => 45; // 45 segundos para o modo rápido

  const timeLeft = state.settings.mode === 'RAPID' 
    ? getRapidTimeLimit() - state.timeSeconds 
    : Infinity;

  // Inicializa o jogo
  const initGame = useCallback((
    pairsCount: number = initialPairs, 
    mode: GameMode = state.settings.mode,
    category: GameCategory = state.settings.category
  ) => {
    // Pegar pares da categoria e limitar pela dificuldade (pairsCount)
    const categoryData = ASTRAL_DATA[category] || ASTRAL_DATA.PLANETS;
    const selectedPairs = categoryData.slice(0, pairsCount);
    
    // Gerar instâncias para Lado Esquerdo e Lado Direito de cada par
    const deck: AstralCardInstance[] = [];
    
    selectedPairs.forEach((pair) => {
      // Instância "Esquerda"
      const leftId = `left-${pair.pairId}-${Math.random()}`;
      deck.push({
        ...pair.left,
        id: leftId,
        instanceId: leftId,
        pairId: pair.pairId,
        description: pair.description,
        status: 'HIDDEN'
      });
      // Instância "Direita"
      const rightId = `right-${pair.pairId}-${Math.random()}`;
      deck.push({
        ...pair.right,
        id: rightId,
        instanceId: rightId,
        pairId: pair.pairId,
        description: pair.description,
        status: 'HIDDEN'
      });
    });

    // Embaralhar
    const shuffledDeck = deck.sort(() => Math.random() - 0.5);

    setIsGameOver(false);
    setState(prev => ({
      ...prev,
      cards: shuffledDeck,
      flippedIndices: [],
      isProcessing: false,
      matchesCount: 0,
      score: 0,
      attempts: 0,
      combo: 0,
      maxCombo: 0,
      message: mode === 'EDUCATIONAL' ? "Acerte os pares para aprender!" : "Encontre os pares!",
      isGameFinished: false,
      timeSeconds: 0,
      startTime: null,
      settings: {
        ...prev.settings,
        mode,
        category,
        difficulty: pairsCount === 4 ? 'EASY' : pairsCount === 8 ? 'HARD' : 'MEDIUM',
        timeEnabled: mode === 'RAPID'
      },
      lastMatchIndices: [],
      theoState: 'NEUTRAL',
      currentExplanation: undefined
    }));
  }, [initialPairs, state.settings.mode, state.settings.category]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (state.startTime && !state.isGameFinished && !isGameOver && state.settings.timeEnabled) {
      interval = setInterval(() => {
        setState(prev => {
          const newTime = Math.floor((Date.now() - prev.startTime!) / 1000);
          
          if (prev.settings.mode === 'RAPID' && newTime >= 45) {
            setIsGameOver(true);
            if (prev.settings.soundEnabled) playSFX('fail');
            return { ...prev, timeSeconds: 45 };
          }
          
          return {
            ...prev,
            timeSeconds: newTime
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.startTime, state.isGameFinished, isGameOver, state.settings.timeEnabled]);

  // Funções de Configuração
  const toggleSetting = (setting: keyof GameSettings) => {
    setState(prev => {
      const newValue = !prev.settings[setting];
      
      // Se estiver mutando a música especificamente
      if (setting === 'soundEnabled') {
        if (!newValue) stopBGMusic();
        else playBGMusic();
      }
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [setting]: newValue
        }
      };
    });
  };

  const handleCardClick = (index: number) => {
    const { cards, flippedIndices, isProcessing, startTime, isGameFinished } = state;

    if (isProcessing || isGameFinished || isGameOver || cards[index].status !== 'HIDDEN' || flippedIndices.includes(index)) {
      return;
    }

    if (!startTime) {
      setState(prev => ({ ...prev, startTime: Date.now() }));
    }

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], status: 'FLIPPED' };
    const newFlipped = [...flippedIndices, index];

    setState(prev => {
      if (prev.settings.soundEnabled) playSFX('flipCard');
      return {
        ...prev,
        cards: newCards,
        flippedIndices: newFlipped,
        theoState: 'THINKING'
      };
    });

    if (newFlipped.length === 2) {
      verifyMatch(newCards, newFlipped);
    }
  };

  const verifyMatch = (currentCards: AstralCardInstance[], openIndices: number[]) => {
    const [idx1, idx2] = openIndices;
    const card1 = currentCards[idx1];
    const card2 = currentCards[idx2];
    if (card1.pairId === card2.pairId) {
      setTimeout(() => {
        setState(prev => {
          const updatedCards = prev.cards.map((c, i) => 
            i === idx1 || i === idx2 ? { ...c, status: 'MATCHED' as const } : c
          );
          
          const totalPairs = prev.cards.length / 2;
          const newMatchesCount = prev.matchesCount + 1;
          const isFinished = newMatchesCount === totalPairs;
          const newCombo = prev.combo + 1;
          
          // Pontuação removida no modo Exploração
          const pointsGained = prev.settings.mode === 'EXPLORATION' ? 0 : (100 + (prev.combo * 50));
          
          if (prev.settings.soundEnabled) {
            if (isFinished) playSFX('success');
            else playSFX('correct');
          }

          const randomHit = HIT_MESSAGES[Math.floor(Math.random() * HIT_MESSAGES.length)];

          const now = Date.now();
          const finalTime = prev.startTime ? Math.floor((now - prev.startTime) / 1000) : 0;

          return {
            ...prev,
            cards: updatedCards,
            flippedIndices: [],
            isProcessing: false,
            attempts: prev.attempts + 1,
            matchesCount: newMatchesCount,
            score: prev.score + pointsGained,
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            message: isFinished ? "Setor explorado com sucesso!" : randomHit,
            currentExplanation: prev.settings.mode === 'EDUCATIONAL' ? card1.description : undefined,
            isGameFinished: isFinished,
            timeSeconds: isFinished ? finalTime : prev.timeSeconds,
            lastMatchIndices: [idx1, idx2],
            theoState: 'HAPPY'
          };
        });
        
        // Limpar o brilho do match após a animação
        setTimeout(() => {
          setState(prev => ({ ...prev, lastMatchIndices: [] }));
        }, 1500);
      }, 500); 
    } else {
      setTimeout(() => {
        setState(prev => {
          if (prev.settings.soundEnabled) playSFX('wrong');
          const updatedCards = prev.cards.map((c, i) => 
            i === idx1 || i === idx2 ? { ...c, status: 'HIDDEN' as const } : c
          );
          const randomMiss = MISS_MESSAGES[Math.floor(Math.random() * MISS_MESSAGES.length)];
          
          // Limite opcional de tentativas se quiser adicionar no futuro
          // if (currentAttempts >= 50) setIsGameOver(true);

          return {
            ...prev,
            cards: updatedCards,
            flippedIndices: [],
            isProcessing: false,
            attempts: prev.attempts + 1,
            combo: 0,
            message: randomMiss,
            theoState: 'SAD'
          };
        });

        // Resetar para neutro após o erro
        setTimeout(() => {
          setState(prev => ({ ...prev, theoState: 'NEUTRAL' }));
        }, 1000);
      }, 1000);
    }
  };

  return {
    ...state,
    isGameOver,
    timeLeft,
    handleCardClick,
    initGame,
    toggleSetting
  };
};
