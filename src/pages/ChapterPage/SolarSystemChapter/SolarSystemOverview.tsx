import React, { useState, useEffect, useRef } from 'react'
import '@google/model-viewer'
import { getPlanetById, planets } from '@/data/planets'
import FloatingTooltip from '@/components/FloatingTooltip'
import styles from './SolarSystemOverview.module.css'

export default function SolarSystemOverview() {
  const [currentModel, setCurrentModel] = useState<'Small' | 'large'>('Small')
  const [isLargeLoaded, setIsLargeLoaded] = useState(false)
  const [useAdaptiveLoading, setUseAdaptiveLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; planetId: string; surfaceId?: string | null } | null>(null)
  const viewerRef = useRef<any>(null)
  const smallViewerRef = useRef<any>(null)

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

  const handleViewerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const viewer = currentModel === 'large' ? viewerRef.current : smallViewerRef.current
    if (!viewer) return

    // Tenta identificar o que foi clicado usando o material
    const material = viewer.materialFromPoint(e.clientX, e.clientY)
    
    if (material) {
      const matName = material.name.toLowerCase()
      
      // Mapeamento de nomes do GLB para IDs do sistema
      const materialMap: Record<string, string> = {
        'mercury': 'mercurio',
        'venus': 'venus',
        'earth': 'terra',
        'mars': 'marte',
        'jupiter': 'jupiter',
        'saturn': 'saturno',
        'uranus': 'urano',
        'neptune': 'netuno',
        'moon': 'terra' // Linka a lua à terra para fins de tooltip
      }

      const rect = viewer.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const surfaceId = viewer.surfaceFromPoint(x, y)
      const planetId = materialMap[matName]

      if (planetId) {
        // Se já está aberta sobre o mesmo planeta, fecha (comportamento de toggle)
        if (tooltip && tooltip.planetId === planetId) {
          setTooltip(null)
          return
        }

        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          planetId,
          surfaceId
        })
      } else {
        setTooltip(null)
      }
    } else {
      setTooltip(null)
    }
  }

  const navigateToPlanet = (direction: -1 | 1) => {
    if (!tooltip) return
    const currentIndex = planets.findIndex(p => p.id === tooltip.planetId)
    const nextIndex = (currentIndex + direction + planets.length) % planets.length
    const nextPlanet = planets[nextIndex]
    
    setTooltip(prev => prev ? {
      ...prev,
      planetId: nextPlanet.id,
      surfaceId: null // Remove ancoragem ao navegar via setas
    } : null)
  }

  const selectedPlanet = tooltip ? getPlanetById(tooltip.planetId) : null

  // Define o zoom e distância baseada no planeta para "focar"
  const getCameraView = () => {
    if (!selectedPlanet) return { orbit: "0deg 75deg 20%", fov: "30deg" }
    
    // Configurações específicas para cada planeta
    const config: Record<string, { orbit: string; fov: string }> = {
      mercurio: { orbit: "0deg 80deg 5%", fov: "5deg" },
      venus: { orbit: "0deg 80deg 7%", fov: "6deg" },
      terra: { orbit: "0deg 80deg 9%", fov: "6deg" },
      marte: { orbit: "0deg 80deg 11%", fov: "7deg" },
      jupiter: { orbit: "0deg 80deg 16%", fov: "8deg" },
      saturno: { orbit: "0deg 80deg 22%", fov: "10deg" },
      urano: { orbit: "0deg 80deg 28%", fov: "10deg" },
      netuno: { orbit: "0deg 80deg 35%", fov: "12deg" },
    }

    return config[selectedPlanet.id] || { orbit: "0deg 75deg 20%", fov: "30deg" }
  }

  // Se estivermos em um planeta individual, usamos valores de zoom focados no centro
  const focusedOrbit = "0deg 75deg 105%" // 105% do raio do planeta
  const focusedFov = "35deg" // Campo de visão ideal para planetas individuais

  const { orbit, fov } = getCameraView()

  return (
    <div className={styles.overview} onClick={() => setTooltip(null)}>
      {/* Camada 1: Versão Leve (Exibida primeiro) - Sempre foca no planeta selecionado se houver um */}
      {currentModel === 'Small' && (
        React.createElement('model-viewer' as any, {
          ref: smallViewerRef,
          src: selectedPlanet ? selectedPlanet.modelPath : "/3D Model/solar_system_animation_Small.glb",
          alt: selectedPlanet ? selectedPlanet.name : "Sistema Solar",
          'auto-rotate': !tooltip,
          'camera-controls': true,
          autoplay: !tooltip,
          'shadow-intensity': "1",
          'environment-image': "neutral",
          exposure: "1.2",
          'interaction-prompt': "auto",
          'camera-orbit': selectedPlanet ? focusedOrbit : orbit,
          'field-of-view': selectedPlanet ? focusedFov : fov,
          className: styles.viewer,
          onClick: handleViewerClick,
          style: { 
            width: '100%', 
            height: '100%', 
            display: 'block',
            opacity: (isLargeLoaded && !selectedPlanet) ? 0 : 1, 
            transition: 'opacity 1s ease' 
          }
        }, (
          <div className={styles.loader} slot="poster">
             <div className={styles.loaderSpinner} />
             <span>Explorando...</span>
          </div>
        ))
      )}

      {/* Camada 2: Versão HD (Somente para a visão geral) */}
      {useAdaptiveLoading && !selectedPlanet && (
        React.createElement('model-viewer' as any, {
          ref: viewerRef,
          src: "/3D Model/solar_system_animation_large.glb",
          alt: "Sistema Solar",
          'auto-rotate': true,
          'camera-controls': true,
          autoplay: true,
          'shadow-intensity': "1",
          'environment-image': "neutral",
          exposure: "1.2",
          'interaction-prompt': "auto",
          'camera-orbit': orbit,
          'field-of-view': fov,
          className: styles.viewer,
          onLoad: handleLargeLoad,
          onClick: handleViewerClick,
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

      {/* Tooltip Centralizada (Modo de Foco) */}
      {tooltip && selectedPlanet && (
        <FloatingTooltip 
          isVisible={tooltip.visible}
          x={window.innerWidth / 2} 
          y={window.innerHeight / 2}
          title={selectedPlanet.name}
          content={selectedPlanet.funFact}
          onClose={() => setTooltip(null)}
          onNext={() => navigateToPlanet(1)}
          onPrev={() => navigateToPlanet(-1)}
          currentIndex={planets.findIndex(p => p.id === selectedPlanet.id)}
          totalItems={planets.length}
          color={selectedPlanet.color}
        />
      )}
    </div>
  )
}
