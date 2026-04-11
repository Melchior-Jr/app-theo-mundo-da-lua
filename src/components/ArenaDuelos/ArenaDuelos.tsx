import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  Home, 
  Play, 
  Gamepad2, 
  Zap,
  Brain
} from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import { usePlayer } from '@/context/PlayerContext';
import StarField from '../StarField';
import styles from './ArenaDuelos.module.css';

interface ArenaDuelosProps {
  onStart?: (mode: 'casual' | 'ranked' | 'training', style: 'classic' | 'speedrun' | 'training') => void;
}

export const ArenaDuelos: React.FC<ArenaDuelosProps> = ({ onStart }) => {
  const { playSFX } = useSound();
  const { playerStats, playerData } = usePlayer();
  const [duelStyle, setDuelStyle] = useState<'classic' | 'speedrun' | 'training'>('classic');
  const handleStart = () => {
    playSFX('click');
    if (onStart) {
      // Se as regras forem de treinamento, o modo de destino também é treinamento
      const mode = duelStyle === 'training' ? 'training' : 'casual';
      onStart(mode, duelStyle);
    }
  };

  return (
    <div className={styles.arenaWrapper}>
      <StarField />
      
      {/* BACKGROUND DECOR */}
      <div className={styles.nebulaOverlay} />
      <div className={styles.crossSwordsBg}>
        <Swords size={400} strokeWidth={0.5} opacity={0.1} />
      </div>

      <div className={styles.lobbyContent}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link to="/jogos" className={styles.backBtn} onClick={() => playSFX('click')}>
              <Home size={20} />
              <span>SAIR DA ARENA</span>
            </Link>
            
            <div className={styles.playerMiniCard}>
               <div className={styles.playerAvatar}>
                 {playerData?.avatar_url ? (
                   <img src={playerData.avatar_url} alt="Avatar" />
                 ) : (
                   <div className={styles.avatarPlaceholder}>
                     {playerData?.username?.charAt(0) || 'A'}
                   </div>
                 )}
               </div>
               <div className={styles.playerInfo}>
                 <span className={styles.playerName}>{playerData?.username || 'Astronauta'}</span>
                 <span className={styles.playerWins}>{playerStats?.duel_wins || 0} Vitórias</span>
               </div>
            </div>
          </div>

          <div className={styles.titleWrapper}>
            <div className={styles.badge}>Rinha das Galáxias</div>
            <h1 className={styles.mainTitle}>
              ARENA DE <span className={styles.highlight}>DUELOS</span>
            </h1>
            <p className={styles.subtitle}>
              Teste seus conhecimentos contra o tempo e outros exploradores!
            </p>
          </div>
        </header>


        <div className={styles.modesContainer}>
          <h2 className={styles.sectionLabel}>REGRAS DO DUELO</h2>
          <div className={styles.styleGrid}>
             <button 
               className={`${styles.styleCard} ${duelStyle === 'classic' ? styles.styleActive : ''}`}
               onClick={() => { playSFX('click'); setDuelStyle('classic'); }}
             >
                <div className={styles.styleIcon}><Gamepad2 size={24} /></div>
                <div className={styles.styleInfo}>
                  <div className={styles.styleBadge}>MODO CLÁSSICO</div>
                  <div className={styles.styleDesc}>Até errar uma pergunta</div>
                </div>
             </button>
             <button 
               className={`${styles.styleCard} ${duelStyle === 'speedrun' ? styles.styleActive : ''}`}
               onClick={() => { playSFX('click'); setDuelStyle('speedrun'); }}
             >
                <div className={styles.styleIcon}><Zap size={24} /></div>
                <div className={styles.styleInfo}>
                  <div className={styles.styleBadge}>MODO SPEEDRUN</div>
                  <div className={styles.styleDesc}>3 vidas • Tempo é desempate</div>
                </div>
             </button>
             <button 
               className={`${styles.styleCard} ${duelStyle === 'training' ? styles.styleActive : ''}`}
               onClick={() => { playSFX('click'); setDuelStyle('training'); }}
             >
                <div className={styles.styleIcon}><Brain size={24} /></div>
                <div className={styles.styleInfo}>
                  <div className={styles.styleBadge}>TREINAMENTO</div>
                  <div className={styles.styleDesc}>Deseje um amigo sem apostar</div>
                </div>
             </button>
          </div>
        </div>

        {/* ACTION PANEL */}
        <footer className={styles.footer}>
          <div className={styles.energyBar}>
             <div className={styles.energyLabel}>ENERGIA DE COMBATE</div>
             <div className={styles.energyTrack}>
                <div className={styles.energyFill} style={{ width: '85%' }} />
             </div>
          </div>

          <button className={styles.startBtn} onClick={handleStart}>
            <span className={styles.btnGlow} />
            <Play size={24} fill="currentColor" />
            ENTRAR NA ARENA
          </button>
        </footer>
      </div>

      {/* FOOTER DECOR */}
      <div className={styles.scanline} />
      <div className={styles.vignette} />
    </div>
  );
};
