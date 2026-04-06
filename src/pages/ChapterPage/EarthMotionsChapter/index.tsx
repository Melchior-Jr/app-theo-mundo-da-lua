import { useState, useEffect, useRef } from 'react'
import { getNarrationById } from '@/data/narration'
import { getCaption } from '@/data/subtitles'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { useProgress } from '@/hooks/useProgress'
import TheoCharacter from '@/components/TheoCharacter'
import PlanetViewer3D from '@/components/PlanetViewer3D'
import ShareButton from '@/components/ShareButton'
import styles from './EarthMotionsChapter.module.css'

interface MotionData {
  id: string
  title: string
  description: string
  meta: Array<{ label: string; value: string }>
  metaDetails: Record<string, string> // Novo mapa de explicações por card
  caption: string
  fullText: string
}

export default function EarthMotionsChapter() {
  // Estado inicial: nenhum movimento selecionado (Terra parada para a Intro)
  const [mode, setMode] = useState<'rotacao' | 'translaçao' | null>(null)
  
  // Estado de controle de velocidade e toque
  const [rotationSpeed, setRotationSpeed] = useState(40)
  const [isDragging, setIsDragging] = useState(false)
  const touchData = useRef({ 
    lastX: 0, 
    lastY: 0,
    lastAngle: 0,
    startX: 0, 
    startTime: 0,
    recentX: 0,
    recentAngle: 0,
    recentTime: 0
  })
  
  // Detalhes da curiosidade
  const [selectedCuriosity, setSelectedCuriosity] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Estados para Translação
  const [orbitSpeed, setOrbitSpeed] = useState(30)
  const [orbitAngle, setOrbitAngle] = useState(0)

  useEffect(() => {
    if (!mode || isDragging) return;

    let rafId: number;
    const baseRotation = 40;
    const baseOrbit = 30;

    const applyFriction = () => {
      let needsNextFrame = false;

      // Fricção para Rotação
      if (mode === 'rotacao' && Math.abs(rotationSpeed - baseRotation) > 0.1) {
        setRotationSpeed(prev => {
          const diff = prev - baseRotation;
          if (Math.abs(diff) < 0.2) return baseRotation;
          return baseRotation + (diff * 0.98);
        });
        needsNextFrame = true;
      }

      // Fricção para Translação
      if (mode === 'translaçao' && Math.abs(orbitSpeed - baseOrbit) > 0.1) {
        setOrbitSpeed(prev => {
          const diff = prev - baseOrbit;
          if (Math.abs(diff) < 0.2) return baseOrbit;
          return baseOrbit + (diff * 0.98);
        });
        needsNextFrame = true;
      }

      if (needsNextFrame) {
        rafId = requestAnimationFrame(applyFriction);
      }
    };

    rafId = requestAnimationFrame(applyFriction);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDragging, mode, rotationSpeed, orbitSpeed]);

  // Loop para atualizar o ângulo da órbita baseado na velocidade atual
  useEffect(() => {
    if (mode !== 'translaçao') return;

    let rafId: number;
    let lastTime = Date.now();

    const updateOrbit = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setOrbitAngle(prev => (prev + orbitSpeed * dt) % 360);
      rafId = requestAnimationFrame(updateOrbit);
    };

    rafId = requestAnimationFrame(updateOrbit);
    return () => cancelAnimationFrame(rafId);
  }, [mode, orbitSpeed]);

  const { 
    canStartLocal, 
    setCanStartLocal, 
    setActiveNarration, 
    setOnNarrationFinish,
    currentTime 
  } = useNarrationSequence()
  const { saveExploration } = useProgress()

  // Sincronia de legendas sincronizada pelo data/subtitles.ts
  const currentCaption = getCaption('chapter-2', currentTime)
  
  // Sensor de Transição: Monitora a mudança real do rádio (false → true)
  const prevCanStartLocal = useRef(false)

  // Bloqueio de Inicialização: Garante estado zerado ao montar este capítulo
  useEffect(() => {
    setCanStartLocal(false)
    setMode(null)
    prevCanStartLocal.current = false
  }, [setCanStartLocal])

  // Seletor automático: após a intro terminar, ativa Rotação
  useEffect(() => {
    if (!prevCanStartLocal.current && canStartLocal && mode === null) {
      setMode('rotacao')
    }
    prevCanStartLocal.current = canStartLocal
  }, [canStartLocal, mode])

  // Controle de Narração Local
  const activeLocalNarration = useRef<string | null>(null)

  useEffect(() => {
    // Só prossegue se o usuário puder iniciar e houver um modo selecionado
    if (!canStartLocal || !mode) return

    // Se a narração para este modo já foi iniciada, não repete
    if (activeLocalNarration.current === mode) return

    const narration = getNarrationById(mode === 'rotacao' ? 'rotacao' : 'translacao')
    if (narration) {
      // Limpa o callback da intro para não interferir nos áudios locais
      setOnNarrationFinish(undefined)
      
      setActiveNarration(narration)
      activeLocalNarration.current = mode

      // Ganha XP por descobrir o movimento
      saveExploration(`view-motion-${mode}`, 50)
    }
  }, [mode, canStartLocal, setActiveNarration, setOnNarrationFinish, saveExploration])

  const motions: Record<'rotacao' | 'translaçao', MotionData> = {
    rotacao: {
      id: 'rotacao',
      title: 'Rotação Terrestre',
      description: 'O movimento da Terra em torno de si mesma.',
      meta: [
        { label: 'Duração', value: '24 horas' },
        { label: 'Velocidade', value: '1.670 km/h' },
        { label: 'Eixo', value: 'Inclinação de 23.5°' },
        { label: 'Efeito', value: 'Ciclo Dia/Noite' },
      ],
      metaDetails: {
        'Duração': 'É o tempo de um dia inteiro! Enquanto você brinca e depois dorme, a Terra deu uma voltinha completa sobre si mesma. Por isso o Sol "aparece" de manhã e "some" no fim do dia.',
        'Velocidade': 'A Terra gira MUITO rápido! É mais rápido que um avião a jato. Mas a gente não sente o vento porque tudo ao nosso redor, inclusive o ar, está girando junto com a gente.',
        'Eixo': 'A Terra não gira "em pé", ela é um pouquinho inclinada, como se estivesse com a cabeça deitada pro lado. Essa inclinação é superfundamental para equilibrar as temperaturas no planeta.',
        'Efeito': 'Como a Terra é uma bola, o Sol só consegue iluminar um lado de cada vez. O lado iluminado é o dia (hora de acordar!) e o lado na sombra é a noite (hora de sonhar!).'
      },
      caption: 'Imagine a Terra como um pião girando no espaço. Esse "baile" em torno de si mesma é o que nos dá as manhãs de sol e as noites de descanso.',
      fullText: 'O movimento de rotação é quando a Terra gira em volta dela mesma… tipo um pião! 😄'
    },
    translaçao: {
      id: 'translacao',
      title: 'Translação Orbitária',
      description: 'A jornada da Terra ao redor do Sol.',
      meta: [
        { label: 'Duração', value: '365,25 dias' },
        { label: 'Velocidade', value: '107.000 km/h' },
        { label: 'Caminho', value: 'Em torno do Sol' },
        { label: 'Efeito', value: 'Estações do Ano' },
      ],
      metaDetails: {
        'Duração': 'É o tempo de um ano todinho! É a jornada completa da Terra ao redor do Sol. Sabe aquele 0,25? Ele se junta e a cada 4 anos ganhamos um dia extra no calendário (o ano bissexto!).',
        'Velocidade': 'Nesse exato momento, estamos viajando pelo espaço a uma velocidade incrível! É 100 vezes mais rápido que um carro de corrida. Estamos todos em uma grande nave espacial chamada Terra.',
        'Caminho': 'A Terra segue uma trilha invisível chamada órbita. O Sol é tão grande e forte que mantém a Terra sempre por perto, nem muito longe para congelar, nem muito perto para queimar.',
        'Efeito': 'Graças à inclinação da Terra e sua viagem ao redor do Sol, diferentes partes do planeta recebem mais ou menos luz em certas épocas. Isso cria a Primavera, o Verão, o Outono e o Inverno!'
      },
      caption: 'A Terra não para! Ela viaja por um caminho imenso ao redor do Sol. É uma jornada de um ano inteiro para dar uma única volta completa.',
      fullText: 'Se a rotação faz o dia e a noite… a translação é o movimento que faz o ano acontecer! 😄'
    }
  }

  const currentData = mode ? motions[mode] : null

  return (
    <div className={styles.chapterContainer}>
      {/* SELETOR DE MODO (DOCK) */}
      <div className={styles.modeDock}>
        <div className={styles.dockTrack}>
          <button 
            className={`${styles.dockItem} ${mode === 'rotacao' ? styles.active : ''}`}
            onClick={() => {
              if (mode !== 'rotacao') {
                setMode('rotacao')
                setCanStartLocal(true) // Libera o controle local imediatamente
              }
            }}
          >
            <div className={styles.dockCircle}>🌍</div>
            <span className={styles.dockLabel}>Rotação</span>
          </button>

          <button 
            className={`${styles.dockItem} ${mode === 'translaçao' ? styles.active : ''}`}
            onClick={() => {
              if (mode !== 'translaçao') {
                setMode('translaçao')
                setCanStartLocal(true) // Libera o controle local imediatamente
              }
            }}
          >
            <div className={styles.dockCircle}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="8" fill="#f1c40f" />
                <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
                <g className={styles.orbitIcon}>
                  <circle cx="40" cy="24" r="4" fill="#4b7bed" />
                </g>
              </svg>
            </div>
            <span className={styles.dockLabel}>Translação</span>
          </button>
        </div>
      </div>

      <div className={styles.dashboard}>
        {/* OVERLAY DO THÉO CENTRALIZADO — visível apenas durante a intro */}
        <div className={`${styles.theoIntroOverlay} ${!mode ? styles.theoIntroVisible : styles.theoIntroHidden}`}>
          {/* Balão de Fala (Speech Bubble) */}
          <div className={styles.speechBubble}>
            <p className={styles.speechText}>
              {currentCaption}
            </p>
          </div>

          <div className={styles.theoIntroCharacter}>
            <TheoCharacter size={220} />
            {/* Barrinhas de som — idênticas ao NarrationPlayer */}
            <div className={styles.introSoundWaves} aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={styles.introBar} />
              ))}
            </div>
          </div>
        </div>

        {/* LADO A: VISUALIZAÇÃO 3D — só exibido com movimento selecionado */}
        {mode && (
          <div className={styles.sceneArea}>
            <div className={styles.planetGlow} style={{ backgroundColor: 'var(--theme-color)' }} />
            
            <div 
              className={styles.scene}
              onPointerDown={(e) => {
                const now = Date.now()
                const rect = e.currentTarget.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

                touchData.current = {
                  lastX: e.clientX,
                  lastY: e.clientY,
                  lastAngle: startAngle,
                  startX: e.clientX,
                  startTime: now,
                  recentX: e.clientX,
                  recentAngle: startAngle,
                  recentTime: now
                }
                setIsDragging(true)
                if (!hasInteracted) {
                  setHasInteracted(true)
                  // Ganha XP por interagir com o modelo 3D do movimento pela primeira vez
                  saveExploration(`interact-motion-3d-${mode}`, 50)
                }
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (!isDragging) return
                const now = Date.now()
                
                if (mode === 'rotacao') {
                  const deltaX = e.clientX - touchData.current.lastX
                  if (now - touchData.current.recentTime > 100) {
                    touchData.current.recentX = touchData.current.lastX
                    touchData.current.recentTime = now
                  }
                  const dragSpeed = deltaX * 15.0
                  setRotationSpeed(prev => Math.max(-5000, Math.min(5000, prev + dragSpeed)))
                } else if (mode === 'translaçao') {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const centerX = rect.left + rect.width / 2
                  const centerY = rect.top + rect.height / 2
                  const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
                  
                  let deltaAngle = currentAngle - touchData.current.lastAngle
                  if (deltaAngle > 180) deltaAngle -= 360
                  if (deltaAngle < -180) deltaAngle += 360
                  
                  setOrbitAngle(prev => (prev + deltaAngle) % 360)
                  
                  if (now - touchData.current.recentTime > 50) {
                    touchData.current.recentAngle = touchData.current.lastAngle
                    touchData.current.recentTime = now
                  }
                  
                  // Atualiza velocidade instantânea para inércia
                  const dt = (now - touchData.current.recentTime) / 1000
                  if (dt > 0) {
                    const instantSpeed = deltaAngle / dt
                    setOrbitSpeed(instantSpeed)
                  }
                  
                  touchData.current.lastAngle = currentAngle
                }
                
                touchData.current.lastX = e.clientX
                touchData.current.lastY = e.clientY
              }}
              onPointerUp={(e) => {
                if (!isDragging) return
                const now = Date.now()
                
                if (mode === 'rotacao') {
                  const deltaTime = Math.max(1, now - touchData.current.recentTime)
                  const deltaX = e.clientX - touchData.current.recentX
                  const flickVelocity = deltaX / deltaTime
                  const impulseRotation = flickVelocity * 15000
                  setRotationSpeed(prev => Math.max(-5000, Math.min(5000, prev + impulseRotation)))
                } else if (mode === 'translaçao') {
                  // Inércia circular baseada no movimento recente
                  const rect = e.currentTarget.getBoundingClientRect()
                  const centerX = rect.left + rect.width / 2
                  const centerY = rect.top + rect.height / 2
                  const endAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
                  
                  let deltaAngle = endAngle - touchData.current.recentAngle
                  if (deltaAngle > 180) deltaAngle -= 360
                  if (deltaAngle < -180) deltaAngle += 360
                  
                  const dt = Math.max(1, now - touchData.current.recentTime) / 1000
                  const flickOrbit = (deltaAngle / dt) * 1.5 // Multiplicador de impulso
                  
                  setOrbitSpeed(prev => Math.max(-1000, Math.min(1000, prev + flickOrbit)))
                }

                setIsDragging(false)
                e.currentTarget.releasePointerCapture(e.pointerId)
              }}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {mode === 'translaçao' && (
                <div className={styles.translationContainer}>
                  <div className={styles.theSun3D}>
                    <PlanetViewer3D 
                      modelSrc="/3D Model/the_star_sun.glb" 
                      alt="O Sol" 
                      color="#f1c40f"
                      cameraControls={false}
                      autoRotate={true}
                      exposure={0.2}
                    />
                  </div>
                  
                  {!hasInteracted && (
                    <div className={styles.interactionHint}>
                      <div className={styles.handIconCircular}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="6" r="4" fill="rgba(255, 255, 255, 0.2)" className={styles.hintCircle} />
                          <circle cx="12" cy="6" r="1.5" fill="white" />
                          <path 
                            d="M12 6V13M12 13V8.5C12 7.67 12.67 7 13.5 7C14.33 7 15 7.67 15 8.5V13M15 13V9.5C15 8.67 15.67 8 16.5 8C17.33 8 18 8.67 18 9.5V13M18 13V10.5C18 9.67 18.67 9 19.5 9C20.33 9 21 9.67 21 10.5V15C21 18.31 18.31 21 15 21H13.5C10.19 21 7.5 18.31 7.5 15V13C7.5 12.17 8.17 11.5 9 11.5C9.83 11.5 10.5 12.17 10.5 13V11.5" 
                            stroke="white" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className={styles.orbitPath} style={{ transform: `rotate(${orbitAngle}deg)`, animation: 'none' }}>
                    <div className={styles.orbitingEarth} style={{ transform: `rotate(${-orbitAngle}deg)`, animation: 'none' }}>
                      <div className={styles.miniEarth3D}>
                         <div className={styles.axisLineMini} />
                         <PlanetViewer3D 
                            modelSrc="/3D Model/earth_new.glb" 
                            alt="Terra em Translação" 
                            color="#4b7bed"
                            cameraControls={false}
                            tilt={23.5}
                            lockVertical={true}
                          />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'rotacao' && (
                <div className={styles.rotationContainer}>
                  <div className={styles.planetViewerWrapper}>
                    <div className={styles.rotationAxis} />
                    
                    {!hasInteracted && (
                      <div className={styles.interactionHint}>
                        <div className={styles.handAxisWrapper}>
                          <div className={styles.handIcon}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="6" r="4" fill="rgba(255, 255, 255, 0.2)" className={styles.hintCircle} />
                              <circle cx="12" cy="6" r="1.5" fill="white" />
                              <path 
                                d="M12 6V13M12 13V8.5C12 7.67 12.67 7 13.5 7C14.33 7 15 7.67 15 8.5V13M15 13V9.5C15 8.67 15.67 8 16.5 8C17.33 8 18 8.67 18 9.5V13M18 13V10.5C18 9.67 18.67 9 19.5 9C20.33 9 21 9.67 21 10.5V15C21 18.31 18.31 21 15 21H13.5C10.19 21 7.5 18.31 7.5 15V13C7.5 12.17 8.17 11.5 9 11.5C9.83 11.5 10.5 12.17 10.5 13V11.5" 
                                stroke="white" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <p className={styles.hintText}>Arraste para girar a Terra</p>
                      </div>
                    )}

                    <PlanetViewer3D 
                      modelSrc="/3D Model/earth_new.glb" 
                      alt="Terra em Rotação" 
                      color="#4b7bed"
                      cameraOrbit="0deg 75deg 110%"
                      tilt={23.5}
                      lockVertical={true}
                      cameraControls={false}
                      autoRotate={true}
                      rotationSpeed={`${rotationSpeed}deg`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LADO B: PAINEL DE INFORMAÇÕES — só exibido com movimento selecionado */}
        {mode && currentData && (
          <div className={styles.infoPanel}>
            <header className={styles.infoHeader}>
              <h2 className={styles.title}>{currentData.title}</h2>
              <p className={styles.description}>{currentData.description}</p>
              <ShareButton 
                title={`Aprendendo sobre ${currentData.title} com o Théo! 🚀`}
                text={`Dá uma olhada no movimento de ${currentData.title} da Terra que eu acabei de aprender no Théo no Mundo da Lua!`}
                onShare={() => saveExploration(`share-chapter-${mode}`, 50)}
              />
            </header>

            <div className={styles.metaGrid}>
              {currentData.meta.map((stat, i) => (
                <div 
                  key={i} 
                  className={`${styles.metaCard} ${styles.clickable}`}
                  onClick={() => {
                    setSelectedCuriosity(stat.label)
                    // Ganha XP por explorar detalhes específicos do movimento
                    saveExploration(`motion-detail-${mode}-${stat.label.toLowerCase()}`, 25)
                  }}
                >
                  <span className={styles.metaLabel}>{stat.label}</span>
                  <span className={styles.metaValue}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.captionCard}>
              <div className={styles.captionIcon}>💡 Dica do Théo</div>
              {currentData.caption}
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY DE DETALHES */}
      {selectedCuriosity && (
        <div className={styles.statOverlay} onClick={() => setSelectedCuriosity(null)}>
          <div className={styles.statModal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedCuriosity(null)}>✕</button>
            <div className={styles.modalHeader}>
              <span className={styles.modalCategory}>Explicação do Théo</span>
              <h3 className={styles.modalTitle}>{selectedCuriosity}</h3>
            </div>
            <div className={styles.modalContent}>
              {motions[mode!].metaDetails[selectedCuriosity]}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
