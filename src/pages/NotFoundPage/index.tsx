import { Link } from 'react-router-dom'
import StarField from '@/components/StarField'
import styles from './NotFoundPage.module.css'

/**
 * NotFoundPage — página 404 com tema espacial.
 */
export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <StarField />
      <div className={styles.content}>
        <span className={styles.emoji} role="img" aria-label="planetas">🌌</span>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Oops! Esta parte do universo ainda não foi explorada...</p>
        <Link to="/" className={styles.link}>
          🚀 Voltar para o início
        </Link>
      </div>
    </div>
  )
}
