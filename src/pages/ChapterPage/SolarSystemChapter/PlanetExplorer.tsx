import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { planets, Planet } from '@/data/planets'
import PlanetViewer3D from '@/components/PlanetViewer3D'
import FloatingTooltip from '@/components/FloatingTooltip'
import { getNarrationById, getRandomLoadingNarration } from '@/data/narration'
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
  const [hasInteracted, setHasInteracted] = useState(false)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string; title: string } | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  
  const { 
    setActiveNarration, 
    setThemeColor,
    addViewedPlanet
  } = useNarrationSequence()

  // Banco de curiosidades detalhadas (Lore) para cada estatística
  const STAT_LORE: Record<string, Record<string, string>> = {
    mercurio: {
      Temperatura: "Imagine que loucura, enquanto de dia faz 430°C, de noite a temperatura cai para congelantes -180 °C. Isso acontece porque Mercúrio não tem atmosfera para segurar o calor! 🌡️🔥❄️",
      Gravidade: "Pule como um campeão! Em Mercúrio você pularia 3 vezes mais alto que na Terra. Você se sentiria leve como uma pena! 🤸‍♂️🎈",
      Distância: "Ele é o vizinho de porta do Sol! Por estar tão perto, ele corre em volta do Sol em apenas 88 dias terrestres. É o Flash do Sistema Solar! 🏃‍♂️💨☀️",
      "Duração do Dia": "Um dia em Mercúrio demora muito! São quase dois meses da Terra para o Sol nascer e se pôr uma única vez. Haja paciência! 🕰️🐢",
      "Duração do Ano": "O ano lá voa! Enquanto a Terra dá uma volta no Sol, Mercúrio já deu quatro! É o planeta mais apressadinho do grupo. 🏎️💨",
      Destaque: "Mercúrio é o menor planeta do Sistema Solar, sendo apenas um pouco maior que a nossa Lua! 🌑🤏"
    },
    venus: {
      Temperatura: "O lugar mais quente do sistema solar! Vênus tem nuvens tão grossas que seguram o calor como um cobertor super pesado. Faz calor até de noite! 🌡️☁️🔥",
      Gravidade: "Aqui você se sentiria quase como na Terra. A gravidade é quase igual, então seus saltos seriam bem parecidos com os de casa, porém você estaria torradinho! 🌍✨🔥",
      Distância: "Vênus é o nosso vizinho mais próximo! Ele brilha tanto no céu que às vezes as pessoas o confundem com uma estrela muito poderosa. ✨🔭",
      "Duração do Dia": "Vênus é muito lento para girar. O dia lá é mais longo que o próprio ano! E o Sol nasce no oeste e se põe no leste. 🔄🙃",
      "Duração do Ano": "Um ano em Vênus passa em 225 dias terrestres. É um ano rápido, mas com dias intermináveis! ⏳☀️",
      Destaque: "Vênus é conhecido como o 'Gêmeo da Terra' por causa do tamanho parecido, mas as semelhanças param por aí! 👯‍♀️🔥"
    },
    terra: {
      Temperatura: "O lugar perfeito! Nem tão quente, nem tão frio. É por isso que temos tanta vida e oceanos azuis maravilhosos por aqui. 🌍💙🌿",
      Gravidade: "Esta é a nossa força padrão! É o que nos mantém com os pés no chão e permite que a gente caminhe e corra sem sair flutuando. 👣🏠",
      Distância: "Estamos na 'Zona dos Cachos de Ouro' — a distância exata para que a água continue líquida e a vida possa existir! 🥣✨☀️",
      "Duração do Dia": "Nosso ciclo perfeito de 24 horas, dividido entre o dia para brincar e a noite para descansar e sonhar! ☀️🌙",
      "Duração do Ano": "365 dias para dar uma volta completa no Sol. É o tempo que levamos para comemorar um novo aniversário! 🎂🎉",
      Destaque: "A Terra é o único planeta conhecido que tem água líquida na superfície e vida! Somos muito sortudos! 🌊🧬"
    },
    marte: {
      Temperatura: "Prepare o casaco! Marte é bem frio e seco. Às vezes ocorrem tempestades de poeira gigantes que cobrem o planeta inteiro. 🧣🏜️❄️",
      Gravidade: "Você se sentiria bem mais leve em Marte. Daria para carregar coisas pesadas com facilidade, quase como um super-herói! 🦸‍♂️🪐",
      Distância: "Marte é conhecido como o Planeta Vermelho e estamos enviando robôs para explorá-lo agora mesmo! 🤖🚀",
      "Duração do Dia": "O 'Sol' de Marte dura quase o mesmo que o nosso, apenas 40 minutos a mais. Seria fácil se acostumar! ⏰🏜️",
      "Duração do Ano": "Como Marte está mais longe do Sol, ele leva quase dois anos terrestres para completar uma volta. Uma espera longa pelo réveillon! 🎆⏳",
      Destaque: "Lá fica o Monte Olimpo, o maior vulcão do Sistema Solar! Ele é três vezes mais alto que o Monte Everest! 🌋🏔️"
    },
    jupiter: {
      Temperatura: "Nas nuvens de Júpiter é muito frio, mas lá no fundo, perto do centro, faz um calor absurdo! É um gigante gasoso muito misterioso. 🧊🌫️🔥",
      Gravidade: "Cuidado! Júpiter é tão pesado que a gravidade lá te puxaria com muita força. Você se sentiria muito, muito pesado! 🎒🏋️‍♂️",
      Distância: "Ele é tão longe que leva muito tempo para chegar lá, mas ele é tão grande que 1.300 Terras caberiam dentro dele! 🌌🪐",
      "Duração do Dia": "Júpiter gira super rápido! O dia lá dura menos de 10 horas. O Sol nasce e se põe num piscar de olhos! ⚡🌅",
      "Duração do Ano": "Haja paciência! Júpiter leva 12 anos terrestres para dar uma volta no Sol. Você teria poucos aniversários por lá! 🎂🪐",
      Destaque: "A Grande Mancha Vermelha é uma tempestade gigante que existe há centenas de anos e é maior que a própria Terra! 🌀🔴"
    },
    saturno: {
      Temperatura: "Um gigante gelado! Saturno está longe demais do Sol para sentir o calor dele, então tudo lá é feito de gelo e gás gelado. ❄️🪐🧊",
      Gravidade: "Apesar de ser gigante, Saturno é muito leve porque é feito de gás. Se houvesse uma banheira gigante o suficiente, ele flutuaria! 🛁🎈",
      Distância: "Famoso por seus anéis deslumbrantes, que são feitos de pedaços de gelo e poeira espacial brilhante! 💍✨",
      "Duração do Dia": "Assim como Júpiter, Saturno gira muito rápido. O dia dura apenas 10 horas e meia. ⌚🌀",
      "Duração do Ano": "Uma volta completa no Sol leva quase 30 anos terrestres! É uma jornada muito longa pelo espaço. 🛰️⏳",
      Destaque: "Saturno tem o sistema de anéis mais espetacular de todos e possui nada menos que 146 luas confirmadas! 💍🌕"
    },
    urano: {
      Temperatura: "O campeão do frio! Urano é o planeta mais gelado de todos, como se fosse um freezer cósmico gigante. 🥶❄️",
      Gravidade: "Mesmo sendo um gigante, a gravidade lá é um pouco menor que na Terra. Você se sentiria um pouquinho mais leve! ☁️✨",
      Distância: "Ele é muito estranho: Urano gira de lado, como se estivesse rolando em vez de girar como um pião! 🌀⚖️",
      "Duração do Dia": "O dia em Urano dura cerca de 17 horas. Mas por causa da sua inclinação, um dos polos fica 42 anos no sol e 42 no escuro! ☀️🌚",
      "Duração do Ano": "Levaria 84 anos terrestres para Urano completar uma volta no Sol. É uma vida inteira de espera! ⏳🪐",
      Destaque: "Urano é o único planeta que gira quase totalmente deitado, provavelmente devido a uma batida gigante no passado! 🤸‍♂️💥"
    },
    netuno: {
      Temperatura: "Lá o vento sopra mais forte que em qualquer lugar! É um mundo azul escuro e extremamente congelante. 🌬️💙❄️",
      Gravidade: "Um pouco mais forte que na Terra, você se sentiria um pouco mais pesado, mas os ventos de lá são o que realmente impressionam! 💨⚖️",
      Distância: "O planeta mais distante do Sol! É o último posto oficial do nosso sistema solar antes do espaço profundo. 🌌🔭",
      "Duração do Dia": "O dia em Netuno passa rápido, durando cerca de 16 horas. ⌚🌬️",
      "Duração do Ano": "Netuno é o mais devagar de todos. Ele leva 165 anos terrestres para completar um único ano netuniano! 🐢🛰️",
      Destaque: "Em Netuno os ventos podem chegar a 2.000 km/h e cientistas acreditam que chove diamantes no seu interior! 💎🌦️"
    }
  }


  // Atualiza o Théo Global quando o planeta muda ou carrega
  useEffect(() => {
    const randomLoading = getRandomLoadingNarration()
    const loadingNarration = { ...randomLoading, id: `loading-${selectedPlanet.id}` }
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
    setTooltip(null) // Fecha tooltip ao mudar de planeta
  }, [selectedPlanet])
  const handleModelLoad = useCallback(() => {
    setIsModelLoaded(true)
  }, [])

  const handlePlanetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Se a tooltip já estiver visível, fecha ela (comportamento de toggle)
    if (tooltip) {
      setTooltip(null)
      return
    }

    const x = e.clientX
    const y = e.clientY

    setTooltip({
      visible: true,
      x,
      y,
      title: "Exploração Rápida",
      content: selectedPlanet.funFact // Usa a curiosidade como conteúdo inicial da tooltip
    })
    setHasInteracted(true)
  }

  return (
    <div className={styles.explorer} onClick={() => setTooltip(null)}>
      {/* Detalhe do Planeta Selecionado */}
      <div ref={detailRef} className={styles.planetDetail}>
        <div className={styles.viewerContainer} onClick={handlePlanetClick}>
           <PlanetViewer3D 
             modelSrc={selectedPlanet.modelPath} 
             alt={selectedPlanet.name} 
             color={selectedPlanet.color}
             onLoad={handleModelLoad}
             fieldOfView="32deg"
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
              { label: 'Temperatura', value: selectedPlanet.temperature, hint: 'Como é o clima?' },
              { label: 'Gravidade', value: selectedPlanet.gravity, hint: 'Consigo pular alto?' },
              { label: 'Distância', value: selectedPlanet.distance, hint: 'Longe do Sol?' },
              { label: 'Duração do Dia', value: selectedPlanet.dayDuration, hint: 'O dia passa rápido?' },
            ].map((stat) => (
              <button 
                key={stat.label} 
                className={`${styles.statCard} ${styles.clickable}`}
                onClick={() => setActiveStatDetail({ id: selectedPlanet.id, ...stat })}
              >
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statHint}>{stat.hint}</div>
              </button>
            ))}
          </div>

          <div className={styles.funFactCard}>
            <div className={styles.funFactIcon}>
              <span>💡</span> DICA DO THÉO
            </div>
            <p className={styles.description}>{selectedPlanet.funFact}</p>
          </div>
        </div>
      </div>

      {/* Guia de Interação (Mão deslizante) */}
      {!hasInteracted && isModelLoaded && (
        <div className={styles.interactionHint}>
          <div className={styles.handIcon}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="18" r="4" fill="rgba(255, 255, 255, 0.2)" className={styles.hintCircle} />
              <circle cx="12" cy="18" r="1.5" fill="white" />
              <path 
                d="M12 18V11M12 11V15.5C12 16.33 12.67 17 13.5 17C14.33 17 15 16.33 15 15.5V11M15 11V14.5C15 15.33 15.67 16 16.5 16C17.33 16 18 15.33 18 14.5V11M18 11V12.5C18 13.33 18.67 14 19.5 14C20.33 14 21 13.33 21 12.5V8C21 4.69 18.31 2 15 2H13.5C10.19 2 7.5 4.69 7.5 8V11C7.5 11.83 8.17 12.5 9 12.5C9.83 12.5 10.5 11.83 10.5 11V12.5" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                transform="rotate(180 12 12)" 
              />
            </svg>
          </div>
          <p className={styles.hintText}>Explore outros planetas!</p>
        </div>
      )}

      {/* Navegação Inferior Estilo Dock */}
      <nav className={styles.planetDock}>
        <div className={styles.dockTrack}>
          {planets.map(p => (
            <button 
              key={p.id}
              className={`${styles.dockItem} ${p.id === selectedPlanet.id ? styles.active : ''}`}
              onClick={() => {
                setSelectedPlanet(p)
                setHasInteracted(true)
              }}
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
      {/* Tooltip Flutuante */}
      {tooltip && (
        <FloatingTooltip 
          isVisible={tooltip.visible}
          x={tooltip.x}
          y={tooltip.y}
          title={tooltip.title}
          content={tooltip.content}
          onClose={() => setTooltip(null)}
          color={selectedPlanet.color}
        />
      )}
    </div>
  )
}
