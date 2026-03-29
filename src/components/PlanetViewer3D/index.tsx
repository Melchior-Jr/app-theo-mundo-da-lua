import { useEffect, useState, useRef } from 'react'
import '@google/model-viewer'
import TheoSpinner from '@/components/TheoSpinner'
import styles from './PlanetViewer3D.module.css'

interface PlanetViewer3DProps {
  modelSrc: string
  alt: string
  color: string
  onLoad?: () => void
}

export default function PlanetViewer3D({ modelSrc, alt, color, onLoad }: PlanetViewer3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    // Escuta evento nativo de load do model-viewer
    const viewerNode = viewerRef.current
    if (!viewerNode) return

    const handleLoad = () => {
      setIsLoaded(true)
      if (onLoad) onLoad()
    }
    viewerNode.addEventListener('load', handleLoad)

    // Se estiver recarregando uma nova string
    setIsLoaded(false)

    return () => {
      viewerNode.removeEventListener('load', handleLoad)
    }
  }, [modelSrc])

  return (
    <div className={styles.viewerWrapper}>
      {/* Fallback de Carregamento enquanto o 3D/GLB é baixado */}
      {!isLoaded && (
        <div className={styles.spinnerOverlay} style={{ '--chapter-color': color } as React.CSSProperties}>
          <TheoSpinner label={`Puxando ${alt} com força gravitacional...`} />
        </div>
      )}

      {/* 
        Google Model-Viewer 
        Usado para visualização 3D. Sistema de Realidade Aumentada removido a pedido do usuário.
      */}
      <model-viewer
        ref={viewerRef}
        src={modelSrc}
        alt={alt}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        exposure="1"
        className={styles.viewer}
        style={{
          '--poster-color': 'transparent',
          width: '100%',
          height: '100%',
        } as React.CSSProperties}
      />
    </div>
  )
}
