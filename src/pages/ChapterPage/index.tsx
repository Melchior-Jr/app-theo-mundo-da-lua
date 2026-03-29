import { useParams, useNavigate } from 'react-router-dom'
import StarField from '@/components/StarField'
import ChapterHeader from '@/components/ChapterHeader'
import ChapterContainer from '@/components/ChapterContainer'
import { getChapterById, getAdjacentChapters } from '@/data/chapters'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import SolarSystemChapter from './SolarSystemChapter'
import EarthMotionsChapter from './EarthMotionsChapter'
import ConstellationsChapter from './ConstellationsChapter'
import MoonPhasesChapter from './MoonPhasesChapter'
import styles from './ChapterPage.module.css'

/**
 * ChapterPage — página base para cada capítulo educativo.
 * Recebe o ID via URL e renderiza o conteúdo correspondente.
 * Conteúdo interativo específico será adicionado como children via rotas filhas.
 */
export default function ChapterPage() {
  const { chapterId, subStep: urlSubStep } = useParams<{ chapterId: string; subStep?: string }>()
  const navigate = useNavigate()

  const chapter = getChapterById(chapterId ?? '')
  const { previous, next } = chapter
    ? getAdjacentChapters(chapter.id)
    : { previous: null, next: null }

  // Detecta o sub-passo atual (etapa internal de capítulo) baseada na URL
  const subStep = (urlSubStep as 'overview' | 'explorer') || 'overview'

  const { 
    viewedPlanets, 
    skipAttempts, 
    setSkipAttempts,
    setNextButtonEffect,
    setActiveNarration,
    setOnNarrationFinish 
  } = useNarrationSequence()

  const handlePrevious = () => {
    if (chapterId === 'sistema-solar' && subStep === 'explorer') {
      navigate(`/capitulos/sistema-solar/overview`)
      return
    }

    // Especial: Do Capítulo 2 voltar para o Explorador do Capítulo 1 (em Netuno)
    if (chapterId === 'movimentos-da-terra') {
      navigate(`/capitulos/sistema-solar/explorer?planet=netuno`)
      return
    }

    if (previous) navigate(previous.path)
  }

  const handleNext = () => {
    if (chapterId === 'sistema-solar' && subStep === 'overview') {
      navigate(`/capitulos/sistema-solar/explorer`)
      return
    }

    // Validação para o Explorador do Sistema Solar
    if (chapterId === 'sistema-solar' && subStep === 'explorer') {
      const allPlanetsSeen = viewedPlanets.length >= 8

      if (!allPlanetsSeen) {
        if (skipAttempts === 0) {
          // Usa o sistema global de narração do Théo para o Alerta 1
          const alert1 = getNarrationById('alert-planets-1')
          if (alert1) {
            setActiveNarration(alert1)
          }
          
          setSkipAttempts(1)
          setNextButtonEffect(true)
          
          // Remove o efeito visual após 1 segundo
          setTimeout(() => setNextButtonEffect(false), 1000)
          return
        } else {
          // Segunda tentativa: Théo fala o alerta 2 e então avança
          const alert2 = getNarrationById('alert-planets-2')
          
          if (alert2) {
            // Quando a narração do alerta terminar, navega
            setOnNarrationFinish(() => () => {
              if (next) navigate(next.path)
            })
            setActiveNarration(alert2)
          } else {
            // Fallback
            if (next) navigate(next.path)
          }

          return // Bloqueia navegação imediata
        }
      }
    }

    if (next) navigate(next.path)
  }

  // Capítulo não encontrado
  if (!chapter) {
    return (
      <div className={styles.notFound}>
        <StarField />
        <div className={styles.notFoundContent}>
          <span className={styles.notFoundIcon} role="img" aria-label="Rosto de Théo surpreso">😮</span>
          <h1 className={styles.notFoundTitle}>Capítulo não encontrado</h1>
          <p className={styles.notFoundText}>
            Parece que Théo se perdeu no espaço! Este capítulo não existe.
          </p>
          <button
            className={styles.notFoundButton}
            onClick={() => navigate('/capitulos')}
            id="btn-back-from-not-found"
          >
            ← Voltar para os capítulos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={styles.page}
      style={{
        '--chapter-color': chapter.color,
        '--chapter-color-bg': chapter.colorBg,
      } as React.CSSProperties}
    >
      <StarField />

      {/* Brilho temático sutil no fundo */}
      <div className={styles.themeGlow} aria-hidden="true" />

      {/* Header fixo com título e progresso */}
      <ChapterHeader
        chapter={chapter}
        currentStep={chapter.order}
        totalSteps={4}
      />

      {/* Conteúdo do capítulo */}
      <ChapterContainer
        chapter={chapter}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={(chapter.id === 'sistema-solar' && subStep !== 'overview') || !!previous}
        hasNext={(chapter.id === 'sistema-solar' && subStep === 'overview') || !!next}
        disableNarration={subStep !== 'overview'}
        hideFunFact={subStep !== 'overview' || chapter.id === 'movimentos-da-terra'}
      >
        {/* Roteadores internos de capítulo (renderiza o conteúdo específico) */}
        {chapter.id === 'sistema-solar' ? (
          <SolarSystemChapter step={subStep} />
        ) : chapter.id === 'movimentos-da-terra' ? (
          <EarthMotionsChapter />
        ) : chapter.id === 'constelaçoes' ? (
          <ConstellationsChapter />
        ) : chapter.id === 'fases-da-lua' ? (
          <MoonPhasesChapter />
        ) : (
          /* Redundância para capítulos não mapeados */
          <ChapterPlaceholder chapter={chapter} />
        )}
      </ChapterContainer>
    </div>
  )
}

/* ---------- Placeholder interno ---------- */
interface PlaceholderProps {
  chapter: ReturnType<typeof getChapterById>
}

function ChapterPlaceholder({ chapter }: PlaceholderProps) {
  if (!chapter) return null

  const placeholders: Record<string, { emoji: string; label: string }> = {
    'sistema-solar': { emoji: '🪐', label: 'Mapa interativo dos planetas' },
    'movimentos-da-terra': { emoji: '🌍', label: 'Animação de rotação e translação' },
    'constelaçoes': { emoji: '⭐', label: 'Mapa do céu noturno interativo' },
    'fases-da-lua': { emoji: '🌕', label: 'Ciclo lunar interativo' },
  }

  const ph = placeholders[chapter.id] ?? { emoji: '🔭', label: 'Conteúdo interativo' }

  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderEmoji} aria-hidden="true">{ph.emoji}</span>
      <p className={styles.placeholderLabel}>{ph.label}</p>
      <p className={styles.placeholderHint}>
        Conteúdo interativo sendo preparado por Théo... 🚀
      </p>
    </div>
  )
}
