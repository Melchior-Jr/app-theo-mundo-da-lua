import { useState, useEffect, useRef } from 'react'
import { getNarrationById } from '@/data/narration'
import { getCaption } from '@/data/subtitles'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import TheoCharacter from '@/components/TheoCharacter'
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
  
  // Detalhes da curiosidade
  const [selectedCuriosity, setSelectedCuriosity] = useState<string | null>(null)

  const { 
    canStartLocal, 
    setCanStartLocal, 
    setActiveNarration, 
    setOnNarrationFinish,
    currentTime 
  } = useNarrationSequence()

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

  // Gerenciador de Narração Local
  useEffect(() => {
    if (!canStartLocal || !mode) return

    // Limpa o callback da intro para não interferir nos áudios locais
    setOnNarrationFinish(undefined)

    // Injeta a narração do movimento diretamente.
    // O 'narrationKey' no contexto garante remontagem do NarrationPlayer
    // mesmo que o id seja o mesmo, eliminando a necessidade de passar por null.
    const narration = getNarrationById(mode === 'rotacao' ? 'rotacao' : 'translacao')
    if (narration) {
      setActiveNarration(narration)
    }
  }, [mode, canStartLocal, setActiveNarration, setOnNarrationFinish])

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
            onClick={() => setMode('rotacao')}
          >
            <div className={styles.dockCircle}>↺</div>
            <span className={styles.dockLabel}>Rotação</span>
          </button>

          <button 
            className={`${styles.dockItem} ${mode === 'translaçao' ? styles.active : ''}`}
            onClick={() => setMode('translaçao')}
          >
            <div className={styles.dockCircle}>🌍</div>
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
            
            <div className={styles.scene}>
              {mode === 'rotacao' && <div className={styles.rotationArrow} />}
              
              {mode === 'translaçao' && (
                <div className={styles.translationContainer}>
                  <div className={styles.theSun} />
                  <div className={styles.orbitPath}>
                    <div className={styles.orbitingEarth}>
                      <div className={styles.miniEarth} />
                    </div>
                  </div>
                </div>
              )}

              {mode === 'rotacao' && (
                <div className={styles.rotationContainer}>
                  <div className={styles.earthGlobe}>
                    <div className={styles.earthMapMap} />
                    <div className={styles.dayNightGradient} />
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
            </header>

            <div className={styles.metaGrid}>
              {currentData.meta.map((stat, i) => (
                <div 
                  key={i} 
                  className={`${styles.metaCard} ${styles.clickable}`}
                  onClick={() => setSelectedCuriosity(stat.label)}
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
