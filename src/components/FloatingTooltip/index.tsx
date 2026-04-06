import React, { useRef } from 'react'
import KnowledgeShare from '@/components/KnowledgeShare'
import styles from './FloatingTooltip.module.css'

interface FloatingTooltipProps {
  isVisible: boolean
  title: string
  content: string
  x: number
  y: number
  onClose: () => void
  onNext?: () => void
  onPrev?: () => void
  currentIndex?: number
  totalItems?: number
  color?: string
  isHotspot?: boolean
}

export default function FloatingTooltip({ 
  isVisible, 
  title, 
  content, 
  x, 
  y, 
  onClose, 
  onNext, 
  onPrev,
  currentIndex = 0,
  totalItems = 1,
  color = '#FFD166',
  isHotspot = false
}: FloatingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  if (!isVisible) return null

  return (
    <div 
      className={`${styles.tooltipRoot} ${isHotspot ? styles.isHotspot : ''}`} 
      onClick={(e) => e.stopPropagation()}
      style={{ 
        left: isHotspot ? 'auto' : x, 
        top: isHotspot ? 'auto' : y, 
        '--accent-color': color 
      } as React.CSSProperties}
    >
      <div className={styles.tooltipContainer} ref={tooltipRef}>
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipIcon}>✨</span>
          <h4 className={styles.tooltipTitle}>{title}</h4>
          <div className={styles.headerActions} data-html2canvas-ignore>
            <KnowledgeShare 
              title={`Curiosidade Espacial: ${title}! ✨`}
              text={`Olha que legal isso que eu descobri: ${content}`}
              themeColor={color}
              size={18}
            />
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>
          </div>
        </div>
        <div className={styles.tooltipBody}>
          <p className={styles.tooltipText}>{content}</p>
        </div>

        {/* Footer estilo galeria */}
        {(onPrev || onNext) && (
          <footer className={styles.tooltipFooter}>
            <button 
              className={styles.navBtn} 
              onClick={onPrev}
              aria-label="Anterior"
            >
              ⟨
            </button>
            <span className={styles.navStatus}>{currentIndex + 1} de {totalItems}</span>
            <button 
              className={styles.navBtn} 
              onClick={onNext}
              aria-label="Próximo"
            >
              ⟩
            </button>
          </footer>
        )}
        
        <div className={styles.tooltipPointer} />
      </div>
    </div>
  )
}
