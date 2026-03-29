import { useNavigate, useLocation } from 'react-router-dom'
import { ReactNode, useEffect } from 'react'
import type { Chapter } from '@/data/chapters'
import { getNarrationByChapter } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import styles from './ChapterContainer.module.css'

interface ChapterContainerProps {
  chapter: Chapter
  children: ReactNode
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  disableNarration?: boolean
  hideFunFact?: boolean
}

/**
 * ChapterContainer — envolve o conteúdo de cada capítulo.
 * Fornece:
 * - Área de introdução com Théo Guia e Fun Fact
 * - Slot de conteúdo interativo (children)
 * - Barra de ações: anterior, próximo
 */
export default function ChapterContainer({
  chapter,
  children,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  disableNarration = false,
  hideFunFact = false,
}: ChapterContainerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { 
    canStartLocal, 
    setCanStartLocal, 
    setActiveNarration, 
    setThemeColor,
    setOnNarrationFinish,
    setFunFact,
    narrationPhase,
    setNarrationPhase,
    isCuriosityPlaying,
    setIsCuriosityPlaying,
    nextButtonEffect
  } = useNarrationSequence()

  const narration = getNarrationByChapter(chapter.id as any)

  const handleIntroFinish = () => {
    // Libera o modo local (Rotação/Translação) após a introdução terminar
    setCanStartLocal(true)
  }

  const handleCuriosityClick = () => {
    // Pedido explícito do usuário: "se Clicar na Lampada volta para a reprodução do audio principal"
    if (chapter.id === 'constelaçoes' || chapter.id === 'fases-da-lua') {
       if (narration) {
         setActiveNarration(narration)
         if (chapter.id === 'constelaçoes') {
           setCanStartLocal(false) // Retorna ao modo de introdução do capítulo
         }
       }
       return
    }

    if (narrationPhase === 'curiosity' && isCuriosityPlaying) {
      setIsCuriosityPlaying(false)
      setNarrationPhase('main')
    } else {
      setNarrationPhase('curiosity')
      setIsCuriosityPlaying(true)
    }
  }

  // Atualiza o Théo Global
  useEffect(() => {
    // Só define a narração do capítulo se não estiver silenciado
    if (narration && !canStartLocal && !disableNarration) {
      setActiveNarration(narration)
      setThemeColor(chapter.color)
      // BUG FIX: setOnNarrationFinish recebe uma função.
      // React interpreta funções em setState como updaters (fn(prevState)).
      // Para ARMAZENAR a função em vez de execútá-la, envolva em () => fn.
      setOnNarrationFinish(() => handleIntroFinish)
      
      // No Capítulo 2, 3 e 4 não queremos que a Dica do Théo (funFact) interfira na transição automática
      if (chapter.id !== 'movimentos-da-terra' && chapter.id !== 'constelaçoes' && chapter.id !== 'fases-da-lua') {
        setFunFact(chapter.funFact)
      } else {
        setFunFact(null)
      }
    }
  }, [narration, canStartLocal, disableNarration, setActiveNarration, setThemeColor, setOnNarrationFinish, setFunFact, chapter.color, chapter.funFact, location.pathname])

  return (
    <div
      className={styles.container}
      style={{
        '--chapter-color': chapter.color,
        '--chapter-color-dim': chapter.colorDim,
        '--chapter-color-bg': chapter.colorBg,
      } as React.CSSProperties}
    >
      {/* O Théo agora fala através do player flutuante global via AppShell */}

      {/* Área de conteúdo interativo — slot para cada capítulo */}
      <section
        className={`${styles.contentArea} opacity-0 animate-fade-in delay-300`}
        aria-label={`Conteúdo interativo: ${chapter.title}`}
      >
        {/* Botão de Lâmpada (Curiosidade) - Agora no Container do Conteúdo */}
        {chapter.funFact && !hideFunFact && (
          <button
            className={`${styles.bulbBtn} ${isCuriosityPlaying ? styles.bulbActive : ''}`}
            onClick={handleCuriosityClick}
            aria-label="Ouvir curiosidade do capítulo"
            title="Ouvir curiosidade"
          >
            <span className={styles.bulbIcon}>💡</span>
            <div className={styles.bulbGlow} />
          </button>
        )}

        {children}
      </section>

      {/* Barra de navegação e narração */}
      <nav
        className={styles.actionBar}
        aria-label="Navegação do capítulo"
      >
        {/* Botão: Anterior */}
        <button
          id={`btn-prev-${chapter.id}`}
          className={`${styles.navButton} ${styles.prevButton} ${styles.actionFill}`}
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Capítulo anterior"
        >
          <span aria-hidden="true">←</span>
          <span>Anterior</span>
        </button>

        {/* Botão: Próximo ou Opções de Finalização */}
        {!hasNext ? (
          <div className={styles.finalButtons}>
            <button
              id="btn-go-quiz"
              className={`${styles.navButton} ${styles.quizButton}`}
              onClick={() => navigate('/quiz')}
              aria-label="Ir para o Quiz final"
            >
              <span>Fazer Quiz!</span>
              <span aria-hidden="true">📝</span>
            </button>
            <button
              id="btn-go-menu"
              className={`${styles.navButton} ${styles.menuButton}`}
              onClick={() => navigate('/capitulos')}
              aria-label="Voltar ao menu principal"
            >
              <span>Menu Principal</span>
              <span aria-hidden="true">🏠</span>
            </button>
          </div>
        ) : (
          <button
            id={`btn-next-${chapter.id}`}
            className={`${styles.navButton} ${styles.nextButton} ${styles.actionFill} ${nextButtonEffect ? styles.skipAlert : ''}`}
            onClick={onNext}
            aria-label="Próximo capítulo"
          >
            <span>Próximo</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </nav>
    </div>
  )
}
