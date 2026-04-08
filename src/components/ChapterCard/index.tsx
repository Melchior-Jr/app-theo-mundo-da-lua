import { useNavigate } from 'react-router-dom'
import { useSound } from '@/context/SoundContext'
import type { Chapter } from '@/data/chapters'
import styles from './ChapterCard.module.css'

interface ChapterCardProps {
  chapter: Chapter
  featured?: boolean
  animationDelay?: number
  isLocked?: boolean
  isCompleted?: boolean
  xpEarned?: number
  xpTotal?: number
  onClick?: (e: React.MouseEvent) => void
  onXPClick?: (e: React.MouseEvent) => void
}

/**
 * ChapterCard — card de seleção de capítulo.
 * O card "featured" (primeiro) recebe um layout expandido.
 */
export default function ChapterCard({
  chapter,
  featured = false,
  animationDelay = 0,
  isLocked = false,
  isCompleted = false,
  xpEarned,
  xpTotal,
  onClick,
  onXPClick,
}: ChapterCardProps) {
  const navigate = useNavigate()
  const { playSFX } = useSound()

  const handleAction = (e: React.MouseEvent | React.KeyboardEvent) => {
    playSFX('click')
    if ('button' in e && onClick) {
      onClick(e as React.MouseEvent)
      if (e.defaultPrevented) return
    }
    navigate(chapter.path)
  }

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ''} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''} opacity-0 animate-slide-up`}
      style={{
        animationDelay: `${animationDelay}ms`,
        '--chapter-color': chapter.color,
        '--chapter-color-dim': chapter.colorDim,
        '--chapter-color-bg': chapter.colorBg,
      } as React.CSSProperties}
      onClick={handleAction}
      role="button"
      tabIndex={0}
      aria-label={`Ir para ${chapter.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleAction(e)}
      id={`chapter-card-${chapter.id}`}
    >
      {/* Selo de Bloqueado */}
      {isLocked && (
        <div className={styles.lockedBadge}>
          <span className={styles.lockedIcon}>🕒</span>
          <span>EM BREVE</span>
        </div>
      )}

      {/* Linha de cor lateral */}
      <div className={styles.colorBar} aria-hidden="true" />

      {/* Conteúdo do card */}
      <div className={styles.inner}>
        {/* Ícone + ordem */}
        <div className={styles.topRow}>
          <span className={styles.icon} aria-hidden="true">{chapter.icon}</span>
          <span className={`${styles.order} ${isCompleted ? styles.orderCompleted : ''}`}>
            {isCompleted && <span className={styles.check}>✅</span>}
            {chapter.subtitle}
            {isCompleted && <span className={styles.statusText}> • CONCLUÍDO</span>}
          </span>
        </div>

        {/* Textos */}
        <div className={styles.body}>
          <h2 className={styles.title}>{chapter.title}</h2>
          {featured && (
            <p className={styles.description}>{chapter.description}</p>
          )}
        </div>

        {/* CTA */}
        <div className={styles.cta} aria-hidden="true">
          <div 
            className={styles.rewards} 
            onClick={(e) => {
              e.stopPropagation();
              onXPClick?.(e);
            }}
            title="Ver missões deste capítulo"
          >
            <span className={styles.star}>⭐</span>
            <span className={styles.xpText}>
              <span className={styles.xpGained}>{xpEarned ?? 0}</span>
              <span className={styles.xpSeparator}>/</span>
              <span className={styles.xpAvailable}>{xpTotal ?? 0} XP</span>
            </span>
          </div>
          <div className={styles.ctaButton}>
            <span className={styles.ctaText}>
              {isLocked ? 'Ver projeto' : (isCompleted ? 'Rever Missão' : 'Explorar')}
            </span>
            <span className={styles.ctaArrow}>→</span>
          </div>
        </div>

        {/* Planeta decorativo de fundo */}
        <div className={styles.decorativePlanet} aria-hidden="true" />
      </div>
    </article>
  )
}
