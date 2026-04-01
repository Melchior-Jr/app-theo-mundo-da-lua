import React, { useEffect, useState, useRef } from 'react'
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
  fieldOfView?: string
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
  exposure = 1,
  fieldOfView = "30deg"
}: PlanetViewer3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const viewerRef = useRef<any>(null)
  const onLoadRef = useRef(onLoad)

  // Sincroniza a ref com a prop para que handleLoad tenha acesso ao callback mais recente
  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  // Reset do loader ao trocar de planeta
  useEffect(() => {
    setIsLoaded(false)
  }, [modelSrc])

  useEffect(() => {
    const viewerNode = viewerRef.current
    if (!viewerNode) return

    const handleLoad = () => {
      // Pequeno delay para garantir que o model-viewer processou o carregamento interno
      requestAnimationFrame(() => {
        setIsLoaded(true)
        // Quando usamos reveal="manual", precisamos dispensar o poster explicitamente para mostrar o 3D
        if (viewerNode && typeof viewerNode.dismissPoster === 'function') {
          viewerNode.dismissPoster()
        }
        if (onLoadRef.current) onLoadRef.current()
      })
    }

    // Monitora o carregamento
    viewerNode.addEventListener('load', handleLoad)
    
    // Se o elemento já estiver pronto (cache), chama o handler manual
    if (viewerNode.loaded) {
      handleLoad()
    }

    return () => {
      viewerNode.removeEventListener('load', handleLoad)
    }
  }, [modelSrc]) // Depende de modelSrc porque o elemento pode mudar sua prontidão

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
          <TheoSpinner label={`Buscando segredos de ${alt}...`} silent={true} />
        </div>
      )}

      {/* 
          Google Model-Viewer 
          Usamos uma 'key' baseada no modelSrc para forçar a reconstrução do elemento 
          quando o planeta muda. Isso limpa estados residuais e garante que o evento 'load' 
          dispare de forma confiável para cada novo modelo.
      */}
      {React.createElement('model-viewer' as any, {
        key: modelSrc, // CHAVE CRÍTICA: Força reset completo do WebComponent
        ref: viewerRef,
        src: modelSrc,
        alt: alt,
        'auto-rotate': autoRotate,
        'auto-rotate-delay': "0",
        'interaction-prompt': "none",
        'disable-pan': true,
        'disable-zoom': true,
        'camera-controls': cameraControls,
        'camera-orbit': cameraOrbit,
        'min-phi': lockVertical ? "75deg" : undefined,
        'max-phi': lockVertical ? "75deg" : undefined,
        'rotation-per-second': rotationSpeed,
        'shadow-intensity': "0",
        exposure: String(exposure),
        'field-of-view': fieldOfView,
        loading: "eager",
        reveal: "auto", // Mudado para auto para maior compatibilidade, controlado pelo CSS opacity
        className: `${styles.viewer} ${isLoaded ? styles.reveal : ''}`,
        style: {
          '--poster-color': 'transparent',
          width: '100%',
          height: '100%',
          transform: tilt ? `rotateZ(${tilt}deg)` : 'none'
        } as React.CSSProperties
      })}
    </div>
  )
}
