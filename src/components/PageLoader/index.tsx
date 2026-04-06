import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.loaderContainer}>
      {/* Background & HUD (Mesmo estilo do SplashLoader) */}
      <div className={styles.gridOverlay} />

      <div className={styles.starField}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.star} style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          } as React.CSSProperties} />
        ))}
      </div>

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
