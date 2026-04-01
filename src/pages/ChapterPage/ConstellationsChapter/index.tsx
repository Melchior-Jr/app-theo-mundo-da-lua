import { useState, useEffect } from 'react'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import styles from './ConstellationsChapter.module.css'

type ConstellationId = 
  'orion' | 'tres-marias' | 'cruzeiro' | 
  'aries' | 'touro' | 'gemeos' | 'cancer' | 'leao' | 'virgem' | 
  'libra' | 'escorpiao' | 'sagitario' | 'capricornio' | 'aquario' | 'peixes'

interface Star { x: number; y: number }
interface ConstellationData {
  id: ConstellationId
  name: string
  color: string
  icon: string
  audioId: string
  mainStar: string
  starsCount: number
  description: string
  lore: string
  stars: Star[]
  lines: string[]
  shortName?: string
}

const INTRO_LORE: Record<string, string> = {
  'O que são?': 'Imagine um jogo gigante de ligar os pontos no céu noturno! 🕵️‍♂️✨\n\nAs constelações são agrupamentos de estrelas que, quando ligadas por linhas imaginárias, formam figuras de animais, objetos ou heróis da mitologia. Elas nos ajudam a reconhecer e localizar estrelas mais facilmente no vasto universo!',
  'Navegação': 'As estrelas foram o primeiro GPS da humanidade! 🧭⛵\n\nHá centenas de anos, os navegadores e exploradores olhavam para o céu para saber em qual direção estavam indo. O Cruzeiro do Sul, por exemplo, sempre aponta para o Polo Sul geográfico, guiando viajantes por todo o hemisfério!',
  'Astronomia': 'O céu oficial está dividido em 88 "bairros" estelares! 🏢🔭\n\nA União Astronômica Internacional mapeou todo o céu em 88 constelações oficiais. Isso permite que astrônomos de todo o mundo falem a mesma "língua" ao descrever onde um planeta ou uma galáxia está localizado.',
  'Zodíaco': 'O Zodíaco é o "caminho" que o Sol faz no céu durante o ano! ☀️🎠\n\nEle é formado por 12 constelações principais por onde o Sol parece passar quando olhamos da Terra. Cada uma delas marca uma época do ano e faz parte do grande relógio cósmico que os antigos usavam para organizar o tempo.'
}

const CONSTELLATIONS: ConstellationData[] = [
  {
    id: 'orion',
    name: 'Órion',
    color: '#FFD166',
    icon: '🏹',
    audioId: 'const-orion',
    mainStar: 'Betelgeuse',
    starsCount: 7,
    description: 'O Gigante Caçador que brilha no céu de todo o mundo!',
    lore: 'Betelgeuse, sua estrela pulsante, é tão grande que se estivesse aqui, engoliria a Terra e Júpiter! 🤯',
    stars: [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 40, y: 50 }, { x: 50, y: 48 }, { x: 60, y: 46 }, { x: 35, y: 80 }, { x: 65, y: 80 }],
    lines: ['M 30 20 L 40 50', 'M 70 20 L 60 46', 'M 40 50 L 50 48 L 60 46', 'M 40 50 L 35 80', 'M 60 46 L 65 80']
  },
  {
    id: 'tres-marias',
    name: 'Três Marias',
    shortName: '3 Marias',
    color: '#FFB703',
    icon: '✨',
    audioId: 'const-marias',
    mainStar: 'Alnilam',
    starsCount: 3,
    description: 'As três famosas estrelas irmãs do cinturão de Órion.',
    lore: 'Na verdade, elas estão a anos-luz de distância umas das outras, mas do nosso ponto de vista formam uma linha perfeita! 📏',
    stars: [{ x: 35, y: 50 }, { x: 50, y: 50 }, { x: 65, y: 50 }],
    lines: ['M 35 50 L 50 50 L 65 50']
  },
  {
    id: 'cruzeiro',
    name: 'Cruzeiro do Sul',
    shortName: 'Cruzeiro',
    icon: '✨',
    color: '#A2D2FF',
    audioId: 'const-cruzeiro',
    mainStar: 'Acrux',
    starsCount: 5,
    description: 'A mais famosa constelação do céu do sul, presente em nossa bandeira e usada por navegadores há séculos.',
    lore: 'Até hoje, viajantes e marinheiros olham para ela para saber onde fica o Polo Sul geográfico! 🧭',
    stars: [{ x: 50, y: 20 }, { x: 50, y: 80 }, { x: 20, y: 45 }, { x: 80, y: 45 }, { x: 60, y: 65 }],
    lines: ['M 50 20 L 50 80 M 35 45 L 65 45']
  },
  {
    id: 'aries',
    name: 'Áries',
    color: '#FFB703',
    icon: '♈',
    audioId: 'const-aries',
    mainStar: 'Hamal',
    starsCount: 4,
    description: 'O Carneiro Corajoso que abre o caminho do Zodíaco.',
    lore: 'Na mitologia grega, representa o carneiro voante com lã de ouro que salvou crianças em perigo! 🐏✨',
    stars: [{ x: 20, y: 30 }, { x: 50, y: 25 }, { x: 75, y: 40 }, { x: 80, y: 55 }],
    lines: ['M 20 30 L 50 25 L 75 40 L 80 55']
  },
  {
    id: 'touro',
    name: 'Touro',
    color: '#FFD166',
    icon: '♉',
    audioId: 'const-touro',
    mainStar: 'Aldebaran',
    starsCount: 13,
    description: 'O Touro furioso com um olho vermelho brilhante!',
    lore: 'Sua estrela Aldebaran brilha como fogo no céu. Ele guarda as famosas Sete Irmãs (Plêiades)! 🐂🔥',
    stars: [{ x: 20, y: 15 }, { x: 40, y: 40 }, { x: 50, y: 50 }, { x: 60, y: 40 }, { x: 80, y: 15 }, { x: 45, y: 70 }, { x: 55, y: 70 }],
    lines: ['M 20 15 L 40 40 L 50 50 L 60 40 L 80 15', 'M 40 40 L 45 70', 'M 60 40 L 55 70']
  },
  {
    id: 'gemeos',
    name: 'Gêmeos',
    color: '#FFB703',
    icon: '♊',
    audioId: 'const-gemeos',
    mainStar: 'Castor e Pollux',
    starsCount: 10,
    description: 'Os irmãos gêmeos que representam a amizade eterna.',
    lore: 'Castor e Pollux eram tão amigos que quiseram ficar juntos para sempre brilhar no céu! 👬✨',
    stars: [{ x: 30, y: 15 }, { x: 30, y: 35 }, { x: 35, y: 60 }, { x: 40, y: 85 }, { x: 60, y: 15 }, { x: 60, y: 35 }, { x: 65, y: 60 }, { x: 70, y: 85 }],
    lines: ['M 30 15 L 30 35 L 35 60 L 40 85', 'M 60 15 L 60 35 L 65 60 L 70 85', 'M 30 15 L 60 15']
  },
  {
    id: 'cancer',
    name: 'Câncer',
    color: '#FFD166',
    icon: '♋',
    audioId: 'const-cancer',
    mainStar: 'Tarf',
    starsCount: 5,
    description: 'O Caranguejo Guardião, protetor das estrelas de berçário.',
    lore: 'É uma constelação discreta, mas abriga o "Presépio", um lugar onde milhares de estrelas nascem! 🦀🌌',
    stars: [{ x: 50, y: 20 }, { x: 50, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }],
    lines: ['M 50 20 L 50 50', 'M 50 50 L 30 75', 'M 50 50 L 70 75']
  },
  {
    id: 'leao',
    name: 'Leão',
    color: '#FFB703',
    icon: '♌',
    audioId: 'const-leao',
    mainStar: 'Regulus',
    starsCount: 9,
    description: 'O Rei da Selva Estelar que ruge no céu noturno.',
    lore: 'Foi o heróico Leão de Nemeia na mitologia. Seu rastro indica que a primavera está chegando! 🦁👑',
    stars: [{ x: 65, y: 20 }, { x: 50, y: 40 }, { x: 70, y: 70 }, { x: 30, y: 45 }, { x: 15, y: 60 }],
    lines: ['M 65 20 L 50 40 L 70 70 L 30 45 L 15 60', 'M 70 70 L 30 45']
  },
  {
    id: 'virgem',
    name: 'Virgem',
    color: '#FFD166',
    icon: '♍',
    audioId: 'const-virgem',
    mainStar: 'Spica',
    starsCount: 12,
    description: 'A Deusa da Colheita segurando uma espiga de trigo.',
    lore: 'Spica, sua estrela azul, brilha como uma joia preciosa. Ela representa a pureza e o trabalho! 🌾✨',
    stars: [{ x: 40, y: 15 }, { x: 30, y: 40 }, { x: 50, y: 45 }, { x: 70, y: 40 }, { x: 80, y: 60 }, { x: 55, y: 80 }],
    lines: ['M 40 15 L 30 40 L 50 45 L 70 40 L 80 60', 'M 50 45 L 55 80']
  },
  {
    id: 'libra',
    name: 'Libra',
    color: '#FFB703',
    icon: '♎',
    audioId: 'const-libra',
    mainStar: 'Zubeneschamali',
    starsCount: 4,
    description: 'A Balança da Justiça que equilibra o dia e a noite.',
    lore: 'É a única constelação do Zodíaco que não é uma criatura viva, mas um instrumento de medida! ⚖️⚖️',
    stars: [{ x: 50, y: 15 }, { x: 30, y: 45 }, { x: 70, y: 45 }, { x: 50, y: 75 }],
    lines: ['M 50 15 L 30 45 L 70 45 L 50 75', 'M 50 15 L 50 75']
  },
  {
    id: 'escorpiao',
    name: 'Escorpião',
    color: '#FFD166',
    icon: '🦂',
    audioId: 'const-escorpiao',
    mainStar: 'Antares',
    starsCount: 15,
    description: 'Uma criatura gigante com um veneno estrela na ponta da cauda.',
    lore: 'Antares é chamada de "Coração do Escorpião" por ser uma estrela supergigante vermelha de tirar o fôlego! 🦂❤️',
    stars: [{ x: 35, y: 20 }, { x: 50, y: 35 }, { x: 55, y: 55 }, { x: 70, y: 70 }, { x: 90, y: 65 }, { x: 90, y: 50 }],
    lines: ['M 35 20 L 50 35 L 55 55 L 70 70 L 90 65 L 90 50']
  },
  {
    id: 'sagitario',
    name: 'Sagitário',
    color: '#FFB703',
    icon: '🏹',
    audioId: 'const-sagitario',
    mainStar: 'Kaus Australis',
    starsCount: 12,
    description: 'O Centauro Arqueiro que aponta para o centro da galáxia.',
    lore: 'Sua flecha aponta exatamente para onde fica o buraco negro gigante no centro da Via Láctea! 🌌🏹',
    stars: [{ x: 30, y: 50 }, { x: 50, y: 40 }, { x: 70, y: 50 }, { x: 50, y: 70 }, { x: 85, y: 35 }],
    lines: ['M 30 50 L 50 40 L 70 50 L 50 70 L 30 50', 'M 70 50 L 85 35']
  },
  {
    id: 'capricornio',
    name: 'Capricórnio',
    color: '#FFD166',
    icon: '♑',
    audioId: 'const-capricornio',
    mainStar: 'Deneb Algedi',
    starsCount: 10,
    description: 'A Cabra-Peixe mística que escala as montanhas e cruza os mares.',
    lore: 'Uma das constelações mais antigas, datando de muito antes das pirâmides do Egito! 🐐🐟',
    stars: [{ x: 20, y: 35 }, { x: 45, y: 65 }, { x: 75, y: 65 }, { x: 80, y: 25 }, { x: 50, y: 40 }],
    lines: ['M 20 35 L 45 65 L 75 65 L 80 25 L 50 40 L 20 35']
  },
  {
    id: 'aquario',
    name: 'Aquário',
    color: '#FFB703',
    icon: '♒',
    audioId: 'const-aquario',
    mainStar: 'Sadalsuud',
    starsCount: 15,
    description: 'O Carregador de Água que rega as outras constelações.',
    lore: 'Ele despeja o "rio estelar" que dá vida às histórias que vemos nas estrelas! 🏺🌊',
    stars: [{ x: 10, y: 40 }, { x: 30, y: 35 }, { x: 50, y: 50 }, { x: 70, y: 65 }, { x: 90, y: 60 }],
    lines: ['M 10 40 L 30 35 L 50 50 L 70 65 L 90 60']
  },
  {
    id: 'peixes',
    name: 'Peixes',
    color: '#FFD166',
    icon: '♓',
    audioId: 'const-peixes',
    mainStar: 'Alpherg',
    starsCount: 18,
    description: 'Dois Peixes cósmicos unidos por um laço estrela.',
    lore: 'Eles estão ligados por uma corda de estrelas para que nunca se separem na vastidão do oceano espacial! 🐟🐟',
    stars: [{ x: 15, y: 15 }, { x: 35, y: 35 }, { x: 50, y: 50 }, { x: 65, y: 70 }, { x: 85, y: 85 }],
    lines: ['M 15 15 L 35 35 L 50 50 L 65 70 L 85 85']
  }
]

const INTRO_COLORS: Record<string, string> = {
  'O que são?': '#FFD166',
  'Navegação': '#A2D2FF',
  'Astronomia': '#BDE0FE',
  'Zodíaco': '#FFB703'
}

export default function ConstellationsChapter() {
  const [selectedId, setSelectedId] = useState<ConstellationId | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [activeStatDetail, setActiveStatDetail] = useState<{ label: string; value: string } | null>(null)
  const [activeIntroStat, setActiveIntroStat] = useState<{ label: string; value: string; hint: string } | null>(null)
  
  const { setActiveNarration, setThemeColor, canStartLocal, setCanStartLocal } = useNarrationSequence()

  // Sincroniza com o botão de lâmpada (reset da tela inicial)
  useEffect(() => {
    if (!canStartLocal) {
      setSelectedId(null)
      setRevealed(false)
      setActiveStatDetail(null)
      setActiveIntroStat(null)
    }
  }, [canStartLocal])

  const activeConstellation = CONSTELLATIONS.find(c => c.id === selectedId)

  useEffect(() => {
    if (canStartLocal && !selectedId && revealed === false) {
      // Pequeno delay para respirar entre a intro do capítulo e o início do Orion
      const timer = setTimeout(() => {
        setSelectedId('orion')
        setRevealed(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [canStartLocal, selectedId, revealed]) 

  // 2. Atualiza o Théo Global para constelações específicas
  useEffect(() => {
    if (canStartLocal && selectedId && activeConstellation) {
      const specific = getNarrationById(activeConstellation.audioId)
      
      // Toca a narração sempre que mudar de constelação, independente de estar revelado ou não.
      // Isso resolve o problema de o usuário clicar e não ouvir nada
      if (specific) {
        setActiveNarration(specific)
      }
      
      setThemeColor(activeConstellation.color)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, canStartLocal, setActiveNarration, setThemeColor, activeConstellation])

  const handleSelect = (id: ConstellationId) => {
    setSelectedId(id)
    setRevealed(true)
    
    // Se o áudio principal (introdução) ainda estiver tocando e o usuário clicar,
    // nós interrompemos a intro liberando o modo local imediatamente
    if (!canStartLocal) {
      setCanStartLocal(true)
    }

    // Centraliza o item clicado no dock automaticamente
    const element = document.getElementById(`const-dock-${id}`)
    if (element) {
       element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }

  const handleReveal = () => {
    if (selectedId && !revealed) setRevealed(true)
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.mainContent}>
        {/* Espaço do Céu Noturno */}
        <div 
          className={`${styles.skyPanel} ${revealed ? styles.isRevealed : ''}`}
          onClick={handleReveal}
          style={{ '--const-color': activeConstellation?.color || '#FFD166' } as React.CSSProperties}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleReveal() }}
          aria-label={activeConstellation ? `Visualização de ${activeConstellation.name}. Toque para ligar as estrelas.` : 'Céu estrelado. Selecione uma constelação.'}
        >
          {activeConstellation ? (
            <>
              {!revealed && (
                <div className={styles.clickHint}>
                  <span className={styles.pulseDot} />
                  Toque nas estrelas para ligar os pontos!
                </div>
              )}

              <div className={styles.starryBg} />

              <svg className={styles.svgLayer} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <g className={styles.artGroup}>
                  <text x="50" y="55" className={styles.emojiArt} textAnchor="middle" dominantBaseline="middle">
                    {activeConstellation.icon}
                  </text>
                </g>

                <g className={styles.linesGroup}>
                  {activeConstellation.lines.map((pathStr, idx) => (
                    <path key={idx} d={pathStr} className={styles.connectLine} />
                  ))}
                </g>

                <g className={styles.starsGroup}>
                  {activeConstellation.stars.map((star, idx) => (
                    <circle
                      key={idx}
                      cx={star.x}
                      cy={star.y}
                      r="2.5"
                      className={styles.starDot}
                    />
                  ))}
                </g>
              </svg>
            </>
          ) : (
            <div className={styles.emptySky}>
              <div className={styles.starryBg} />
              
              {/* Sci-Fi Observatory HUD */}
              <div className={styles.observatoryHUD}>
                <div className={styles.gridOverlay} />
                <div className={styles.compassMarkers}>
                  <div className={styles.marker} data-dir="N">000°</div>
                  <div className={styles.marker} data-dir="L">090°</div>
                  <div className={styles.marker} data-dir="S">180°</div>
                  <div className={styles.marker} data-dir="O">270°</div>
                </div>
                
                <div className={styles.radarConcentric}>
                  <div className={styles.radarRing} />
                  <div className={styles.radarRing} />
                  <div className={styles.radarRing} />
                </div>
                
                <div className={styles.coordinateLabels}>
                  <span className={styles.coordX}>RA: 05h 35m 17s</span>
                  <span className={styles.coordY}>DEC: -05° 23' 28"</span>
                </div>

                <div className={styles.dataNodes}>
                  <div className={styles.node} style={{ top: '20%', left: '30%' }} />
                  <div className={styles.node} style={{ top: '60%', left: '70%' }} />
                  <div className={styles.node} style={{ top: '40%', left: '80%' }} />
                </div>

                <div className={styles.viewfinder}>
                  <div className={styles.corner} />
                  <div className={styles.corner} />
                  <div className={styles.corner} />
                  <div className={styles.corner} />
                </div>
              </div>

              <div className={styles.selectPrompt}>
                <div className={styles.floatingIcons}>
                  <span className={styles.smallStar}>✨</span>
                  <span className={styles.smallStar}>⭐</span>
                </div>
                <div className={styles.telescopeContainer}>
                  <span className={styles.mainIcon}>🔭</span>
                  <div className={styles.waveEffect} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Painel de Informações */}
        <div className={styles.infoPanel}>
          {activeConstellation ? (
            <>
              <header className={styles.infoHeader}>
                <div className={styles.badge}>Constelação</div>
                <h2 className={styles.title}>{activeConstellation.name}</h2>
                <p className={styles.description}>{activeConstellation.description}</p>
              </header>

              <div className={styles.statsGrid}>
                {[
                  { label: 'Estrela Principal', value: revealed ? activeConstellation.mainStar : '???' },
                  { label: 'Total de Estrelas', value: revealed ? `${activeConstellation.starsCount}` : '???' },
                ].map((stat, i) => (
                  <button 
                    key={stat.label} 
                    className={`${styles.statCard} ${styles.clickable} ${revealed ? styles.revealedCard : ''}`}
                    style={{ transitionDelay: `${100 * (i + 1)}ms` }}
                    onClick={() => {
                      if (revealed) setActiveStatDetail(stat)
                    }}
                    disabled={!revealed}
                  >
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={styles.statValue}>{stat.value}</span>
                  </button>
                ))}
              </div>

              {revealed && (
                <div className={`${styles.funFactCard} ${styles.visible}`}>
                  <div className={styles.funFactIcon}>
                    <span>✨</span>
                    Dica do Théo
                  </div>
                  <p className={styles.funFactText}>{activeConstellation.lore}</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.infoBox}>
              <header className={styles.infoHeader}>
                <h2 className={styles.planetTitle}>Exploração Estelar</h2>
                <p className={styles.description}>
                  Os antigos olhavam para o céu e imaginavam desenhos ligando as estrelas. 
                  Hoje, usamos o telescópio para descobrir os segredos dessas figuras gigantes!
                </p>
              </header>

              <div className={styles.statsGrid}>
                {[
                  { label: 'O que são?', value: 'Padrões de Estrelas', hint: 'Desenhos no céu noturno.' },
                  { label: 'Navegação', value: 'GPS Natural', hint: 'Guia de antigos marinheiros.' },
                  { label: 'Astronomia', value: '88 Oficiais', hint: 'O céu está todo mapeado!' },
                  { label: 'Zodíaco', value: '12 Constelações', hint: 'O caminho do Sol no ano.' },
                ].map((stat) => (
                  <button 
                    key={stat.label} 
                    className={`${styles.statCard} ${styles.clickable}`}
                    onClick={() => setActiveIntroStat(stat)}
                  >
                    <div className={styles.statLabel}>{stat.label}</div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statHint}>{stat.hint}</div>
                  </button>
                ))}
              </div>

              {/* funFactCard de introdução removido conforme solicitação */}
            </div>
          )}
        </div>
      </div>

      {/* Dock de Seleção (Estilo Planetas) */}
      <nav className={styles.constellationDock}>
        <div className={styles.dockTrack}>
          {CONSTELLATIONS.map(c => (
            <button 
              key={c.id}
              id={`const-dock-${c.id}`}
              className={`${styles.dockItem} ${c.id === selectedId ? styles.active : ''}`}
              onClick={() => handleSelect(c.id)}
              style={{ '--c-color': c.color } as React.CSSProperties}
            >
              <div className={styles.dockCircle}>{c.icon}</div>
              <span className={styles.dockLabel}>{c.shortName || c.name}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Modal de Detalhes dos Stats */}
      {activeStatDetail && activeConstellation && (
        <div className={styles.statOverlay} onClick={() => setActiveStatDetail(null)}>
          <div 
            className={styles.statModal} 
            onClick={e => e.stopPropagation()}
            style={{ '--const-color': activeConstellation.color } as React.CSSProperties}
          >
            <button className={styles.modalClose} onClick={() => setActiveStatDetail(null)}>✕</button>
            <header className={styles.modalHeader}>
              <span className={styles.modalCategory}>
                {activeStatDetail.label}
              </span>
              <h3 className={styles.modalTitle}>{activeStatDetail.value}</h3>
            </header>
            <div className={styles.modalContent}>
              {activeStatDetail.label === 'Estrela Principal' && `A estrela ${activeStatDetail.value} é incrivelmente brilhante! Ela é a âncora dessa constelação. Em noites escuras e sem nuvens, você consegue ver ela piscando forte lá do espaço sideral! 🌟`}
              {activeStatDetail.label === 'Total de Estrelas' && `Essa constelação foca em ${activeStatDetail.value} estrelas principais para poder desenhar a figura de ${activeConstellation.name} no céu! Mas lembre-se: existem muitos milhares de outras estrelas espalhadas nessa mesma direção! ✨`}
              {activeStatDetail.label === 'Curiosidades' && activeConstellation.lore}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes Iniciados (Exploração Geral) */}
      {activeIntroStat && (
        <div className={styles.statOverlay} onClick={() => setActiveIntroStat(null)}>
          <div 
            className={styles.statModal} 
            onClick={e => e.stopPropagation()}
            style={{ '--const-color': INTRO_COLORS[activeIntroStat.label] || '#ffd166' } as React.CSSProperties}
          >
            <button className={styles.modalClose} onClick={() => setActiveIntroStat(null)}>✕</button>
            <header className={styles.modalHeader}>
              <span className={styles.modalCategory}>Guia de Astronomia</span>
              <h3 className={styles.modalTitle}>{activeIntroStat.label}</h3>
            </header>
            <div className={styles.modalContent}>
              <p style={{ whiteSpace: 'pre-line' }}>
                {INTRO_LORE[activeIntroStat.label]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
