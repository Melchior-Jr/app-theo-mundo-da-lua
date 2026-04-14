import React, { useState, useEffect, useRef } from 'react'
import '@google/model-viewer'
import { getPlanetById, planets } from '@/data/planets'
import FloatingTooltip from '@/components/FloatingTooltip'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { getNarrationById } from '@/data/narration'
import styles from './SolarSystemOverview.module.css'

export default function SolarSystemOverview() {
  const [currentModel, setCurrentModel] = useState<'Small' | 'large'>('Small')
  const [isLargeLoaded, setIsLargeLoaded] = useState(false)
  const [useAdaptiveLoading, setUseAdaptiveLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; planetId: string; surfaceId?: string | null } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const viewerRef = useRef<any>(null)
  const smallViewerRef = useRef<any>(null)
  const { setActiveNarration } = useNarrationSequence()

  useEffect(() => {
    const intro = getNarrationById('chapter-1')
    if (intro) setActiveNarration(intro)
  }, [setActiveNarration])

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

  const { orbit: focusedOrbit, fov: focusedFov } = getCameraView()
  const defaultOrbit = "0deg 75deg 14%"
  const defaultFov = "25deg"

  // Efeito para monitorar o carregamento dos modelos
  useEffect(() => {
    const viewerNode = currentModel === 'large' ? viewerRef.current : smallViewerRef.current;
    if (!viewerNode) return;

    const handleLoadEvent = () => {
      console.log(`[3D] Modelo ${currentModel} carregado.`);
      setIsLoaded(true);
    };

    viewerNode.addEventListener('load', handleLoadEvent);
    
    // Fallback: Se não carregar em 5 segundos, mostra o que tiver
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        console.warn("[3D] Timeout no carregamento, forçando exibição.");
        setIsLoaded(true);
      }
    }, 5000);

    if (viewerNode.loaded) {
      handleLoadEvent();
    }

    return () => {
      viewerNode.removeEventListener('load', handleLoadEvent);
      clearTimeout(fallbackTimer);
    };
  }, [currentModel, selectedPlanet]); // Re-anexa se o modelo ou o planeta mudar

  return (
    <div className={styles.overview} onClick={() => setTooltip(null)}>
      <div className={styles.viewerContainer}>
        {/* Loader Progressivo */}
        <div className={`${styles.loader} ${isLoaded ? styles.fadeOut : ''}`}>
          <div className={styles.loaderOrbital}>
            <div className={styles.loaderRing} />
            <div className={styles.loaderRing} />
            <div className={styles.loaderRing} />
            <div className={styles.loaderCore} />
          </div>
          <span className={styles.loaderText}>Iniciando Missão...</span>
        </div>



        {/* Camada 1: Versão Leve / Planet Focus */}
        <div className={styles.viewerWrapper} style={{ zIndex: (currentModel === 'Small' || selectedPlanet) ? 2 : 1 }}>
          <model-viewer
            key={selectedPlanet ? `planet-${selectedPlanet.id}` : 'solar-small'}
            ref={smallViewerRef}
            src={selectedPlanet ? selectedPlanet.modelPath : "/3D Model/solar_system_animation_Small.glb"}
            alt={selectedPlanet ? selectedPlanet.name : "Sistema Solar"}
            auto-rotate={!tooltip ? "" : undefined}
            camera-controls=""
            interaction-prompt="none"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1.2"
            camera-orbit={selectedPlanet ? focusedOrbit : defaultOrbit}
            field-of-view={selectedPlanet ? focusedFov : defaultFov}
            className={styles.viewer}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onClick={handleViewerClick}
          />
        </div>

        {/* Camada 2: Versão HD (Somente para a visão geral) */}
        {useAdaptiveLoading && !selectedPlanet && currentModel === 'large' && (
          <div className={styles.viewerWrapper}>
            <model-viewer
              key="solar-large"
              ref={viewerRef}
              src="/3D Model/solar_system_animation_large.glb"
              alt="Sistema Solar HD"
              auto-rotate=""
              camera-controls=""
              interaction-prompt="none"
              shadow-intensity="1"
              environment-image="neutral"
              exposure="1.2"
              camera-orbit={defaultOrbit}
              field-of-view={defaultFov}
              className={styles.viewer}
              onLoad={handleLargeLoad}
              onClick={handleViewerClick}
              style={{ 
                width: '100%',
                height: '100%',
                display: 'block',
                opacity: isLargeLoaded ? 1 : 0,
                transition: 'opacity 1s ease'
              } as any}
            />
          </div>
        )}
      </div>

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
