import SolarSystemOverview from './SolarSystemOverview'
import PlanetExplorer from './PlanetExplorer'
import styles from './SolarSystemChapter.module.css'

interface SolarSystemChapterProps {
  step: 'overview' | 'explorer'
}

export default function SolarSystemChapter({ step }: SolarSystemChapterProps) {
  return (
    <div className={styles.chapterContent}>
      {/* 
        A narração geral do capítulo é gerenciada pelo ChapterContainer pai 
        através do NarrationSequenceProvider.
      */}
      {step === 'overview' ? (
        <div className={`${styles.chapterStep} animate-fade-in`}>
          <SolarSystemOverview />
        </div>
      ) : (
        <div className={`${styles.chapterStep} animate-fade-in`}>
          <PlanetExplorer />
        </div>
      )}
    </div>
  )
}
