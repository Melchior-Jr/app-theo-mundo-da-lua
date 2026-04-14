import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Search, 
  RotateCcw, 
  LucideLayers, 
  Activity, 
  Flame, 
  Info,
  X
} from 'lucide-react';
import styles from './GeosciencesChapter.module.css';

// Imagem servida da pasta public
const ASSET_URL = '/geociencias_amostras_minerais_1776143071673.png';

interface RockSample {
  id: string;
  name: string;
  type: string;
  origin: string;
  texture: string;
  formation: string;
  explanation: string;
  description: string;
  tip: string;
  color: string;
  glow: string;
  imgX: number; 
}

const ROCKS_DATA: RockSample[] = [
  {
    id: 'granito',
    name: 'Granito',
    type: 'Ígnea',
    origin: 'Intrusiva',
    texture: 'Cristalina',
    formation: 'Resfriamento lento',
    explanation: 'O Granito se forma a partir do resfriamento lento do magma no interior da crosta terrestre.',
    description: 'Possui minerais como Quartzo, Feldspato e Mica. É uma das rochas mais resistentes da natureza, sendo usada em monumentos há milênios.',
    tip: 'Observe os pontinhos brilhantes! Cada cor é um mineral diferente que se cristalizou devagar. 🔥',
    color: '#ffc1cc',
    glow: 'rgba(255, 193, 204, 0.4)',
    imgX: 0
  },
  {
    id: 'basalto',
    name: 'Basalto',
    type: 'Ígnea',
    origin: 'Extrusiva',
    texture: 'Fina',
    formation: 'Resfriamento rápido',
    explanation: 'O Basalto é fruto da lava que esfria rapidamente ao atingir a superfície fria da Terra.',
    description: 'É a rocha mais comum no fundo dos oceanos. Sua cor escura vem da abundância de ferro e magnésio. Muitas vezes possui pequenos furos causados por bolhas de gás.',
    tip: 'Essa aqui veio direto de uma erupção vulcânica! É a base da maioria das ilhas do Pacífico. 🌋',
    color: '#444',
    glow: 'rgba(100, 100, 100, 0.5)',
    imgX: 1
  },
  {
    id: 'arenito',
    name: 'Arenito',
    type: 'Sedimentar',
    origin: 'Deposição',
    texture: 'Granular',
    formation: 'Compactação de areia',
    explanation: 'Formado pela acumulação e cimentação de grãos de areia ao longo de milhões de anos.',
    description: 'Você consegue ver as camadas de deposição? Cada linha conta a história de rios, ventos ou mares que passaram por ali há eras.',
    tip: 'Passe a mão (visualmente) nela: parece areia colada, não é? No Grand Canyon, ela é a grande estrela! 🏜️',
    color: '#d4a373',
    glow: 'rgba(212, 163, 115, 0.4)',
    imgX: 2
  },
  {
    id: 'marmore',
    name: 'Mármore',
    type: 'Metamórfica',
    origin: 'Alta Pressão',
    texture: 'Lisa/Veteada',
    formation: 'Transformação física',
    explanation: 'O Mármore nasce de uma rocha calcária que sofreu calor e pressão intensos no interior da Terra.',
    description: 'Esse processo de "metamorfose" faz com que os minerais se recristalizem, criando os belos padrões de veios coloridos que amamos.',
    tip: 'Era uma rocha comum que virou algo nobre sob pressão. Uma verdadeira lição de resiliência geológica! ✨',
    color: '#fff',
    glow: 'rgba(255, 255, 255, 0.6)',
    imgX: 3
  }
];

const MineralExplorer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const currentRock = ROCKS_DATA[currentIndex];

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springX = useSpring(rotateX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 60, damping: 20 });

  const handleDrag = (_: any, info: any) => {
    rotateY.set(rotateY.get() + info.delta.x * 0.5);
    rotateX.set(rotateX.get() - info.delta.y * 0.5);
  };

  const resetRotation = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className={styles.courseWrapper}>
      <main className={styles.mainCard}>
        <header className={styles.layerMainHeader}>
          <h1 className={styles.layerTitle}>{currentRock.name}</h1>
        </header>

        <div className={styles.cardSplit}>
          <section className={styles.visualArea}>
            <div className={styles.viewerContainer}>
              <div className={styles.rockStage}>
                <div className={styles.spotlight} style={{ '--glow-color': currentRock.glow } as any} />
                
                <motion.div
                  className={styles.rockWrapper}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDrag={handleDrag}
                  style={{
                    rotateX: springX,
                    rotateY: springY,
                    scale: isZoomed ? 1.8 : 1,
                    perspective: 1000
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentRock.id}
                      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className={styles.rockImage}
                      style={{
                        backgroundImage: `url(${ASSET_URL})`,
                        backgroundPosition: `${currentRock.imgX * 33.33}% center`,
                        backgroundSize: '400% 100%',
                        borderRadius: '20px'
                      }}
                    />
                  </AnimatePresence>
                </motion.div>

                {isZoomed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.zoomOverlay}
                  >
                    🔍 Análise Molecular Ativa
                  </motion.div>
                )}
              </div>

              <div className={styles.visualToggles}>
                <button 
                  className={`${styles.toggleBtn} ${isZoomed ? styles.active : ''}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <Search size={18} /> {isZoomed ? 'Afastar' : '🔍 Ver Detalhes'}
                </button>
                <button className={styles.toggleBtn} onClick={resetRotation}>
                  <RotateCcw size={18} /> Resetar Posição
                </button>
              </div>

              <div className={styles.rockSelector}>
                {ROCKS_DATA.map((rock, idx) => (
                  <button
                    key={rock.id}
                    className={`${styles.rockIconBtn} ${currentIndex === idx ? styles.active : ''}`}
                    onClick={() => {
                        setCurrentIndex(idx);
                        setIsZoomed(false);
                        resetRotation();
                    }}
                  >
                    <div 
                      className={styles.rockThumb} 
                      style={{ 
                        backgroundImage: `url(${ASSET_URL})`,
                        backgroundPosition: `${rock.imgX * 33.33}% center`,
                        backgroundSize: '400% 100%'
                    }}
                    />
                    <span>{rock.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className={styles.infoArea}>
            <div className={styles.statsGrid}>
              <div className={styles.statBox} onClick={() => setActiveModal('origem')}>
                <div className={styles.statHeader}>
                  <Flame size={16} />
                  <label>TIPO/ORIGEM</label>
                </div>
                <span>{currentRock.origin}</span>
                <Info size={14} className={styles.infoIcon} />
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('textura')}>
                <div className={styles.statHeader}>
                  <LucideLayers size={16} />
                  <label>TEXTURA</label>
                </div>
                <span>{currentRock.texture}</span>
                <Info size={14} className={styles.infoIcon} />
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('formacao')}>
                <div className={styles.statHeader}>
                  <Activity size={16} />
                  <label>FORMAÇÃO</label>
                </div>
                <span>{currentRock.formation}</span>
                <Info size={14} className={styles.infoIcon} />
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('classificacao')}>
                <div className={styles.statHeader}>
                  <Info size={16} />
                  <label>CLASSE</label>
                </div>
                <span>{currentRock.type}</span>
                <Info size={14} className={styles.infoIcon} />
              </div>
            </div>

            <div className={styles.explanationBox}>
              <h3>Laboratório de Análise</h3>
              <p>{currentRock.description}</p>
            </div>

            <div className={styles.theoTipMini}>
              <div className={styles.theoAvatar}>🔭</div>
              <div className={styles.theoContent}>
                <strong>Dica do Théo</strong>
                <p>{currentRock.tip}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              className={styles.infoModal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className={styles.closeModal} onClick={() => setActiveModal(null)}>
                <X size={24} />
              </button>
              
              <h2 className={styles.modalTitle}>
                {activeModal === 'origem' && "Gênese Mineral"}
                {activeModal === 'textura' && "Análise Macrográfica"}
                {activeModal === 'formacao' && "Tempo Geológico"}
                {activeModal === 'classificacao' && "Classificação Científica"}
              </h2>

              <div className={styles.modalBody}>
                {activeModal === 'origem' && (
                   <p>A origem <strong>{currentRock.origin}</strong> indica como os minerais se organizaram inicialmente. No caso do {currentRock.name}, este processo envolve {currentRock.explanation.toLowerCase()}</p>
                )}
                {activeModal === 'textura' && (
                   <p>A textura <strong>{currentRock.texture}</strong> revela a velocidade de resfriamento ou a pressão sofrida. Grãos maiores indicam tempo lento de formação, enquanto texturas vítreas ou finas indicam eventos rápidos.</p>
                )}
                {activeModal === 'formacao' && (
                   <p>Processo de: <strong>{currentRock.formation}</strong>. Cada centímetro desta rocha pode representar milhares ou milhões de anos de depósitos e transformações químicas constantes.</p>
                )}
                {activeModal === 'classificacao' && (
                   <p>Cientificamente, é uma rocha <strong>{currentRock.type}</strong>. Isso define seu lugar no ciclo das rochas, conectando-a a outras formas através de processos de erosão, calor e pressão.</p>
                )}
              </div>

              <button className={styles.confirmBtn} onClick={() => setActiveModal(null)}>
                Entendido!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MineralExplorer;
