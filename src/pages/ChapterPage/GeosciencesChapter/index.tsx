import { useParams } from 'react-router-dom'
import { getChapterById } from '@/data/chapters'
import EarthLayers from './EarthLayers'
import MineralExplorer from './MineralExplorer'
import SoilSimulator from './SoilSimulator'
import ErosionSimulator from './ErosionSimulator'
import TectonicSimulator from './TectonicSimulator'
import styles from './GeosciencesChapter.module.css'

export default function GeosciencesChapter() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const chapter = getChapterById(chapterId ?? '')

  if (!chapter) return null

  // Renderização condicional baseada no ID do capítulo
  const renderInteractive = () => {
    switch (chapter.id) {
      case 'estrutura-interna':
        return <EarthLayers />
      case 'rochas-minerais':
        return <MineralExplorer />
      case 'formacao-solo':
        return <SoilSimulator />
      case 'erosao-relevo':
        return <ErosionSimulator />
      case 'vulcoes-terremotos':
        return <TectonicSimulator />
      default:
        return (
          <div className={`${styles.placeholderCard} animate-scale-in`}>
            <div className={styles.construction}>Em Construção Interativa</div>
            <div className={styles.icon}>{chapter.icon}</div>
            <h2 className={styles.title}>{chapter.title}</h2>
            <p className={styles.description}>
              Théo está preparando uma aventura incrível sobre {chapter.title.toLowerCase()}! 
              Em breve você poderá interagir com modelos 3D e descobrir segredos da Terra.
            </p>
          </div>
        )
    }
  }

  return (
    <div className={styles.chapterContent}>
      {renderInteractive()}
    </div>
  )
}
