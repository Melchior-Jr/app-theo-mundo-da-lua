import StarField from '@/components/StarField'
import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.loaderContainer}>
      {/* Fundo padrão da aplicação */}
      <StarField />

      <div className={styles.content}>
        <div className={styles.rocketWrapper}>
          <div className={styles.rocketGlow}></div>
          <div className={styles.rocket}>🚀</div>
        </div>

        <div className={styles.textWrapper}>
          <h2 className={styles.loadingText}>Decolando...</h2>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
          <p className={styles.subText}>Ajustando Rota Espacial</p>
        </div>
      </div>
    </div>
  )
}
