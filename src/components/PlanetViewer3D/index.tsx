import { useEffect, useState, useRef } from 'react'
import '@google/model-viewer'
import TheoSpinner from '@/components/TheoSpinner'
import styles from './PlanetViewer3D.module.css'

interface PlanetViewer3DProps {
  modelSrc: string
  alt: string
  color: string
  onLoad?: () => void
  autoRotate?: boolean
  cameraControls?: boolean
  cameraOrbit?: string
  tilt?: number
  lockVertical?: boolean
  rotationSpeed?: string
  exposure?: number
}

export default function PlanetViewer3D({ 
  modelSrc, 
  alt, 
  color, 
  onLoad,
  autoRotate = true,
  cameraControls = true,
  cameraOrbit,
  tilt = 0,
  lockVertical = false,
  rotationSpeed = "9deg",
  exposure = 1
}: PlanetViewer3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    const viewerNode = viewerRef.current
    if (!viewerNode) return

    const handleLoad = () => {
      setIsLoaded(true)
      if (onLoad) onLoad()
    }

    // Se já estiver carregado (cache), dispara imediatamente
    if (viewerNode.loaded) {
      handleLoad()
    } else {
      viewerNode.addEventListener('load', handleLoad)
    }

    return () => {
      viewerNode.removeEventListener('load', handleLoad)
    }
  }, [modelSrc, onLoad])

  // Efeito para garantir que a velocidade de rotação mude dinamicamente
  useEffect(() => {
    if (viewerRef.current) {
      // @ts-ignore - model-viewer properties are not all in types
      viewerRef.current.rotationPerSecond = rotationSpeed
    }
  }, [rotationSpeed])

  return (
    <div className={styles.viewerWrapper}>
      {/* Fallback de Carregamento enquanto o 3D/GLB é baixado */}
      {!isLoaded && (
        <div className={styles.spinnerOverlay} style={{ '--chapter-color': color } as React.CSSProperties}>
          <TheoSpinner label={`Puxando ${alt} com força gravitacional...`} silent={true} />
        </div>
      )}

      {/* 
        Google Model-Viewer 
        Usado para visualização 3D. Sistema de Realidade Aumentada removido a pedido do usuário.
      */}
      <model-viewer
        key={modelSrc}
        ref={viewerRef}
        src={modelSrc}
        alt={alt}
        auto-rotate={autoRotate}
        auto-rotate-delay="0"
        interaction-prompt="none"
        disable-pan
        disable-zoom
        camera-controls={cameraControls}
        camera-orbit={cameraOrbit}
        min-phi={lockVertical ? "75deg" : undefined}
        max-phi={lockVertical ? "75deg" : undefined}
        rotation-per-second={rotationSpeed}
        shadow-intensity="0"
        exposure={String(exposure)}
        className={styles.viewer}
        style={{
          '--poster-color': 'transparent',
          width: '100%',
          height: '100%',
          transform: tilt ? `rotateZ(${tilt}deg)` : 'none'
        } as React.CSSProperties}
      />
    </div>
  )
}
