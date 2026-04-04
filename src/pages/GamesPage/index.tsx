import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import StarField from '@/components/StarField'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import styles from './GamesPage.module.css'

/* ═════════════════════════════════════════════════════════════
   GAME ILLUSTRATIONS — Estilo ChapterCard
   Fundo escuro #0d1525 · gradiente temático · icones/formas SVG
   Cada jogo tem paleta, decoração e clima únicos
═════════════════════════════════════════════════════════════ */

/** 🚀 Quiz Intergaláctico — Cérebro/Planeta Balão */
function QuizArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Planeta Cerebelo Sorridente */}
      <g transform="translate(80, 80)" className={styles.rocketFloat}>
        <circle cx="0" cy="0" r="40" fill="#4facfe" />
        {/* ranhuras (cérebro) bem fofas animadas / ou nuvenzinhas */}
        <path d="M-25,-15 Q0,-30 25,-15" fill="none" stroke="#8bf9ff" strokeWidth="6" strokeLinecap="round" />
        <path d="M-30,5 Q-10,-5 10,5 Q20,10 30,-5" fill="none" stroke="#74c9ff" strokeWidth="6" strokeLinecap="round" />
        <path d="M-20,25 Q0,10 20,25" fill="none" stroke="#8bf9ff" strokeWidth="6" strokeLinecap="round" />
        
        {/* Rostinho Gênio */}
        <line x1="-15" y1="0" x2="-5" y2="0" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <line x1="5" y1="0" x2="15" y2="0" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        {/* oculos grandão nerd */}
        <circle cx="-10" cy="-2" r="12" fill="none" stroke="#fff" strokeWidth="3" />
        <circle cx="10" cy="-2" r="12" fill="none" stroke="#fff" strokeWidth="3" />
        <line x1="-2" y1="-2" x2="2" y2="-2" stroke="#fff" strokeWidth="3" />
        
        {/* Sorriso simpatico */}
        <path d="M-5,15 Q0,20 5,15" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <text x="25" y="40" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="35" fill="#FFD166" opacity="0.9" className={styles.qFloat1}>?</text>
      <text x="135" y="110" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="26" fill="#8bf9ff" opacity="0.8" className={styles.qFloat2}>?</text>
      <text x="40" y="130" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="20" fill="#ff7096" opacity="0.9" className={styles.qFloat3}>!</text>
    </svg>
  )
}

/** ⚔️ Arena de Duelos — Espadinhas de Brinquedo */
function DuelArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Escudo Esquerdo fofinho */}
      <g transform="translate(45, 80)" className={styles.fighterLeft}>
        <path d="M-15,-20 Q0,-25 15,-20 L15,10 Q0,30 -15,10 Z" fill="#b5179e" />
        <path d="M-10,-15 Q0,-18 10,-15 L10,8 Q0,22 -10,8 Z" fill="#f72585" />
        {/* rostinho bravo mas fofo */}
        <line x1="-5" y1="-8" x2="0" y2="-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="-8" x2="0" y2="-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-5" cy="-2" r="1.5" fill="#fff" />
        <circle cx="5" cy="-2" r="1.5" fill="#fff" />
        <path d="M-2,6 Q0,4 2,6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        {/* Espadinha saindo de tras */}
        <line x1="5" y1="15" x2="25" y2="35" stroke="#FFD166" strokeWidth="6" strokeLinecap="round" />
        <circle cx="25" cy="35" r="3" fill="#ff9f1c" />
      </g>

      <text x="80" y="55" fontFamily="Outfit,sans-serif" fontWeight="950" fontSize="28" fill="#FFD166" textAnchor="middle" opacity="0.95" className={styles.vsBurst}>VS</text>

      {/* Escudo Direito fofinho */}
      <g transform="translate(115, 80)" className={styles.fighterRight}>
        <path d="M-15,-20 Q0,-25 15,-20 L15,10 Q0,30 -15,10 Z" fill="#2d6be4" />
        <path d="M-10,-15 Q0,-18 10,-15 L10,8 Q0,22 -10,8 Z" fill="#4facfe" />
        {/* rostinho bravo */}
        <line x1="-5" y1="-8" x2="0" y2="-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="-8" x2="0" y2="-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-5" cy="-2" r="1.5" fill="#fff" />
        <circle cx="5" cy="-2" r="1.5" fill="#fff" />
        <path d="M-2,6 Q0,4 2,6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        {/* Espadinha saindo de tras */}
        <line x1="-5" y1="15" x2="-25" y2="35" stroke="#8bf9ff" strokeWidth="6" strokeLinecap="round" />
        <circle cx="-25" cy="35" r="3" fill="#00b4d8" />
      </g>
    </svg>
  )
}

/** 🛸 Invasores — Tio Alien numa nave chiclete */
function InvasoresArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* UFO Fofinho */}
      <g transform="translate(80, 50)" className={styles.ufoFloat}>
        {/* Cockpit gelatina */}
        <path d="M-20,0 C-20,-15 20,-15 20,0 Z" fill="#8bf9ff" opacity="0.6" />
        {/* Marcianito cartoon */}
        <circle cx="0" cy="-5" r="8" fill="#39ff14" />
        <ellipse cx="-3" cy="-6" rx="2" ry="3" fill="#000" transform="rotate(-15 -3 -6)" />
        <ellipse cx="3" cy="-6" rx="2" ry="3" fill="#000" transform="rotate(15 3 -6)" />
        <circle cx="-3" cy="-7" r="1" fill="#fff" />
        <circle cx="3" cy="-7" r="1" fill="#fff" />
        <path d="M-2,-2 Q0,0 2,-2" fill="none" stroke="#124a0d" strokeWidth="1" strokeLinecap="round" />
        {/* Disco da nave (bem gordo) */}
        <ellipse cx="0" cy="0" rx="35" ry="12" fill="#06d6a0" />
        <ellipse cx="0" cy="-4" rx="20" ry="6" fill="#118ab2" />
        {/* Lâmpadas gordinhas */}
        <circle cx="-25" cy="0" r="3" fill="#ef476f" />
        <circle cx="0" cy="6" r="3" fill="#FFD166" />
        <circle cx="25" cy="0" r="3" fill="#ef476f" />
      </g>

      {/* Nave Jogador de Brinquedo */}
      <g transform="translate(80, 120)" className={styles.playerShip}>
        {/* Corpo bala/Dardo */}
        <path d="M0,-25 Q15,-5 10,15 L-10,15 Q-15,-5 0,-25 Z" fill="#0077b6" />
        <path d="M0,-25 Q8,-5 5,15 L-5,15 Q-8,-5 0,-25 Z" fill="#4facfe" />
        {/* Asinhas redondas */}
        <polygon points="-8,5 -25,15 -10,15" fill="#f72585" strokeLinejoin="round" />
        <polygon points="8,5 25,15 10,15" fill="#f72585" strokeLinejoin="round" />
        {/* Laser chiclete */}
        <line x1="0" y1="-30" x2="0" y2="-60" stroke="#FFD166" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 10" />
      </g>
    </svg>
  )
}

/** 🔭 Caça-Planetas — Luneta Super Gordinha */
function HuntArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Radar Fofinho e Suave */}
      <circle cx="80" cy="80" r="50" fill="none" stroke="#06d6a0" strokeWidth="4" opacity="0.3" strokeDasharray="10 10" />
      <circle cx="80" cy="80" r="25" fill="#06d6a0" opacity="0.1" />
      
      {/* Planeta Escondido Sorridente */}
      <g transform="translate(110, 40)" className={styles.twinkle}>
        <circle cx="0" cy="0" r="14" fill="#FFD166" />
        <line x1="-5" y1="-2" x2="-2" y2="-2" stroke="#d48200" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="-2" x2="5" y2="-2" stroke="#d48200" strokeWidth="2" strokeLinecap="round" />
        <path d="M-3,3 Q0,6 3,3" fill="none" stroke="#d48200" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Telescópio Cartoon */}
      <g transform="translate(60, 110)">
        <polygon points="-10,0 10,0 20,-45 -20,-45" fill="#118ab2" />
        <polygon points="-15,-45 15,-45 18,-65 -18,-65" fill="#06d6a0" />
        <rect x="-22" y="-75" width="44" height="10" rx="4" fill="#ef476f" />
        {/* Lente com reflexo cartoon */}
        <ellipse cx="0" cy="-75" rx="18" ry="6" fill="#8bf9ff" />
        <path d="M-10,-77 Q0,-82 10,-77" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        {/* Tripé (pequeno) */}
        <line x1="-5" y1="0" x2="-15" y2="25" stroke="#ef476f" strokeWidth="6" strokeLinecap="round" />
        <line x1="5" y1="0" x2="15" y2="25" stroke="#FFD166" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** 🧩 Memória Astral — Cartinhas Lúdicas de Brinquedo */
function MemoryArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Cartas Grossas/3D */}
      <g transform="translate(45, 45)" className={styles.cardBob1}>
        <rect x="3" y="3" width="30" height="40" rx="6" fill="#7209b7" opacity="0.3" />
        <rect x="0" y="0" width="30" height="40" rx="6" fill="#ef476f" stroke="#fff" strokeWidth="2" />
        <text x="15" y="28" textAnchor="middle" fontSize="22" fill="#fff" fontFamily="Outfit" fontWeight="900">?</text>
      </g>
      
      <g transform="translate(85, 45)" className={styles.cardBob2}>
        <rect x="3" y="3" width="30" height="40" rx="6" fill="#d48200" opacity="0.3" />
        <rect x="0" y="0" width="30" height="40" rx="6" fill="#FFD166" />
        <polygon points="15,10 20,25 10,25" fill="#fff" />
        <polygon points="15,30 20,15 10,15" fill="#fff" />
      </g>

      <g transform="translate(45, 95)" className={styles.cardBob3}>
        <rect x="3" y="3" width="30" height="40" rx="6" fill="#118ab2" opacity="0.3" />
        <rect x="0" y="0" width="30" height="40" rx="6" fill="#8bf9ff" />
        <path d="M12,10 A10,10 0 0,0 12,30 A12,12 0 0,1 12,10 Z" fill="#000" opacity="0.5" />
      </g>
      
      {/* Estrelinhas Mágicas */}
      <circle cx="35" cy="50" r="3" fill="#fff" className={styles.twinkle} />
      <circle cx="115" cy="95" r="4" fill="#FFD166" className={styles.twinkle} />
    </svg>
  )
}

/** 🪐 Desafio Orbital — O Sol Brincalhão */
function OrbitArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Sol Gordinho Feliz */}
      <circle cx="80" cy="80" r="28" fill="#ffb703" opacity="0.4" filter="url(#softGlow)" />
      <circle cx="80" cy="80" r="22" fill="#FFD166" />
      {/* Sorriso Sol */}
      <path d="M 73,83 Q 80,88 87,83" fill="none" stroke="#d48200" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="73" y1="78" x2="73" y2="76" stroke="#d48200" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="87" y1="78" x2="87" y2="76" stroke="#d48200" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="81" r="3" fill="#ff7096" opacity="0.8" />
      <circle cx="90" cy="81" r="3" fill="#ff7096" opacity="0.8" />

      {/* Trajetórias Fofas tracejadas grandonas */}
      <ellipse cx="80" cy="80" rx="55" ry="25" fill="none" stroke="#b5179e" strokeWidth="3" opacity="0.3" strokeDasharray="8 8" />

      {/* Planeta Bebê */}
      <g className={styles.orbit1}>
        <circle cx="25" cy="80" r="10" fill="#ef476f" />
        <ellipse cx="25" cy="80" rx="16" ry="4" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" transform="rotate(-15 25 80)" />
      </g>
      
      {/* Cometa Pipoquinha */}
      <g className={styles.orbit2}>
        <circle cx="135" cy="80" r="8" fill="#4facfe" />
        <path d="M143,80 L155,75 M142,83 L152,86 M140,75 L145,65" stroke="#4facfe" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  )
}

/** 🛸 Nave Oculta — Esconde-Esconde Fantasminha Espacial */
function HiddenArt() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Radar de Brinquedo */}
      <circle cx="80" cy="80" r="40" fill="#7209b7" opacity="0.1" />
      <circle cx="80" cy="80" r="60" fill="none" stroke="#7209b7" strokeWidth="4" strokeDasharray="5 15" strokeLinecap="round" opacity="0.3" className={styles.sonar1} />
      
      {/* Meteorito (Asteroide estilo Queijo) */}
      <g transform="translate(60, 90)">
        <path d="M0,0 C-15,0 -20,20 -5,30 C10,40 30,30 35,15 C40,0 15,-5 0,0 Z" fill="#6c757d" />
        <circle cx="5" cy="15" r="4" fill="#343a40" />
        <circle cx="18" cy="8" r="3" fill="#343a40" />
        <circle cx="-2" cy="22" r="2.5" fill="#343a40" />
      </g>

      {/* Fantasminha Boo/Alien escondidinho */}
      <g transform="translate(80, 50)" className={styles.cloakFlicker}>
        <path d="M-12,20 L-12,0 C-12,-10 12,-10 12,0 L12,20 L6,15 L0,20 L-6,15 Z" fill="#8bf9ff" opacity="0.8" />
        {/* olhos grandes kawaii */}
        <ellipse cx="-4" cy="5" rx="2" ry="4" fill="#000" />
        <ellipse cx="4" cy="5" rx="2" ry="4" fill="#000" />
        <circle cx="-5" cy="4" r="1" fill="#fff" />
        <circle cx="3" cy="4" r="1" fill="#fff" />
        {/* bochechas assustadas */}
        <circle cx="-8" cy="10" r="2" fill="#ff7096" opacity="0.8" />
        <circle cx="8" cy="10" r="2" fill="#ff7096" opacity="0.8" />
      </g>
    </svg>
  )
}

/** 🌟 Hero Art — Lúdica Jornada do Conhecimento */
function JourneyArt() {
  return (
    <svg viewBox="0 0 500 280" xmlns="http://www.w3.org/2000/svg" className={styles.journeyArt}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb703" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Caminho Estelar Pontilhado Lúdico */}
      <path d="M-50,140 Q150,20 350,140 T600,100" fill="none" stroke="#FFD166" strokeWidth="4" strokeDasharray="10 15" strokeLinecap="round" opacity="0.4" />

      {/* Sol Lúdico com Rosto */}
      <g transform="translate(60, 160)">
        <circle cx="0" cy="0" r="55" fill="url(#sunGlow)" />
        {/* Raios como "pétalas" */}
        {[0,45,90,135,180,225,270,315].map(deg => (
          <path key={deg} d="M0,-35 L8,-48 L-8,-48 Z" fill="#FFD166" transform={`rotate(${deg})`} />
        ))}
        <circle cx="0" cy="0" r="30" fill="#FFB703" />
        <circle cx="0" cy="0" r="24" fill="#FFD166" />
        {/* Rosto fofo */}
        <circle cx="-8" cy="-5" r="3.5" fill="#a0522d" />
        <circle cx="8" cy="-5" r="3.5" fill="#a0522d" />
        <path d="M-5,4 Q0,10 5,4" fill="none" stroke="#a0522d" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-12" cy="2" r="3" fill="#ff7096" opacity="0.6" />
        <circle cx="12" cy="2" r="3" fill="#ff7096" opacity="0.6" />
        
        <text x="0" y="55" fontFamily="Outfit,sans-serif" fontSize="12" fill="#FFD166" textAnchor="middle" opacity="0.8" fontWeight="900">O SOL</text>
      </g>

      {/* Terra Lúdica */}
      <g transform="translate(240, 100)">
        <circle cx="0" cy="0" r="35" fill="#219ebc" filter="url(#softGlow)" opacity="0.3" />
        <circle cx="0" cy="0" r="22" fill="#8ecae6" />
        <circle cx="0" cy="0" r="20" fill="#219ebc" />
        {/* Continentes gordinhos */}
        <path d="M-10,-10 C-5,-20 15,-10 10,-2 C20,5 -5,18 -15,5 C-22,0 -15,-5 -10,-10" fill="#8fd5a6" />
        <path d="M12,12 C18,15 15,18 12,15 Z" fill="#8fd5a6" />
        {/* Rosto */}
        <line x1="-5" y1="-2" x2="-5" y2="2" stroke="#023047" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="-2" x2="5" y2="2" stroke="#023047" strokeWidth="2" strokeLinecap="round" />
        <path d="M-3,5 Q0,9 3,5" fill="none" stroke="#023047" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Lua Lúdica de Dormir */}
      <g transform="translate(360, 170)">
        <circle cx="0" cy="0" r="26" fill="#e0e1dd" opacity="0.15" filter="url(#softGlow)" />
        <path d="M-8,-15 C10,-25 25,-10 15,10 C25,-5 10,-15 -8,-15 Z" fill="#f4f1de" />
        <circle cx="5" cy="0" r="14" fill="#f4f1de" />
        <circle cx="-2" cy="-4" r="3" fill="#d3d3d3" />
        <circle cx="8" cy="6" r="2" fill="#d3d3d3" />
        <circle cx="1" cy="7" r="1.5" fill="#d3d3d3" />
        {/* Zzz zzz */}
        <text x="18" y="-12" fontFamily="Outfit" fontSize="10" fill="#fff" opacity="0.6" fontWeight="bold">z</text>
        <text x="25" y="-18" fontFamily="Outfit" fontSize="7" fill="#fff" opacity="0.4" fontWeight="bold">z</text>
      </g>

      {/* Foguetinho Théo Super Cartoon */}
      <g transform="translate(160, 100) rotate(15)" className={styles.floatUpDown}>
        {/* Fumaça das nuvenzinhas */}
        <path d="M-50,8 C-45,15 -35,15 -35,5 C-30,-5 -40,-10 -45,-5 C-50,-10 -60,-5 -50,8 Z" fill="white" opacity="0.4" />
        <path d="M-30,4 C-25,10 -15,10 -15,0 C-10,-8 -20,-12 -25,-5 C-30,-10 -35,-5 -30,4 Z" fill="white" opacity="0.6" />
        <path d="M-12,0 C-8,5 2,5 2,-2 C5,-8 -2,-10 -6,-5 C-10,-8 -15,-5 -12,0 Z" fill="white" opacity="0.9" />

        {/* Foguete Pordinho */}
        <path d="M-5,-10 C5,-10 20,-5 25,0 C20,5 5,10 -5,10 C-10,10 -15,5 -15,-0 C-15,-5 -10,-10 -5,-10 Z" fill="#ef476f" />
        <path d="M5,-8 C12,-8 20,-3 25,0 L5,8 Z" fill="#ff7096" />
        <ellipse cx="2" cy="0" rx="4" ry="4" fill="#0d1b2a" stroke="#fff" strokeWidth="1.5" />
        
        {/* Asas */}
        <path d="M-8,8 L-14,18 L0,10 Z" fill="#FFD166" />
        <path d="M-8,-8 L-14,-18 L0,-10 Z" fill="#FFD166" />
        <circle cx="-16" cy="0" r="3" fill="#f77f00" />
      </g>

      {/* Elementos fofos espalhados (Estrelas de pelúcia) */}
      <g opacity="0.8">
        {[
          {x:40, y:60, s: 0.8}, {x:180, y:30, s: 1.2}, 
          {x:280, y:210, s: 1}, {x:450, y:120, s: 0.9}, 
          {x:420, y:50, s: 1.5}
        ].map((star, i) => (
          <g key={i} transform={`translate(${star.x}, ${star.y}) scale(${star.s})`} className={styles.twinkle}>
            <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#FFD166" />
          </g>
        ))}
      </g>
    </svg>
  )
}

/* ═════════════════════════════════════════════════════════════
   COMPONENT
═════════════════════════════════════════════════════════════ */
export default function GamesPage() {
  const { session, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [playerData, setPlayerData] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { setIsMuted } = useSound()

  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    setIsMuted(true)
    return () => setIsMuted(false)
  }, [setIsMuted])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { fetchRanking() }, [])

  useEffect(() => {
    if (user?.id) {
      fetchPlayerData()
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 15000)
      return () => clearInterval(interval)
    } else {
      setPlayerData(null); setPlayerStats(null); setNotifications([])
    }
  }, [user])

  const fetchPlayerData = async () => {
    if (!user?.id) return
    try {
      const { data: profile } = await supabase.from('players').select('*').eq('id', user.id).single()
      if (profile) setPlayerData(profile)
      const { data: stats } = await supabase.from('player_global_stats').select('*').eq('player_id', user.id).single()
      if (stats) setPlayerStats(stats)
    } catch (err) { console.error(err) }
  }

  const fetchNotifications = async () => {
    if (!user?.id) return
    try {
      const { data: pending } = await supabase.from('quiz_challenges').select('*').eq('challenged_id', user.id).eq('status', 'pending')
      const { data: results } = await supabase.from('quiz_challenges').select('*').eq('challenger_id', user.id).eq('status', 'completed').eq('challenger_seen', false)
      const all = [...(pending || []), ...(results || [])]
      if (all.length > 0) {
        const enriched = await Promise.all(all.map(async (n) => {
          const targetId = n.status === 'pending' ? n.challenger_id : n.challenged_id
          const { data: pData } = await supabase.from('players').select('full_name').eq('id', targetId).single()
          return { ...n, opponentName: pData?.full_name || 'Explorador', type: n.status === 'pending' ? 'invitation' : 'result' }
        }))
        setNotifications(enriched); setUnreadCount(enriched.length)
      } else { setNotifications([]); setUnreadCount(0) }
    } catch (err) { console.error(err) }
  }

  const fetchRanking = async () => {
    try {
      const { data: stats } = await supabase.from('player_global_stats').select('player_id, galactic_xp, total_trophies').order('galactic_xp', { ascending: false }).limit(5)
      if (stats && stats.length > 0) {
        const { data: profiles } = await supabase.from('players').select('id, full_name, username, avatar_url').in('id', stats.map(s => s.player_id))
        setLeaderboardData(stats.map((item: any, i: number) => {
          const p = profiles?.find(p => p.id === item.player_id)
          return { rank: i + 1, name: p?.full_name || p?.username || 'Astronauta', score: item.galactic_xp || 0, medals: item.total_trophies || 0, emoji: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👨‍🚀', avatarUrl: p?.avatar_url }
        }))
      } else setLeaderboardData([])
    } catch (err) { console.error(err) }
  }

  const calculateLevel = (xp = 0) => ({ level: Math.floor(xp / 1000) + 1, progress: (xp % 1000) / 10 })
  const { level, progress } = calculateLevel(playerStats?.galactic_xp)

  const games = [
    { id: 'quiz', title: 'QUIZ INTERGALÁCTICO', category: 'MISSÃO MENTAL', difficulty: 'Médio', path: '/quiz?level=1', color: '#4facfe', art: <QuizArt />, stats: { achievements: 12 } },
    { id: 'duel', title: 'ARENA DE DUELOS', category: 'ARENA PVP', difficulty: 'Difícil', path: '/quiz?mode=challenge', color: '#b5179e', art: <DuelArt />, stats: { achievements: 5 } },
    { id: 'invasores', title: 'INVASORES DO CONHECIMENTO', category: 'AÇÃO ESPACIAL', difficulty: 'Médio', path: '/jogos/invasores', color: '#00e5ff', art: <InvasoresArt />, stats: { achievements: 0 } },
    { id: 'hunt', title: 'CAÇA-PLANETAS', category: 'BUSCA ESTELAR', difficulty: 'Difícil', path: '#', color: '#06d6a0', art: <HuntArt />, stats: { achievements: 0 } },
    { id: 'memory', title: 'MEMÓRIA ASTRAL', category: 'MEMÓRIA LÚDICA', difficulty: 'Fácil', path: '#', color: '#ef476f', art: <MemoryArt />, stats: { achievements: 0 } },
    { id: 'orbit', title: 'DESAFIO ORBITAL', category: 'FÍSICA CÓSMICA', difficulty: 'Médio', path: '#', color: '#b5179e', art: <OrbitArt />, stats: { achievements: 0 } },
    { id: 'hidden', title: 'NAVE OCULTA', category: 'BUSCA ESPACIAL', difficulty: 'Médio', path: '#', color: '#7209b7', art: <HiddenArt />, stats: { achievements: 0 } },
  ]

  const handleGameClick = (e: React.MouseEvent, path: string) => {
    if (path === '#') { e.preventDefault(); return }
    if (!session) { e.preventDefault(); setShowAuth(true) }
  }

  const markAsSeen = async (id: string) => {
    await supabase.from('quiz_challenges').update({ challenger_seen: true }).eq('id', id)
    fetchNotifications()
  }

  const [activeCategory, setActiveCategory] = useState('Todos')
  const categories = ['Todos', 'Quiz', 'Ação', 'Busca', 'Puzzle']
  const filteredGames = useMemo(() => activeCategory === 'Todos' ? games : games.filter(g => g.category.includes(activeCategory.toUpperCase())), [activeCategory])

  return (
    <div className={styles.page}>
      <StarField />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); fetchPlayerData() }} />}

      {/* ── NAVBAR ── */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            {!scrolled ? (
              <div className={styles.logoMoon}><div className={styles.moon}></div><div className={styles.glow}></div></div>
            ) : (
              <div className={styles.logoText}>
                <span className={styles.theo}>Théo</span>
                <span className={styles.noMundo}> no Mundo</span>
                <span className={styles.daLuaNav}>da Lua<span className={styles.moonEmojiNav}>🌙</span></span>
              </div>
            )}
          </Link>
          <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <Link to="/jogos" className={`${styles.navLink} ${styles.navLinkActive}`} onClick={closeMenu}>ESTAÇÃO</Link>
            <Link to="/capitulos" className={styles.navLink} onClick={closeMenu}>CAPÍTULOS</Link>
            <Link to="/ranking" className={styles.navLink} onClick={closeMenu}>RANKING</Link>
            {session
              ? <Link to="/perfil" className={styles.loginBtn} onClick={closeMenu}>MEU PERFIL</Link>
              : <button className={styles.loginBtn} onClick={() => { setShowAuth(true); closeMenu() }}>ENTRAR</button>
            }
          </div>
        </div>
      </nav>

      <div className={styles.container}>

        {/* ── STATION HEADER ── */}
        <div className={styles.stationHeader}>
          <span className={styles.stationBadge}>🛸 HUB CENTRAL</span>
          <h1 className={styles.stationTitle}>Estação <span>Espacial</span></h1>
          <p className={styles.stationSub}>Escolha sua missão e comece a explorar</p>
        </div>

        {/* ── HERO: Jornada ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroCard}>
            {/* Barra lateral de cor */}
            <div className={styles.heroColorBar} />

            <div className={styles.heroInner}>
              <div className={styles.heroLeft}>
                <div className={styles.missionProgress}>
                  <span className={styles.heroTag}>MISSÃO PRINCIPAL</span>
                  <span className={styles.missionLabel}>0/4 CAPÍTULOS</span>
                </div>
                <div className={styles.chapterIcons}>
                  <span style={{opacity:1}}>☀️</span>
                  <span style={{opacity:1}}>🌍</span>
                  <span style={{opacity:0.35}}>🌙</span>
                  <span style={{opacity:0.12}}>🛸</span>
                  <div className={styles.miniProgressBar} />
                </div>
                <h2>JORNADA DO <span>CONHECIMENTO</span></h2>
                <p>Embarque na aventura de Théo e descubra os segredos do universo em 4 capítulos épicos!</p>
                <Link to="/capitulos" className={styles.continueLink}>CONTINUAR MISSÃO 🌟</Link>
              </div>
              <div className={styles.heroRight}>
                <JourneyArt />
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className={styles.categoryBar}>
          {categories.map(cat => (
            <button key={cat} className={`${styles.categoryPill} ${activeCategory === cat ? styles.activeCat : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </section>

        {/* ── LAYOUT ── */}
        <main className={styles.layout}>
          <section className={styles.gameCenter}>
            <div className={styles.grid}>
              {filteredGames.map((game, idx) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className={`${styles.gameCard} ${game.path === '#' ? styles.lockedCard : ''}`}
                  onClick={(e) => handleGameClick(e, game.path)}
                  style={{ '--game-color': game.color, '--game-color-bg': game.color + '18', animationDelay: `${idx * 0.06}s` } as any}
                >
                  {/* Barra de cor lateral */}
                  <div className={styles.colorBar} />

                  <div className={styles.cardInner}>
                    <div className={styles.cardContent}>
                      <span className={styles.cardCat}>{game.category}</span>
                      <h3 className={styles.cardTitle}>{game.title}</h3>
                      <span className={styles.cardScore}>🏆 {game.stats.achievements}</span>
                    </div>

                    <div className={styles.cardArtWrapper}>
                      {game.art}
                    </div>

                    {game.path === '#' && (
                      <div className={styles.lockedBadge}>
                        <span className={styles.lockedIcon}>🕒</span>
                        <span>EM BREVE</span>
                      </div>
                    )}
                  </div>

                  {/* Planeta decorativo */}
                  <div className={styles.decorativePlanet} />
                </Link>
              ))}
            </div>
          </section>

          {/* ── SIDEBAR ── */}
          <section className={styles.trendingSection}>
            <div className={styles.sectionHeading}>
              <h3>RANKING GLOBAL</h3>
              <p>Top exploradores</p>
            </div>
            <div className={styles.miniRanking}>
              {leaderboardData.slice(0, 3).map((item, i) => (
                <div key={i} className={styles.miniRankItem}>
                  <div className={styles.miniRankPos}>{item.rank}</div>
                  <img src={item.avatarUrl} className={styles.miniRankAvatar} alt="" />
                  <span className={styles.miniRankName}>{item.name.split(' ')[0]}</span>
                  <span className={styles.miniRankScore}>{item.score}</span>
                </div>
              ))}
            </div>
            {session ? (
              <div className={styles.playerCard}>
                <div className={styles.playerCardInfo}>
                  <img src={playerData?.avatar_url || 'https://github.com/Melchior-Jr.png'} className={styles.playerCardAvatar} alt="Avatar" />
                  <div>
                    <span className={styles.playerCardName}>{playerData?.full_name || 'Explorador'}</span>
                    <span className={styles.playerCardLevel}>NÍVEL {level}</span>
                    <div className={styles.playerCardXpBar}>
                      <div className={styles.playerCardXpInner} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <Link to="/perfil" className={styles.playerCardBtn}>VER PERFIL</Link>
              </div>
            ) : (
              <button className={styles.joinBtn} onClick={() => setShowAuth(true)}>🚀 ENTRAR NA MISSÃO</button>
            )}
          </section>
        </main>

        <footer className={styles.bottomBar}>
          <div>© 2026 THÉO NO MUNDO DA LUA · ESTAÇÃO ESPACIAL</div>
          <div className={styles.status}><span className={styles.dot} /> LINK OPERACIONAL</div>
        </footer>
      </div>
    </div>
  )
}
