import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArenaDuelos } from '@/components/ArenaDuelos/ArenaDuelos';
import QuizSystem from '@/components/QuizSystem';
import styles from './ArenaDuelosPage.module.css';

export default function ArenaDuelosPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'LOBBY' | 'GAME'>('LOBBY');
  const [duelConfig, setDuelConfig] = useState<{ mode: string, style: 'classic' | 'speedrun' | 'training' }>({ mode: 'casual', style: 'classic' });

  const handleStartGame = (mode: any, style: any) => {
    setDuelConfig({ mode, style });
    setGameState('GAME');
  };

  const handleExit = () => {
    if (gameState === 'GAME') {
      setGameState('LOBBY');
    } else {
      navigate('/jogos');
    }
  };

  return (
    <div className={styles.page}>
      {gameState === 'LOBBY' ? (
        <ArenaDuelos onStart={handleStartGame} />
      ) : (
        <div className={styles.gameWrapper}>
          <QuizSystem 
            level={1} 
            mode="challenge" 
            defaultDuelMode={duelConfig.style}
            onExit={handleExit} 
          />
        </div>
      )}
    </div>
  );
}
