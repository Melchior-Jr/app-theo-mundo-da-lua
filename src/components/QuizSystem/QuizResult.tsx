import styles from './QuizSystem.module.css'
import { IoPlanet, IoTrophy, IoArrowBack, IoRefresh } from 'react-icons/io5'
import Fireworks from '@/components/Fireworks'
import { getRandomMessage } from '@/data/theoMessages'
import TheoCharacter from '../TheoCharacter'

interface QuizResultProps {
  status: 'finished' | 'gameover'
  xp: number
  totalQuestions: number
  correctAnswers: number
  onRetry: () => void
  onExit: () => void
  onShare?: () => void
}

import { IoShareSocial } from 'react-icons/io5'
import { useState } from 'react'

export default function QuizResult({ 
  status, 
  xp, 
  totalQuestions, 
  correctAnswers, 
  onRetry, 
  onExit,
  onShare 
}: QuizResultProps) {
  const isWinner = status === 'finished'
  const message = isWinner ? getRandomMessage('finished') : getRandomMessage('gameOver')
  const [shared, setShared] = useState(false)

  const handleShare = () => {
    if (!shared && onShare) {
      onShare()
      setShared(true)
    }
  }

  return (
    <div className={`${styles.resultContainer} ${isWinner ? styles.ceremony : ''}`}>
      {isWinner && (
        <>
          <Fireworks />
          <div className={styles.victoryFlash} />
        </>
      )}
      
      <div className={styles.theoResultFrame}>
        <TheoCharacter 
          size={180}
          emotion={isWinner ? 'celebrate' : 'sad'}
          className={styles.theoAvatarResult}
        />
      </div>

      <div className={styles.resultIcon}>
        {isWinner ? (
          <div className={styles.trophyWrapper}>
             <IoTrophy className={styles.finalTrophy} />
             <div className={styles.trophyGlow} />
          </div>
        ) : (
          <IoPlanet style={{ color: '#ff3d71', fontSize: '80px' }} />
        )}
      </div>

      <h1 className={styles.resultTitle}>
        {isWinner ? 'ENTROU PRA HISTÓRIA!' : 'OXE! QUE FOI ISSO?'}
      </h1>

      <p className={styles.resultSub}>
        {message}
      </p>

      <div className={styles.xpCard}>
        <div className={styles.xpTotal}>+{xp} XP</div>
        <span>Ganho total na missão</span>
      </div>

      {isWinner && (
        <button 
          className={`${styles.shareBtn} ${shared ? styles.shared : ''}`} 
          onClick={handleShare}
          disabled={shared}
        >
          <IoShareSocial /> {shared ? 'COMPARTILHADO! +100 XP' : 'COMPARTILHAR RESULTADO (+100 XP)'}
        </button>
      )}

      <div className={styles.statsSummary}>
        <div className={styles.summItem}>
          <strong>{Math.round(correctAnswers)}</strong>
          <span>Acertos</span>
        </div>
        <div className={styles.summItem}>
          <strong>{totalQuestions}</strong>
          <span>Perguntas</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.retryBtn} onClick={onRetry}>
          <IoRefresh /> TENTAR NOVAMENTE
        </button>
        <button className={styles.backBtn} onClick={onExit}>
          <IoArrowBack /> VOLTAR PRA CENTRAL
        </button>
      </div>
    </div>
  )
}
