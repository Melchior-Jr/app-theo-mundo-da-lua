import { useState, useEffect } from 'react'
import styles from './GeosciencesChapter.module.css'
import '@google/model-viewer'


const LAYERS = [
  {
    id: 'crosta',
    name: 'Crosta Terrestre',
    depth: '0 - 70 km',
    temp: '20°C a 500°C',
    state: 'Sólido',
    composition: 'Silicatos e Alumínio',
    description: 'A camada mais fina e externa da Terra. É dividida em placas tectônicas que "flutuam" sobre o manto.',
    tip: 'É como a casca de uma maçã, bem fininha comparada ao resto do planeta!',
    color: '#deb887',
    tempColor: '#ffecb3',
    pressureColor: '#e1f5fe',
    range: [0, 5],
    details: {
      depth: 'A crosta é onde pisamos. Sob os oceanos ela é fininha (5-10km), mas sob as montanhas pode chegar a 70km!',
      temp: 'Na superfície é fria, mas conforme descemos, a temperatura sobe 3°C a cada 100 metros. No fundo já passa de 500°C!',
      state: 'É totalmente sólida e quebradiça, dividida em grandes pedaços chamados placas tectônicas.',
      composition: 'Feita basicamente de rochas como granito e basalto. É a camada com mais oxigênio e silício.'
    }
  },
  {
    id: 'manto',
    name: 'Manto do Planeta',
    depth: '70 - 2.900 km',
    temp: '500°C a 3.700°C',
    state: 'Sólido Plástico',
    composition: 'Peridotito e Magnésio',
    description: 'A maior camada da Terra! O calor faz as rochas ficarem pastosas, movendo-se lentamente como um mel grosso.',
    tip: 'Imagine um chiclete muito quente, ele não é líquido, mas consegue se moldar devagar.',
    color: '#cd853f',
    tempColor: '#ffd54f',
    pressureColor: '#81d4fa',
    range: [5, 60],
    details: {
      depth: 'O manto é colossal! Ele representa cerca de 84% do volume total da Terra.',
      temp: 'O calor aqui gera correntes de convecção — o material quente sobe e o frio desce, movendo os continentes lá em cima!',
      state: 'Devido à alta temperatura, ele se comporta como um plástico quente que pode fluir sob pressão ao longo de milhões de anos.',
      composition: 'Composto principalmente por olivina e piroxênio. É aqui que o magma é formado antes de subir aos vulcões.'
    }
  },
  {
    id: 'nucleo-externo',
    name: 'Núcleo Externo',
    depth: '2.900 - 5.150 km',
    temp: '4.000°C a 5.000°C',
    state: 'Líquido',
    composition: 'Ferro e Níquel Líquidos',
    description: 'Uma tempestade de metal derretido que gira sem parar, criando o campo magnético da Terra.',
    tip: 'Este metal girando funciona como um escudo invisível que nos protege do Sol!',
    color: '#d32f2f',
    tempColor: '#ff8f00',
    pressureColor: '#039be5',
    range: [60, 85],
    details: {
      depth: 'Começa a 2.900km abaixo dos nossos pés. É uma camada de metal derretido com mais de 2.000km de espessura!',
      temp: 'É quente o suficiente para transformar qualquer metal sólido em "água" metálica.',
      state: 'Totalmente líquido! O movimento desse metal gera correntes elétricas gigantescas.',
      composition: 'Uma mistura fervente de 80% ferro, níquel e alguns outros elementos leves como oxigênio.'
    }
  },
  {
    id: 'nucleo-interno',
    name: 'Núcleo Interno',
    depth: '5.150 - 6.371 km',
    temp: 'Aprox. 6.000°C',
    state: 'Sólido',
    composition: 'Ferro e Níquel Sólidos',
    description: 'O coração da Terra! É uma bola de metal sólido tão quente quanto a superfície do Sol.',
    tip: 'Embora seja o lugar mais quente, o peso de todo o planeta acima o mantém sólido!',
    color: '#ffeb3b',
    tempColor: '#ff6f00',
    pressureColor: '#01579b',
    range: [85, 100],
    details: {
      depth: 'Você chegou ao centro absoluto! O raio desta bola de metal é de cerca de 1.220 quilômetros.',
      temp: 'Incriveis 6.000°C! É tão quente quanto a camada visível do Sol.',
      state: 'SÓLIDO! A pressão aqui é 3,6 milhões de vezes maior que na superfície, comprimindo os átomos de metal.',
      composition: 'Quase totalmente feito de ferro e níquel puros e cristalizados devido à pressão extrema.'
    }
  }
]

export default function EarthLayers() {
  const [selectedLayerId, setSelectedLayerId] = useState('crosta')
  const [depthValue, setDepthValue] = useState(0)
  const [infoModal, setInfoModal] = useState<{ title: string, content: string } | null>(null)

  const activeLayer = LAYERS.find(l => l.id === selectedLayerId) || LAYERS[0]


  useEffect(() => {
    const layer = LAYERS.find(l => depthValue >= l.range[0] && depthValue <= l.range[1])
    if (layer && layer.id !== selectedLayerId) {
      setSelectedLayerId(layer.id)
    }
  }, [depthValue, selectedLayerId])

  return (
    <div className={styles.courseWrapper}>
      <main className={styles.mainCard}>
        <header className={styles.layerMainHeader}>
          <h2 className={styles.layerTitle}>{activeLayer.name}</h2>
        </header>

        <div className={styles.cardSplit}>
          <section className={styles.visualArea}>
            <div className={styles.viewerContainer}>
              <div className={styles.earthCorteWrapper}>
                <model-viewer
                  src="/3D%20Model/earths_interior.glb"
                  alt="Interior da Terra em 3D"
                  {...({ autoplay: true } as any)}
                  camera-controls
                  camera-orbit="90deg 75deg auto"
                  shadow-intensity="1"
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="auto"
                  loading="eager"
                  reveal="auto"
                  style={{ width: '100%', height: '100%', minHeight: '400px', outline: 'none' }}
                >
                  {/* Hotspots para destacar as camadas */}
                  <button 
                    className={`${styles.hotspot} ${activeLayer.id === 'crosta' ? styles.hotspotActive : ''}`}
                    slot="hotspot-1" 
                    data-position="0.4m 0.55m 0.35m" 
                    data-normal="1m 0m 0m"
                    onClick={() => setDepthValue(2)}
                  >
                    <div className={styles.hotspotAnnotation}>1</div>
                  </button>

                  <button 
                    className={`${styles.hotspot} ${activeLayer.id === 'manto' ? styles.hotspotActive : ''}`}
                    slot="hotspot-2" 
                    data-position="0.4m 0.45m -0.15m" 
                    data-normal="1m 0m 0m"
                    onClick={() => setDepthValue(25)}
                  >
                    <div className={styles.hotspotAnnotation}>2</div>
                  </button>

                  <button 
                    className={`${styles.hotspot} ${activeLayer.id === 'nucleo-externo' ? styles.hotspotActive : ''}`}
                    slot="hotspot-3" 
                    data-position="0.4m 0.28m -0.85m" 
                    data-normal="1m 0m 0m"
                    onClick={() => setDepthValue(70)}
                  >
                    <div className={styles.hotspotAnnotation}>3</div>
                  </button>

                  <button 
                    className={`${styles.hotspot} ${activeLayer.id === 'nucleo-interno' ? styles.hotspotActive : ''}`}
                    slot="hotspot-4" 
                    data-position="0.4m 0.18m -1.45m" 
                    data-normal="1m 0m 0m"
                    onClick={() => setDepthValue(95)}
                  >
                    <div className={styles.hotspotAnnotation}>4</div>
                  </button>

                  <div className={styles.viewerOverlay}>
                    {activeLayer.name}
                  </div>
                </model-viewer>
              </div>


              <div className={styles.depthSliderArea}>
                <div className={styles.depthSliderContainer}>
                  <span className={styles.sliderTag}>SUPERFÍCIE</span>
                  <div className={styles.sliderWrapper} style={{ '--layer-color': activeLayer.color } as any}>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={depthValue} 
                      onChange={(e) => setDepthValue(Number(e.target.value))}
                      className={styles.horizontalSlider}
                    />
                    <div className={styles.sliderMarkers}>
                      {LAYERS.map(layer => (
                        <div 
                          key={layer.id} 
                          className={`${styles.marker} ${activeLayer.id === layer.id ? styles.markerActive : ''}`}
                          style={{ left: `${(layer.range[0] + layer.range[1]) / 2}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.sliderTag}>6.371 KM</span>
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.infoArea}>
            <div className={styles.infoCard} key={activeLayer.id}>

              <div className={styles.statsGrid}>
                <div className={styles.statBox} onClick={() => setInfoModal({ 
                  title: 'Entendendo a Profundidade', 
                  content: activeLayer.details.depth 
                })}>
                  <label>Profundidade</label>
                  <span>{activeLayer.depth}</span>
                </div>
                <div className={styles.statBox} onClick={() => setInfoModal({ 
                  title: 'O Calor da Terra', 
                  content: activeLayer.details.temp 
                })}>
                  <label>Temperatura</label>
                  <span className={styles.tempVal}>{activeLayer.temp}</span>
                </div>
                <div className={styles.statBox} onClick={() => setInfoModal({ 
                  title: 'Sólido ou Líquido?', 
                  content: activeLayer.details.state 
                })}>
                  <label>Estado Físico</label>
                  <span>{activeLayer.state}</span>
                </div>
                <div className={styles.statBox} onClick={() => setInfoModal({ 
                  title: 'A Receita do Planeta', 
                  content: activeLayer.details.composition 
                })}>
                  <label>Composição</label>
                  <span>{activeLayer.composition}</span>
                </div>
              </div>

              <div className={styles.explanationBox}>
                <p>{activeLayer.description}</p>
              </div>

              <div className={styles.theoTipMini}>
                <div className={styles.theoAvatar}>🌔</div>
                <div className={styles.theoContent}>
                  <strong>Dica do Théo:</strong>
                  <p>{activeLayer.tip}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {infoModal && (
        <div className={styles.modalOverlay} onClick={() => setInfoModal(null)}>
          <div className={styles.infoModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setInfoModal(null)}>×</button>
            <div className={styles.modalGlow} />
            <h3 className={styles.modalTitle}>{infoModal.title}</h3>
            <p className={styles.modalBody}>{infoModal.content}</p>
            <div className={styles.modalAction}>
              <button className={styles.confirmBtn} onClick={() => setInfoModal(null)}>Entendi, Théo!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
