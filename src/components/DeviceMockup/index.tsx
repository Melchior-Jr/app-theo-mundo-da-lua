import styles from './DeviceMockup.module.css'

export default function DeviceMockup() {
  return (
    <div className={styles.container}>
      {/* Laptop / Desktop Mockup Frame (Glassmorphism) */}
      <div className={styles.desktopFrame} data-tilt>
        <div className={styles.screen}>
          <img src="/images/missions_preview.png" alt="Théo Interface" className={styles.screenImage} />
        </div>
        <div className={styles.bezel} />
        <div className={styles.monitorStand} />
        <div className={styles.monitorBase} />
      </div>

      {/* Mobile Mockup Frame (iPhone style) */}
      <div className={styles.mobileFrame} data-tilt>
        <div className={styles.notch} />
        <div className={styles.mobileScreen}>
          <img src="/images/games_preview_02.png" alt="Théo Mobile Interface" className={styles.screenImage} />
        </div>
      </div>
    </div>
  )
}
