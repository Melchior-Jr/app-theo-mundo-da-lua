import { Link } from 'react-router-dom'
import type { Chapter } from '@/data/chapters'
import styles from './ChapterHeader.module.css'

interface ChapterHeaderProps {
  chapter: Chapter
  currentStep?: number
  totalSteps?: number
}

/**
 * ChapterHeader — cabeçalho fixo do capítulo com:
 * - Botão voltar para seleção
 * - Título + ícone com cor temática
 * - Indicador de progresso orbital
 */
export default function ChapterHeader({
  chapter,
  currentStep = 1,
  totalSteps = 1,
}: ChapterHeaderProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  const circumference = 2 * Math.PI * 20   // raio 20 do círculo SVG

  return (
    <header
      className={styles.header}
      style={{
        '--chapter-color': chapter.color,
        '--chapter-color-bg': chapter.colorBg,
      } as React.CSSProperties}
    >
      {/* Barra de cor temática na base do header */}
      <div className={styles.colorLine} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Voltar */}
        <Link
          to="/capitulos"
          className={styles.backButton}
          aria-label="Voltar para a lista de capítulos"
          id="btn-back-to-chapters"
        >
          <span className={styles.backArrow} aria-hidden="true">←</span>
          <span className={styles.backText}>Capítulos</span>
        </Link>

        {/* Título central */}
        <div className={styles.titleGroup}>
          <span className={styles.chapterIcon} aria-hidden="true">{chapter.icon}</span>
          <div className={styles.titleStack}>
            <span className={styles.chapterOrder}>{chapter.subtitle}</span>
            <h1 className={styles.chapterTitle}>{chapter.title}</h1>
          </div>
        </div>

        {/* Indicador de progresso circular */}
        <div
          className={styles.progressOrb}
          aria-label={`Progresso: ${currentStep} de ${totalSteps}`}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        >
          <svg viewBox="0 0 48 48" width="48" height="48" className={styles.progressSvg}>
            {/* Trilha */}
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            {/* Progresso */}
            <circle
              cx="24" cy="24" r="20"
              fill="none"
              stroke={chapter.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              transform="rotate(-90 24 24)"
              style={{ transition: 'stroke-dashoffset 600ms ease' }}
            />
          </svg>
          <span className={styles.progressText} aria-hidden="true">
            {currentStep}/{totalSteps}
          </span>
        </div>
      </div>
    </header>
  )
}
