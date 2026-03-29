import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { planets, Planet } from '@/data/planets'
import PlanetViewer3D from '@/components/PlanetViewer3D'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import styles from './PlanetExplorer.module.css'

interface Props {}

export default function PlanetExplorer({}: Props) {
  const location = useLocation()
  
  // Detecta planeta inicial via query param (?planet=ID)
  const getInitialPlanet = () => {
    const params = new URLSearchParams(location.search)
    const planetId = params.get('planet')
    if (planetId) {
      const found = planets.find(p => p.id === planetId)
      if (found) return found
    }
    return planets[0]
  }

  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(getInitialPlanet())
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [activeStatDetail, setActiveStatDetail] = useState<{ id: string; label: string; value: string } | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  
  const { 
    setActiveNarration, 
    setThemeColor,
    addViewedPlanet
  } = useNarrationSequence()

  // Banco de curiosidades detalhadas (Lore) para cada estatística
  const STAT_LORE: Record<string, Record<string, string>> = {
    mercurio: {
      Temperatura: "Imagine que loucura, Enquanto de dia faz 430°C, de noite a temperatura cai para congelantes -180 °C. Isso acontece porque Mercúrio não tem atmosfera para segurar o calor! 🌡️🔥❄️",
      Gravidade: "Pule como um campeão! Em Mercúrio você pularia 3 vezes mais alto que na Terra. Você se sentiria leve como uma pena! 🤸‍♂️🎈",
      Distância: "Ele é o vizinho de porta do Sol! Por estar tão perto, ele corre em volta do Sol em apenas 88 dias terrestres. É o Flash do Sistema Solar! 🏃‍♂️💨☀️"
    },
    venus: {
      Temperatura: "O lugar mais quente do sistema solar! Vênus tem nuvens tão grossas que seguram o calor como um cobertor super pesado. Faz calor até de noite! 🌡️☁️🔥",
      Gravidade: "Aqui você se sentiria quase como na Terra. A gravidade é quase igual, então seus saltos seriam bem parecidos com os de casa, porém você estaria torradinho! 🌍✨🔥",
      Distância: "Vênus é o nosso vizinho mais próximo! Ele brilha tanto no céu que às vezes as pessoas o confundem com uma estrela muito poderosa. ✨🔭"
    },
    terra: {
      Temperatura: "O lugar perfeito! Nem tão quente, nem tão frio. É por isso que temos tanta vida e oceanos azuis maravilhosos por aqui. 🌍💙🌿",
      Gravidade: "Esta é a nossa força padrão! É o que nos mantém com os pés no chão e permite que a gente caminhe e corra sem sair flutuando. 👣🏠",
      Distância: "Estamos na 'Zona dos Cachos de Ouro' — a distância exata para que a água continue líquida e a vida possa existir! 🥣✨☀️"
    },
    marte: {
      Temperatura: "Prepare o casaco! Marte é bem frio e seco. Às vezes ocorrem tempestades de poeira gigantes que cobrem o planeta inteiro. 🧣🏜️❄️",
      Gravidade: "Você se sentiria bem mais leve em Marte. Daria para carregar coisas pesadas com facilidade, quase como um super-herói! 🦸‍♂️🪐",
      Distância: "Marte é conhecido como o Planeta Vermelho e estamos enviando robôs para explorá-lo agora mesmo! 🤖🚀"
    },
    jupiter: {
      Temperatura: "Nas nuvens de Júpiter é muito frio, mas lá no fundo, perto do centro, faz um calor absurdo! É um gigante gasoso muito misterioso. 🧊🌫️🔥",
      Gravidade: "Cuidado! Júpiter é tão pesado que a gravidade lá te puxaria com muita força. Você se sentiria muito, muito pesado, como se estivesse carregando uma mochila cheia de pedras. 🎒🏋️‍♂️",
      Distância: "Ele é tão longe que leva muito tempo para chegar lá, mas ele é tão grande que 1.300 Terras caberiam dentro dele! 🌌🪐"
    },
    saturno: {
      Temperatura: "Um gigante gelado! Saturno está longe demais do Sol para sentir o calor dele, então tudo lá em cima é feito de gelo e gás gelado. ❄️🪐🧊",
      Gravidade: "Apesar de ser gigante, Saturno é muito leve porque é feito de gás. Se houvesse uma banheira gigante o suficiente, ele flutuaria na água! 🛁🎈",
      Distância: "Famoso por seus anéis deslumbrantes, que são feitos de pedaços de gelo e poeira espacial brilhante! 💍✨"
    },
    urano: {
      Temperatura: "O campeão do frio! Urano é o planeta mais gelado de todos, como se fosse um freezer cósmico gigante. 🥶❄️",
      Gravidade: "Mesmo sendo um gigante, a gravidade lá é um pouco menor que na Terra. Você se sentiria um pouquinho mais leve! ☁️✨",
      Distância: "Ele é muito estranho: Urano gira de lado, como se estivesse rolando em vez de girar como um pião! 🌀⚖️"
    },
    netuno: {
      Temperatura: "Lá o vento sopra mais forte que em qualquer lugar! É um mundo azul escuro e extremamente congelante. 🌬️💙❄️",
      Gravidade: "Um pouco mais forte que na Terra, você se sentiria um pouco mais pesado, mas os ventos de lá são o que realmente impressionam! 💨⚖️",
      Distância: "O planeta mais distante do Sol! É o último posto oficial do nosso sistema solar antes do espaço profundo. 🌌🔭"
    }
  }

  // Atualiza o Théo Global quando o planeta muda ou carrega
  useEffect(() => {
    const globalLoading = getNarrationById('loading')!
    const loadingNarration = { ...globalLoading, id: `loading-${selectedPlanet.id}` }
    const planetNarration = getNarrationById(`planet-${selectedPlanet.id}`)

    if (isModelLoaded && planetNarration) {
      setActiveNarration(planetNarration)
      addViewedPlanet(selectedPlanet.id)
    } else {
      setActiveNarration(loadingNarration)
    }
    setThemeColor(selectedPlanet.color)
  }, [selectedPlanet, isModelLoaded, setActiveNarration, setThemeColor, addViewedPlanet])

  useEffect(() => {
    setIsModelLoaded(false)
    if (detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedPlanet])

  return (
    <div className={styles.explorer}>
      {/* Detalhe do Planeta Selecionado */}
      <div ref={detailRef} className={styles.planetDetail}>
        <div className={styles.viewerContainer}>
           <PlanetViewer3D 
             modelSrc={selectedPlanet.modelPath} 
             alt={selectedPlanet.name} 
             color={selectedPlanet.color}
             onLoad={() => setIsModelLoaded(true)}
           />
           
           {/* Glow de fundo que muda com o planeta */}
           <div 
             className={styles.planetGlow} 
             style={{ background: `radial-gradient(circle, ${selectedPlanet.color}33 0%, transparent 70%)` }} 
           />
        </div>

        <div className={styles.infoBox}>
          <header className={styles.infoHeader}>
            <div className={styles.planetBadge}>
              <span className={styles.planetOrder}>{selectedPlanet.order}º Parada</span>
            </div>
            <h2 className={styles.planetTitle}>{selectedPlanet.name}</h2>
          </header>

          <div className={styles.statsGrid}>
            {[
              { label: 'Temperatura', value: selectedPlanet.temperature },
              { label: 'Gravidade', value: selectedPlanet.gravity },
              { label: 'Distância', value: selectedPlanet.distance },
            ].map((stat) => (
              <button 
                key={stat.label} 
                className={`${styles.statCard} ${styles.clickable}`}
                onClick={() => setActiveStatDetail({ id: selectedPlanet.id, ...stat })}
              >
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navegação Inferior Estilo Dock */}
      <nav className={styles.planetDock}>
        <div className={styles.dockTrack}>
          {planets.map(p => (
            <button 
              key={p.id}
              className={`${styles.dockItem} ${p.id === selectedPlanet.id ? styles.active : ''}`}
              onClick={() => setSelectedPlanet(p)}
              style={{ '--p-color': p.color } as React.CSSProperties}
            >
              <div className={styles.dockCircle} />
              <span className={styles.dockLabel}>{p.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal de Detalhes dos Stats */}
      {activeStatDetail && (
        <div className={styles.statOverlay} onClick={() => setActiveStatDetail(null)}>
          <div 
            className={styles.statModal} 
            onClick={e => e.stopPropagation()}
            style={{ '--p-color': selectedPlanet.color } as React.CSSProperties}
          >
            <button className={styles.modalClose} onClick={() => setActiveStatDetail(null)}>✕</button>
            <header className={styles.modalHeader}>
              <span className={styles.modalCategory}>
                {activeStatDetail.label === 'Distância' ? 'Distância do Sol' : activeStatDetail.label}
              </span>
              <h3 className={styles.modalTitle}>{activeStatDetail.value}</h3>
            </header>
            <div className={styles.modalContent}>
              {STAT_LORE[activeStatDetail.id]?.[activeStatDetail.label] || 
               "Théo ainda está explorando os segredos desta informação espacial... 🚀"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
