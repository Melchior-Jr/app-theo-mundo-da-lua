import { useEffect } from 'react'
import TheoCharacter from '@/components/TheoCharacter'
import { getNarrationById } from '@/data/narration'
import { useNarration } from '@/hooks/useNarration'
import styles from './TheoSpinner.module.css'

interface TheoSpinnerProps {
  label?: string
  silent?: boolean
}

export default function TheoSpinner({ 
  label = 'Carrregando o universo...',
  silent = false 
}: TheoSpinnerProps) {
  const loadingNarration = getNarrationById('loading')
  const { play, stop } = useNarration((loadingNarration && !silent) ? loadingNarration : null)

  useEffect(() => {
    // Ao montar o spinner, toca o áudio "Calma aí gente..." automaticamente
    if (loadingNarration) {
      play()
    }
    
    // Quando esconder o spinner, para o áudio se ainda estiver tocando
    return () => {
      stop()
    }
  }, [loadingNarration, play, stop])

  return (
    <div className={styles.spinnerContainer} role="alert" aria-busy="true">
      <div className={styles.characterHover}>
        {/* Usamos tamanho menor de TheoCharacter para o Spinner */}
        <TheoCharacter size={120} />
      </div>
      
      <div className={styles.loaderWrapper}>
        <div className={styles.orbitSpinner}></div>
        <div className={styles.planetSpinner}></div>
      </div>

      <p className={styles.spinnerText}>{label}</p>
    </div>
  )
}
