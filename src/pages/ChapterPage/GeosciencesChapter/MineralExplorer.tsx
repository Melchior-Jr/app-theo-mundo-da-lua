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
  imgX?: number; 
  modelPath: string;
}

const ROCKS_DATA: RockSample[] = [
  // ÍGNEAS
  {
    id: 'basalto',
    name: 'Basalto',
    type: 'Ígnea',
    origin: 'Extrusiva (Vulcânica)',
    texture: 'Fina / Afanítica',
    formation: 'Resfriamento Rápido',
    explanation: 'O Basalto nasce da lava que esfria rapidamente ao tocar a superfície fria ou a água do mar.',
    description: 'É a rocha mais comum na crosta oceânica. Sua cor escura vem da abundância de ferro e magnésio. É extremamente resistente e forma colunas geométricas raras em alguns lugares do mundo.',
    tip: 'Vindo direto de erupções vulcânicas, o basalto é a prova viva da "reciclagem" da Terra! 🌋',
    color: '#333333',
    glow: 'rgba(100, 100, 100, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/basalto_1.glb'
  },
  {
    id: 'granito',
    name: 'Granito',
    type: 'Ígnea',
    origin: 'Intrusiva (Plutônica)',
    texture: 'Cristalina / Grosseira',
    formation: 'Resfriamento Lento',
    explanation: 'O Granito se forma a partir do resfriamento muito lento do magma no interior da crosta terrestre.',
    description: 'Composto por quartzo, feldspato e mica. Como esfria devagar, os minerais têm tempo para se organizar em cristais visíveis a olho nu. É uma das rochas mais duras do planeta.',
    tip: 'Olhe os brilhos! Cada ponto é um mineral diferente que levou milhares de anos para "crescer". 🔥',
    color: '#deb887',
    glow: 'rgba(222, 184, 135, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/granito.glb'
  },
  {
    id: 'pedra-pomes',
    name: 'Pedra Pomes',
    type: 'Ígnea',
    origin: 'Extrusiva (Vulcânica)',
    texture: 'Vitreosa / Vesicular',
    formation: 'Resfriamento Hiper-rápido',
    explanation: 'Formada quando o magma carregado de gás é expelido violentamente e esfria quase instantaneamente.',
    description: 'Ela é tão cheia de bolhas de ar que é a única rocha que consegue flutuar na água! Na antiguidade, era usada para polir ferramentas e em cuidados de beleza.',
    tip: 'Pesa quase nada e flutua! É basicamente um "espumante" de rocha vulcânica. 🧼',
    color: '#c0c0c0',
    glow: 'rgba(192, 192, 192, 0.3)',
    modelPath: '/3D%20Model/rochas-e-minerais/pedra-pomes.glb'
  },

  // SEDIMENTARES
  {
    id: 'arenito',
    name: 'Arenito',
    type: 'Sedimentar',
    origin: 'Clástica (Deposição)',
    texture: 'Granular / Arenosa',
    formation: 'Compactação de Areia',
    explanation: 'Formado pelo acúmulo de grãos de areia (geralmente quartzo) que foram cimentados por minerais.',
    description: 'É a rocha que forma paisagens icônicas como o Grand Canyon. Suas camadas coloridas indicam diferentes momentos da história da Terra, revelando onde já existiram rios ou desertos.',
    tip: 'É como areia de praia que alguém resolveu colar com cimento natural após milhões de anos! 🏜️',
    color: '#d4a373',
    glow: 'rgba(212, 163, 115, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/arenito.glb'
  },
  {
    id: 'argilito',
    name: 'Argilito',
    type: 'Sedimentar',
    origin: 'Clástica',
    texture: 'Muito Fina / Lisa',
    formation: 'Compactação de Argila',
    explanation: 'Originada da sedimentação de lamas e argilas em águas calmas, como lagos ou fundos oceânicos.',
    description: 'Por ser formada por partículas tão minúsculas, ela é muito boa para preservar fósseis de plantas e animais pequenos. É a origem do xisto, uma rocha muito usada na indústria.',
    tip: 'Essa rocha é a "biblioteca" da Terra: ela guardou os segredos de lagos antigos por milhões de anos. 📜',
    color: '#8d6e63',
    glow: 'rgba(141, 110, 99, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/argilito.glb'
  },
  {
    id: 'travertino',
    name: 'Travertino Romano',
    type: 'Sedimentar',
    origin: 'Química (Precipitação)',
    texture: 'Vesicular / Porosa',
    formation: 'Deposição em Fontes',
    explanation: 'Nasce da precipitação de carbonato de cálcio em fontes termais e cavernas de calcário.',
    description: 'Muito famoso por ter sido usado na construção do Coliseu em Roma. Possui buraquinhos naturais que dão um charme rústico e sofisticado. É uma rocha que "nasce" da água.',
    tip: 'Imagine se a água de uma cachoeira virasse pedra... o Travertino é quase isso! 🏛️',
    color: '#e3d5ca',
    glow: 'rgba(227, 213, 202, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/travertino_romano.glb'
  },
  {
    id: 'calcario',
    name: 'Calcário',
    type: 'Sedimentar',
    origin: 'Bioquímica / Química',
    texture: 'Variável',
    formation: 'Acúmulo de Conchas',
    explanation: 'Formado principalmente pelo acúmulo de esqueletos de corais e conchas no fundo do mar.',
    description: 'É a matéria-prima do cimento e do cal. É muito sensível a ácidos, o que cria as magníficas cavernas com estalactites e estalagmites que visitamos.',
    tip: 'Essa pedra já foi viva! Quase todo o calcário do mundo foi feito por bicho marinho. 🐚',
    color: '#cfd8dc',
    glow: 'rgba(207, 216, 220, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/calcario.glb'
  },

  // METAMÓRFICAS
  {
    id: 'gnaisse',
    name: 'Gnaisse',
    type: 'Metamórfica',
    origin: 'Alta Pressão e Calor',
    texture: 'Foliada (Em Listras)',
    formation: 'Recristalização',
    explanation: 'Resultante da metamorfose de rochas como o granito, sob condições extremas de pressão.',
    description: 'O famoso Pão de Açúcar no Rio de Janeiro é feito de gnaisse! Suas listras claras e escuras mostram como os minerais foram espremidos e organizados em camadas pelo peso da Terra.',
    tip: 'É um Granito que foi tão esmagado que seus minerais entraram na fila e fizeram listras! 🦓',
    color: '#b0bec5',
    glow: 'rgba(176, 190, 197, 0.4)',
    modelPath: '/3D%20Model/rochas-e-minerais/gnaisse.glb'
  },
  {
    id: 'quartzito',
    name: 'Quartzito',
    type: 'Metamórfica',
    origin: 'Metamorfismo',
    texture: 'Cristalina / Dura',
    formation: 'Fusão de Grãos',
    explanation: 'Nasce quando o arenito é submetido a calor e pressão, fundindo os grãos de areia em uma massa sólida.',
    description: 'É uma das rochas mais resistentes ao intemperismo (chuva e vento). Por ser feita quase só de quartzo, ela brilha muito sob o sol e é usada em fachadas de casas modernas.',
    tip: 'O Arenito subiu de nível! Agora ele é super duro e brilha como cristal. ✨',
    color: '#edf2f4',
    glow: 'rgba(237, 242, 244, 0.5)',
    modelPath: '/3D%20Model/rochas-e-minerais/quartzito.glb'
  },
  {
    id: 'marmore-calc',
    name: 'Mármore Calcítico',
    type: 'Metamórfica',
    origin: 'Metamorfismo Regional',
    texture: 'Macia / Granular',
    formation: 'Recristalização',
    explanation: 'Resulta da transformação do calcário sob altas temperaturas e pressões.',
    description: 'Desde a Grécia Antiga, é a rocha preferida de escultores como Michelangelo. Seus veios são minerais que "vazaram" enquanto a rocha ainda estava mole e quente no subsolo.',
    tip: 'É o Calcário que passou por um "spa" geológico de calor e virou uma obra de arte! 🎨',
    color: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.6)',
    modelPath: '/3D%20Model/rochas-e-minerais/marmore_calcitico.glb'
  },
  {
    id: 'lapis-lazuli',
    name: 'Lápis-lazúli',
    type: 'Metamórfica',
    origin: 'Metamorfismo de Contato',
    texture: 'Cristalina / Azul',
    formation: 'Fusão Química',
    explanation: 'Uma rocha rara formada pelo contato do magma com calcários complexos.',
    description: 'Sua cor azul celestial vem do mineral lazurita. Foi usada nas joias dos faraós do Egito e moída para criar a tinta "azul ultramar" usada pelos pintores do Renascimento.',
    tip: 'A rocha dos reis! Sua cor azul é única na natureza e já valeu mais que ouro. 🟦',
    color: '#0d47a1',
    glow: 'rgba(13, 71, 161, 0.6)',
    modelPath: '/3D%20Model/rochas-e-minerais/lapis-lazuli.glb'
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
                
                <div className={styles.rockWrapper}>
                  <model-viewer
                    key={currentRock.id}
                    src={currentRock.modelPath}
                    alt={currentRock.name}
                    {...({ autoplay: true } as any)}
                    camera-controls
                    auto-rotate
                    interaction-prompt="auto"
                    camera-orbit="0deg 75deg 5m"
                    shadow-intensity="0.5"
                    environment-image="neutral"
                    exposure="1.0"
                    draco-decoder-url="https://www.gstatic.com/draco/v1/decoders/"
                    style={{ width: '100%', height: '100%', minHeight: '350px', outline: 'none' }}
                  />
                </div>

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
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('textura')}>
                <div className={styles.statHeader}>
                  <LucideLayers size={16} />
                  <label>TEXTURA</label>
                </div>
                <span>{currentRock.texture}</span>
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('formacao')}>
                <div className={styles.statHeader}>
                  <Activity size={16} />
                  <label>FORMAÇÃO</label>
                </div>
                <span>{currentRock.formation}</span>
              </div>

              <div className={styles.statBox} onClick={() => setActiveModal('classificacao')}>
                <div className={styles.statHeader}>
                  <label>CLASSE</label>
                </div>
                <span>{currentRock.type}</span>
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
                  background: rock.color,
                  borderRadius: '10px',
                  boxShadow: `0 0 10px ${rock.glow}`
                }}
              />
              <span>{rock.name}</span>
            </button>
          ))}
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
