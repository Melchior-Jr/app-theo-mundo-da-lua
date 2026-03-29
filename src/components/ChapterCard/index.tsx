import { useNavigate } from 'react-router-dom'
import type { Chapter } from '@/data/chapters'
import styles from './ChapterCard.module.css'

interface ChapterCardProps {
  chapter: Chapter
  featured?: boolean
  animationDelay?: number
  isLocked?: boolean // Prop para indicar se o capítulo está em desenvolvimento
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
}: ChapterCardProps) {
  const navigate = useNavigate()

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ''} ${isLocked ? styles.locked : ''} opacity-0 animate-slide-up`}
      style={{
        animationDelay: `${animationDelay}ms`,
        '--chapter-color': chapter.color,
        '--chapter-color-dim': chapter.colorDim,
        '--chapter-color-bg': chapter.colorBg,
      } as React.CSSProperties}
      onClick={() => navigate(chapter.path)}
      role="button"
      tabIndex={0}
      aria-label={`Ir para ${chapter.title}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(chapter.path)}
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
          <span className={styles.order}>{chapter.subtitle}</span>
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
          <span className={styles.ctaText}>{isLocked ? 'Ver projeto' : 'Explorar'}</span>
          <span className={styles.ctaArrow}>→</span>
        </div>

        {/* Planeta decorativo de fundo */}
        <div className={styles.decorativePlanet} aria-hidden="true" />
      </div>
    </article>
  )
}
