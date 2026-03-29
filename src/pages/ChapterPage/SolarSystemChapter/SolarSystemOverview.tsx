import React, { useState, useEffect } from 'react'
import '@google/model-viewer'
import styles from './SolarSystemOverview.module.css'

export default function SolarSystemOverview() {
  const [currentModel, setCurrentModel] = useState<'Small' | 'large'>('Small')
  const [isLargeLoaded, setIsLargeLoaded] = useState(false)
  const [useAdaptiveLoading, setUseAdaptiveLoading] = useState(true)

  useEffect(() => {
    // Detecta qualidade da conexão se disponível
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (conn) {
      const isSlow = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g' || conn.saveData
      
      if (!isSlow) {
         // Se a internet for boa, tentamos carregar o Large gradualmente
         setUseAdaptiveLoading(true)
      } else {
         // Se for lenta, ficamos apenas no Small
         setUseAdaptiveLoading(false)
      }
    }
  }, [])

  const handleLargeLoad = () => {
    setIsLargeLoaded(true)
    // Pequeno delay para garantir que a renderização do Large começou antes de remover o Small
    setTimeout(() => {
      setCurrentModel('large')
    }, 500)
  }

  return (
    <div className={styles.overview}>
      {/* Camada 1: Versão Leve (Exibida primeiro) */}
      {currentModel === 'Small' && (
        React.createElement('model-viewer' as any, {
          src: "/3D Model/solar_system_animation_Small.glb",
          alt: "Sistema Solar",
          'auto-rotate': true,
          'camera-controls': true,
          autoplay: true,
          'shadow-intensity': "1",
          'environment-image': "neutral",
          exposure: "1.2",
          'interaction-prompt': "auto",
          'camera-orbit': "0deg 75deg 20%",
          'field-of-view': "30deg",
          className: styles.viewer,
          style: { 
            width: '100%', 
            height: '100%', 
            display: 'block',
            opacity: isLargeLoaded ? 0 : 1, 
            transition: 'opacity 1s ease' 
          }
        }, (
          <div className={styles.loader} slot="poster">
             <div className={styles.loaderSpinner} />
             <span>Explorando...</span>
          </div>
        ))
      )}

      {/* Camada 2: Versão HD (Carregada em background se a net for boa) */}
      {useAdaptiveLoading && (
        React.createElement('model-viewer' as any, {
          src: "/3D Model/solar_system_animation_large.glb",
          alt: "Sistema Solar",
          'auto-rotate': true,
          'camera-controls': true,
          autoplay: true,
          'shadow-intensity': "1",
          'environment-image': "neutral",
          exposure: "1.2",
          'interaction-prompt': "auto",
          'camera-orbit': "0deg 75deg 20%",
          'field-of-view': "30deg",
          className: styles.viewer,
          onLoad: handleLargeLoad,
          style: { 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'block',
            opacity: isLargeLoaded ? 1 : 0, 
            pointerEvents: isLargeLoaded ? 'auto' : 'none',
            transition: 'opacity 1s ease'
          }
        })
      )}
    </div>
  )
}
