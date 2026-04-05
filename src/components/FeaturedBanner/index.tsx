import React from 'react'
import { Link } from 'react-router-dom'
import styles from './FeaturedBanner.module.css'

interface FeaturedBannerProps {
  title: React.ReactNode
  subtitle: string
  badgeText: string
  BadgeIcon: React.ElementType
  ctaText: string
  ctaPath: string
  secondaryText?: string
  onSecondaryClick?: () => void
  Art?: React.ElementType
  children?: React.ReactNode
}

export default function FeaturedBanner({
  title,
  subtitle,
  badgeText,
  BadgeIcon,
  ctaText,
  ctaPath,
  secondaryText,
  onSecondaryClick,
  Art,
  children
}: FeaturedBannerProps) {
  return (
    <section className={styles.banner}>
      <div className={styles.info}>
        <div className={styles.topInfo}>
          <div className={styles.badge}>
            <BadgeIcon size={14} /> 
            <span>{badgeText}</span>
          </div>
          {children}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>{subtitle}</p>
        
        <div className={styles.actions}>
          <Link to={ctaPath} className={styles.cta}>
             {ctaText} <div className={styles.ctaIcon}>✨</div>
          </Link>
          {secondaryText && (
            <button className={styles.secondary} onClick={onSecondaryClick}>
              {secondaryText}
            </button>
          )}
        </div>
      </div>
      
      {Art && (
        <div className={styles.art}>
          <Art />
        </div>
      )}
    </section>
  )
}
