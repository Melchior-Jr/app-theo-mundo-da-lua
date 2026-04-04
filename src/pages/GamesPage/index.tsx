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

/** 🚀 Quiz Intergaláctico — Azul elétrico, foguete, perguntas */
function QuizArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      {/* Fundo */}
      <rect width="320" height="200" fill="#0a1628" />
      <radialGradient id="qg" cx="70%" cy="30%" r="55%">
        <stop offset="0%" stopColor="#1a3a6e" />
        <stop offset="100%" stopColor="#0a1628" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#qg)" />

      {/* Estrelas */}
      <circle cx="20" cy="18" r="1.5" fill="white" opacity="0.4" />
      <circle cx="55" cy="45" r="1" fill="white" opacity="0.3" />
      <circle cx="100" cy="12" r="1.2" fill="white" opacity="0.5" />
      <circle cx="260" cy="30" r="1.5" fill="white" opacity="0.35" />
      <circle cx="295" cy="55" r="1" fill="white" opacity="0.4" />
      <circle cx="310" cy="12" r="1.3" fill="white" opacity="0.25" />
      <circle cx="170" cy="8" r="1" fill="white" opacity="0.3" />
      <circle cx="32" cy="80" r="1" fill="#4facfe" opacity="0.4" />
      <circle cx="285" cy="100" r="1.2" fill="#4facfe" opacity="0.3" />

      {/* Planetas de fundo decorativos */}
      <circle cx="270" cy="160" r="50" fill="none" stroke="#4facfe" strokeWidth="0.5" opacity="0.12" />
      <circle cx="270" cy="160" r="65" fill="none" stroke="#4facfe" strokeWidth="0.3" opacity="0.07" />

      {/* Foguete principal */}
      <g transform="translate(80, 40)" className={styles.rocketFloat}>
        {/* Corpo */}
        <ellipse cx="0" cy="50" rx="14" ry="38" fill="#4facfe" />
        {/* Nariz */}
        <path d="M-14,28 Q0,-6 14,28 Z" fill="#74c9ff" />
        {/* Janela */}
        <circle cx="0" cy="46" r="7" fill="#0d2244" stroke="#8bf9ff" strokeWidth="1.5" />
        <circle cx="0" cy="46" r="4" fill="#4facfe" opacity="0.4" />
        {/* Aletas esquerda */}
        <path d="M-14,72 L-26,90 L-14,84 Z" fill="#2980b9" />
        {/* Aleta direita */}
        <path d="M14,72 L26,90 L14,84 Z" fill="#2980b9" />
        {/* Chama */}
        <ellipse cx="0" cy="95" rx="8" ry="12" fill="#f7c762" opacity="0.9" />
        <ellipse cx="0" cy="99" rx="5" ry="8" fill="#fff" opacity="0.7" />
      </g>

      {/* Pontos de interrogação flutuantes temáticos */}
      <text x="175" y="75" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="40" fill="#FFD166" opacity="0.85" className={styles.qFloat1}>?</text>
      <text x="220" y="130" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="28" fill="#8bf9ff" opacity="0.6" className={styles.qFloat2}>?</text>
      <text x="148" y="145" fontFamily="Outfit,sans-serif" fontWeight="900" fontSize="20" fill="#fff" opacity="0.3" className={styles.qFloat3}>?</text>

      {/* Orbita */}
      <ellipse cx="80" cy="120" rx="40" ry="8" fill="none" stroke="#4facfe" strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />

      {/* Badge categoria */}
      <rect x="16" y="172" width="100" height="18" rx="9" fill="rgba(79,172,254,0.15)" stroke="rgba(79,172,254,0.4)" strokeWidth="1" />
      <text x="66" y="184" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#4facfe" textAnchor="middle" letterSpacing="1.5">MISSÃO MENTAL</text>
    </svg>
  )
}

/** ⚔️ Arena de Duelos — Roxo vibrante, dois guerreiros, relâmpagos */
function DuelArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#120820" />
      <radialGradient id="dg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#2d0a4e" />
        <stop offset="100%" stopColor="#0a0515" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#dg)" />

      {/* Particulas */}
      <circle cx="30" cy="20" r="1.2" fill="#b5179e" opacity="0.5" />
      <circle cx="80" cy="60" r="1" fill="#e040fb" opacity="0.4" />
      <circle cx="270" cy="25" r="1.5" fill="#b5179e" opacity="0.4" />
      <circle cx="310" cy="70" r="1" fill="#e040fb" opacity="0.35" />
      <circle cx="160" cy="15" r="1.2" fill="white" opacity="0.3" />
      <circle cx="50" cy="160" r="1" fill="#b5179e" opacity="0.3" />
      <circle cx="290" cy="150" r="1.3" fill="#e040fb" opacity="0.4" />

      {/* Arena circular de fundo */}
      <circle cx="160" cy="110" r="72" fill="none" stroke="#b5179e" strokeWidth="0.5" opacity="0.2" />
      <circle cx="160" cy="110" r="88" fill="none" stroke="#7209b7" strokeWidth="0.3" opacity="0.12" />

      {/* Guerreiro esquerdo */}
      <g transform="translate(55, 55)" className={styles.fighterLeft}>
        <circle cx="0" cy="0" r="12" fill="#e040fb" opacity="0.9" />
        <circle cx="0" cy="0" r="8" fill="#c700e0" />
        <rect x="-8" y="14" width="16" height="30" rx="4" fill="#7209b7" />
        <polygon points="-8,44 -14,58 0,52 14,58 8,44" fill="#b5179e" />
        {/* Espada */}
        <line x1="14" y1="14" x2="50" y2="-10" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
        <rect x="8" y="10" width="12" height="4" rx="2" fill="#8bf9ff" transform="rotate(-35 8 10)" />
      </g>

      {/* VS */}
      <text x="160" y="108" fontFamily="Outfit,sans-serif" fontWeight="950" fontSize="30"
        fill="white" textAnchor="middle" opacity="0.95" className={styles.vsBurst}>VS</text>
      <circle cx="160" cy="100" r="22" fill="none" stroke="#FFD166" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4" className={styles.vsBurst} />

      {/* Guerreiro direito */}
      <g transform="translate(265, 55)" className={styles.fighterRight}>
        <circle cx="0" cy="0" r="12" fill="#4facfe" opacity="0.9" />
        <circle cx="0" cy="0" r="8" fill="#1a6fd4" />
        <rect x="-8" y="14" width="16" height="30" rx="4" fill="#023e8a" />
        <polygon points="-8,44 -14,58 0,52 14,58 8,44" fill="#0077b6" />
        {/* Espada */}
        <line x1="-14" y1="14" x2="-50" y2="-10" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
        <rect x="-20" y="10" width="12" height="4" rx="2" fill="#8bf9ff" transform="rotate(35 -20 10)" />
      </g>

      {/* Relâmpagos */}
      <polyline points="145,65 155,82 148,82 160,100" stroke="#FFD166" strokeWidth="2" fill="none" opacity="0.6" className={styles.lightning} />
      <polyline points="175,65 165,80 172,80 160,100" stroke="#FFD166" strokeWidth="1.5" fill="none" opacity="0.4" className={styles.lightning} />

      {/* Badge */}
      <rect x="110" y="175" width="100" height="18" rx="9" fill="rgba(181,23,158,0.15)" stroke="rgba(181,23,158,0.4)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#e040fb" textAnchor="middle" letterSpacing="1.5">ARENA PVP</text>
    </svg>
  )
}

/** 🛸 Invasores — Verde neon, cena de batalha espacial top-down */
function InvasoresArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#030e0e" />
      <radialGradient id="ig" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#0a2e20" />
        <stop offset="100%" stopColor="#020a0a" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#ig)" />

      {/* Grid de fundo sci-fi */}
      <line x1="0" y1="80" x2="320" y2="80" stroke="#00e5ff" strokeWidth="0.3" opacity="0.08" />
      <line x1="0" y1="120" x2="320" y2="120" stroke="#00e5ff" strokeWidth="0.3" opacity="0.06" />
      <line x1="80" y1="0" x2="80" y2="200" stroke="#00e5ff" strokeWidth="0.3" opacity="0.06" />
      <line x1="160" y1="0" x2="160" y2="200" stroke="#00e5ff" strokeWidth="0.3" opacity="0.06" />
      <line x1="240" y1="0" x2="240" y2="200" stroke="#00e5ff" strokeWidth="0.3" opacity="0.06" />

      {/* Alien UFOs — linha */}
      {[45, 105, 160, 220, 278].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${25 + (i%2)*18})`} className={i % 2 === 0 ? styles.ufoFloat : styles.ufoFloat2}>
          <ellipse cx="0" cy="0" rx="22" ry="8" fill="#39ff14" opacity="0.7" />
          <ellipse cx="0" cy="-5" rx="12" ry="7" fill="#39ff14" opacity="0.5" />
          <ellipse cx="0" cy="8" rx="17" ry="3" fill="#39ff14" opacity="0.15" />
          {/* Faróis */}
          <circle cx="-8" cy="2" r="2" fill="white" opacity="0.8" />
          <circle cx="8" cy="2" r="2" fill="white" opacity="0.8" />
        </g>
      ))}

      {/* Nave do jogador */}
      <g transform="translate(160, 148)" className={styles.playerShip}>
        <polygon points="0,-30 -20,10 20,10" fill="#4facfe" />
        <polygon points="0,-30 -14,0 14,0" fill="#74c9ff" />
        <rect x="-5" y="6" width="10" height="10" rx="2" fill="#f7c762" opacity="0.9" />
        {/* Asas */}
        <polygon points="-20,10 -35,18 -20,14" fill="#2980b9" />
        <polygon points="20,10 35,18 20,14" fill="#2980b9" />
        {/* Escudo circular */}
        <circle cx="0" cy="-10" r="22" fill="none" stroke="#4facfe" strokeWidth="1" opacity="0.3" strokeDasharray="3 2" />
      </g>

      {/* Lasers do jogador */}
      <line x1="160" y1="118" x2="160" y2="62" stroke="#4facfe" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" className={styles.laser1} />
      <line x1="150" y1="125" x2="105" y2="70" stroke="#4facfe" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" className={styles.laser2} />
      <line x1="170" y1="125" x2="215" y2="70" stroke="#4facfe" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" className={styles.laser2} />

      {/* Explosão */}
      <circle cx="160" cy="48" r="10" fill="#FFD166" opacity="0.7" className={styles.explode} />
      <circle cx="160" cy="48" r="6" fill="white" opacity="0.6" className={styles.explode} />

      {/* Badge */}
      <rect x="104" y="175" width="112" height="18" rx="9" fill="rgba(0,229,255,0.1)" stroke="rgba(0,229,255,0.35)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#00e5ff" textAnchor="middle" letterSpacing="1.5">AÇÃO ESPACIAL</text>
    </svg>
  )
}

/** 🔭 Caça-Planetas — Verde esmeralda, sistema solar, radar */
function HuntArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#040f0a" />
      <radialGradient id="hg" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#0a2218" />
        <stop offset="100%" stopColor="#030a06" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#hg)" />

      {/* Radar central */}
      <circle cx="160" cy="108" r="75" fill="none" stroke="#06d6a0" strokeWidth="0.5" opacity="0.2" />
      <circle cx="160" cy="108" r="55" fill="none" stroke="#06d6a0" strokeWidth="0.5" opacity="0.15" />
      <circle cx="160" cy="108" r="35" fill="none" stroke="#06d6a0" strokeWidth="0.5" opacity="0.2" />
      <line x1="85" y1="108" x2="235" y2="108" stroke="#06d6a0" strokeWidth="0.5" opacity="0.2" />
      <line x1="160" y1="33" x2="160" y2="183" stroke="#06d6a0" strokeWidth="0.5" opacity="0.2" />

      {/* Varredura do radar */}
      <path d="M160,108 L235,108 A75,75 0 0,0 160,33 Z" fill="#06d6a0" opacity="0.06" className={styles.radarSweep} />

      {/* Planetas escondidos */}
      <circle cx="230" cy="65" r="14" fill="#f7c762" opacity="0.9" />
      <circle cx="230" cy="65" r="14" fill="none" stroke="#FFD166" strokeWidth="1.5" />
      {/* anel do planeta */}
      <ellipse cx="230" cy="65" rx="22" ry="5" fill="none" stroke="#FFD166" strokeWidth="1.2" opacity="0.5" />
      <circle cx="99" cy="148" r="10" fill="#8bf9ff" opacity="0.5" />
      <circle cx="99" cy="148" r="10" fill="none" stroke="#8bf9ff" strokeWidth="1" opacity="0.8" />

      {/* Telescópio */}
      <g transform="translate(135, 82)">
        <rect x="-6" y="-28" width="12" height="32" rx="4" fill="#06d6a0" opacity="0.9" transform="rotate(-25)" />
        <ellipse cx="0" cy="-28" rx="8" ry="4" fill="#06d6a0" opacity="0.6" transform="rotate(-25)" />
        <line x1="10" y1="18" x2="20" y2="50" stroke="#06d6a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <circle cx="10" cy="18" r="5" fill="#0a2218" stroke="#06d6a0" strokeWidth="1.5" />
      </g>

      {/* Linha de mira para o planeta */}
      <line x1="155" y1="75" x2="216" y2="62" stroke="#06d6a0" strokeWidth="1" opacity="0.5" strokeDasharray="4 3" />
      <circle cx="229" cy="65" r="18" fill="none" stroke="#06d6a0" strokeWidth="1.5" opacity="0.5" strokeDasharray="3 2" />

      {/* Badge */}
      <rect x="107" y="175" width="106" height="18" rx="9" fill="rgba(6,214,160,0.1)" stroke="rgba(6,214,160,0.35)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#06d6a0" textAnchor="middle" letterSpacing="1.5">BUSCA ESTELAR</text>
    </svg>
  )
}

/** 🧩 Memória Astral — Magenta quente, grade de cartas com face/verso */
function MemoryArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#120510" />
      <radialGradient id="mg" cx="50%" cy="55%" r="60%">
        <stop offset="0%" stopColor="#2a0525" />
        <stop offset="100%" stopColor="#080208" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#mg)" />

      {/* Grade de cards de memória */}
      {[
        {x: 32, y: 38, flipped: true, content: '⭐', color: '#FFD166'},
        {x: 88, y: 38, flipped: false, content: '?', color: '#ef476f'},
        {x: 144, y: 38, flipped: false, content: '?', color: '#ef476f'},
        {x: 200, y: 38, flipped: true, content: '⭐', color: '#FFD166'},
        {x: 256, y: 38, flipped: false, content: '?', color: '#ef476f'},

        {x: 32, y: 108, flipped: false, content: '?', color: '#ef476f'},
        {x: 88, y: 108, flipped: true, content: '🌙', color: '#8bf9ff'},
        {x: 144, y: 108, flipped: false, content: '?', color: '#ef476f'},
        {x: 200, y: 108, flipped: false, content: '?', color: '#ef476f'},
        {x: 256, y: 108, flipped: true, content: '🌙', color: '#8bf9ff'},
      ].map((card, i) => (
        <g key={i} transform={`translate(${card.x}, ${card.y})`} className={i % 3 === 0 ? styles.cardBob1 : i % 3 === 1 ? styles.cardBob2 : styles.cardBob3}>
          <rect x="-22" y="-28" width="44" height="54" rx="8"
            fill={card.flipped ? 'rgba(239,71,111,0.12)' : 'rgba(255,255,255,0.04)'}
            stroke={card.flipped ? card.color : 'rgba(255,255,255,0.12)'}
            strokeWidth="1.5"
          />
          {card.flipped ? (
            <text x="0" y="10" textAnchor="middle" fontSize="22">{card.content}</text>
          ) : (
            <>
              <line x1="-14" y1="-14" x2="14" y2="14" stroke="rgba(239,71,111,0.25)" strokeWidth="1.5" />
              <line x1="14" y1="-14" x2="-14" y2="14" stroke="rgba(239,71,111,0.25)" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="none" stroke="rgba(239,71,111,0.3)" strokeWidth="1" />
            </>
          )}
        </g>
      ))}

      {/* Brilho de "match encontrado" */}
      <circle cx="88" cy="108" r="28" fill="#8bf9ff" opacity="0.06" />
      <circle cx="256" cy="108" r="28" fill="#8bf9ff" opacity="0.06" />

      {/* Badge */}
      <rect x="104" y="175" width="112" height="18" rx="9" fill="rgba(239,71,111,0.12)" stroke="rgba(239,71,111,0.35)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#ef476f" textAnchor="middle" letterSpacing="1.5">MEMÓRIA LÚDICA</text>
    </svg>
  )
}

/** 🪐 Desafio Orbital — Roxo profundo, planetas em órbita */
function OrbitArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#08050f" />
      <radialGradient id="og" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#1a0840" />
        <stop offset="100%" stopColor="#06020e" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#og)" />

      {/* Sol central */}
      <circle cx="160" cy="100" r="22" fill="#f7c762" opacity="0.95" />
      <circle cx="160" cy="100" r="28" fill="none" stroke="#f7c762" strokeWidth="1" opacity="0.3" />
      <circle cx="160" cy="100" r="36" fill="none" stroke="#f7c762" strokeWidth="0.5" opacity="0.15" />

      {/* Trilhas orbitais */}
      <ellipse cx="160" cy="100" rx="65" ry="28" fill="none" stroke="#b5179e" strokeWidth="0.8" opacity="0.25" strokeDasharray="5 3" />
      <ellipse cx="160" cy="100" rx="105" ry="42" fill="none" stroke="#7209b7" strokeWidth="0.8" opacity="0.2" strokeDasharray="4 4" />
      <ellipse cx="160" cy="100" rx="140" ry="55" fill="none" stroke="#480ca8" strokeWidth="0.6" opacity="0.15" strokeDasharray="3 5" />

      {/* Planeta 1 — órbita 1 */}
      <circle cx="95" cy="88" r="10" fill="#ef476f" className={styles.orbit1} />
      <circle cx="95" cy="88" r="10" fill="none" stroke="#ef476f" strokeWidth="1" opacity="0.5" />

      {/* Planeta 2 — órbita 2 com anel */}
      <g className={styles.orbit2}>
        <circle cx="55" cy="108" r="14" fill="#b5179e" />
        <ellipse cx="55" cy="108" rx="22" ry="5" fill="none" stroke="#e040fb" strokeWidth="1.8" opacity="0.7" />
      </g>

      {/* Planeta 3 — órbita 3 (pque) */}
      <circle cx="280" cy="90" r="8" fill="#4facfe" className={styles.orbit3} />

      {/* Alerta de colisão */}
      <circle cx="95" cy="88" r="16" fill="none" stroke="#ef476f" strokeWidth="1.5" opacity="0.4" className={styles.alertPulse} strokeDasharray="3 2" />

      {/* Asteroides errantes */}
      <rect x="200" y="50" width="6" height="4" rx="1" fill="rgba(255,255,255,0.3)" transform="rotate(25 200 50)" />
      <rect x="240" y="150" width="5" height="3" rx="1" fill="rgba(255,255,255,0.2)" transform="rotate(-10 240 150)" />
      <circle cx="75" cy="155" r="3" fill="rgba(255,255,255,0.2)" />

      {/* Badge */}
      <rect x="104" y="175" width="112" height="18" rx="9" fill="rgba(181,23,158,0.12)" stroke="rgba(181,23,158,0.35)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#b5179e" textAnchor="middle" letterSpacing="1.5">FÍSICA CÓSMICA</text>
    </svg>
  )
}

/** 🛸 Nave Oculta — Cinza azulado profundo, sonar, pontos de furtividade */
function HiddenArt() {
  return (
    <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="320" height="200" fill="#050810" />
      <radialGradient id="hbg" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stopColor="#0a1535" />
        <stop offset="100%" stopColor="#030509" />
      </radialGradient>
      <rect width="320" height="200" fill="url(#hbg)" />

      {/* Poeira espacial / neblina */}
      <ellipse cx="160" cy="80" rx="130" ry="55" fill="#7209b7" opacity="0.06" />
      <ellipse cx="160" cy="80" rx="100" ry="40" fill="#7209b7" opacity="0.04" />

      {/* Ondas de sonar */}
      <circle cx="55" cy="140" r="20" fill="none" stroke="#7209b7" strokeWidth="1" opacity="0.5" className={styles.sonar1} />
      <circle cx="55" cy="140" r="40" fill="none" stroke="#7209b7" strokeWidth="0.8" opacity="0.35" className={styles.sonar2} />
      <circle cx="55" cy="140" r="60" fill="none" stroke="#7209b7" strokeWidth="0.5" opacity="0.2" className={styles.sonar3} />
      {/* Centro sonar */}
      <circle cx="55" cy="140" r="5" fill="#7209b7" opacity="0.8" />
      <circle cx="55" cy="140" r="3" fill="white" opacity="0.6" />

      {/* Nave oculta (fantasma/semitransparente) */}
      <g opacity="0.25" className={styles.cloakFlicker}>
        <ellipse cx="200" cy="75" rx="45" ry="16" fill="#8bf9ff" />
        <ellipse cx="200" cy="63" rx="25" ry="14" fill="#8bf9ff" />
        <ellipse cx="200" cy="91" rx="35" ry="6" fill="#8bf9ff" opacity="0.3" />
        <circle cx="185" cy="72" r="4" fill="white" />
        <circle cx="215" cy="72" r="4" fill="white" />
      </g>

      {/* Ping de detecção */}
      <circle cx="200" cy="75" r="18" fill="none" stroke="#7209b7" strokeWidth="2" opacity="0.6" className={styles.detectionPing} />
      <line x1="55" y1="140" x2="200" y2="75" stroke="#7209b7" strokeWidth="1" opacity="0.3" strokeDasharray="4 4" className={styles.sonar3} />

      {/* Estrelas (mais do que o normal, neve espacial) */}
      {[40,80,130,170,220,270,310,55,100,190,250,300,15,145,285].map((x, i) => (
        <circle key={i} cx={x} cy={10 + (i * 13) % 110} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.1 + (i % 4) * 0.1} />
      ))}

      {/* Badge */}
      <rect x="104" y="175" width="112" height="18" rx="9" fill="rgba(114,9,183,0.12)" stroke="rgba(114,9,183,0.4)" strokeWidth="1" />
      <text x="160" y="187" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#a855f7" textAnchor="middle" letterSpacing="1.5">BUSCA ESPACIAL</text>
    </svg>
  )
}

/** 🌟 Hero Art — Jornada do Conhecimento */
function JourneyArt() {
  return (
    <svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" className={styles.journeyArt}>
      <rect width="640" height="280" fill="#07101e" />
      <radialGradient id="jg1" cx="20%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#0d2244" />
        <stop offset="100%" stopColor="#07101e" />
      </radialGradient>
      <radialGradient id="jg2" cx="80%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a0840" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <rect width="640" height="280" fill="url(#jg1)" />
      <rect width="640" height="280" fill="url(#jg2)" />

      {/* Nebulosa de fundo */}
      <ellipse cx="480" cy="140" rx="200" ry="120" fill="#4facfe" opacity="0.04" />
      <ellipse cx="500" cy="160" rx="150" ry="80" fill="#b5179e" opacity="0.04" />

      {/* Trilha de estrelas/rota espacial */}
      <path d="M80,200 Q160,120 260,140 Q360,160 440,100 Q520,60 600,80"
        fill="none" stroke="#FFD166" strokeWidth="1.5" opacity="0.2" strokeDasharray="6 4" />

      {/* Chapters em sequência */}
      {/* Capítulo 1 — Sol */}
      <circle cx="100" cy="185" r="30" fill="#f7c762" opacity="0.9" />
      <circle cx="100" cy="185" r="38" fill="none" stroke="#f7c762" strokeWidth="1" opacity="0.3" />
      <text x="100" y="245" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#f7c762" textAnchor="middle" opacity="0.7">SISTEMA SOLAR</text>

      {/* Capítulo 2 — Terra */}
      <circle cx="220" cy="155" r="24" fill="#2d6be4" opacity="0.9" />
      <ellipse cx="220" cy="148" rx="8" ry="5" fill="#06d6a0" opacity="0.7" transform="rotate(-20 220 148)" />
      <ellipse cx="226" cy="162" rx="6" ry="4" fill="#06d6a0" opacity="0.6" transform="rotate(10 226 162)" />
      <circle cx="220" cy="155" r="30" fill="none" stroke="#2d6be4" strokeWidth="0.8" opacity="0.3" />
      <text x="220" y="210" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#4facfe" textAnchor="middle" opacity="0.7">MOVIMENTOS</text>

      {/* Capítulo 3 — Lua */}
      <circle cx="330" cy="135" r="20" fill="transparent" />
      <circle cx="330" cy="135" r="20">
        <animate attributeName="r" values="20;21;20" dur="4s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="330" cy="135" rx="20" ry="20" fill="#c8d6e5" opacity="0.75" />
      {/* craters */}
      <circle cx="323" cy="130" r="4" fill="rgba(0,0,0,0.15)" />
      <circle cx="335" cy="141" r="3" fill="rgba(0,0,0,0.12)" />
      <circle cx="330" cy="135" r="26" fill="none" stroke="#c8d6e5" strokeWidth="0.8" opacity="0.25" />
      <text x="330" y="183" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="#c8d6e5" textAnchor="middle" opacity="0.7">FASES DA LUA</text>

      {/* Capítulo 4 — Constelações (em breve) */}
      <g opacity="0.35">
        {[[430,125],[445,110],[460,130],[455,150],[440,145]].map(([cx, cy], i, arr) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2.5" fill="white" />
            {i < arr.length - 1 && (
              <line x1={cx} y1={cy} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke="white" strokeWidth="0.8" opacity="0.5" />
            )}
          </g>
        ))}
        <text x="445" y="183" fontFamily="Outfit,sans-serif" fontWeight="800" fontSize="9" fill="white" textAnchor="middle" opacity="0.6">CONSTELAÇÕES</text>
      </g>

      {/* Estrelas de fundo */}
      {[30,60,150,200,290,380,480,530,580,610,15,90,350,510,620].map((x, i) => (
        <circle key={i} cx={x} cy={5 + (i * 19) % 120} r={i % 3 === 0 ? 1.5 : 0.8} fill="white" opacity={0.15 + (i % 4) * 0.1} />
      ))}

      {/* UFO sutil no canto */}
      <g transform="translate(565, 50)" opacity="0.35">
        <ellipse cx="0" cy="0" rx="28" ry="10" fill="#8bf9ff" />
        <ellipse cx="0" cy="-6" rx="15" ry="10" fill="#8bf9ff" opacity="0.7" />
        <ellipse cx="0" cy="10" rx="22" ry="4" fill="#8bf9ff" opacity="0.15" />
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
    } else {
      setPlayerData(null); setPlayerStats(null)
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

                  <div className={styles.cardImageArea}>
                    {game.art}
                    {game.path === '#' && (
                      <div className={styles.lockOverlay}>
                        <span className={styles.comingSoon}>EM BREVE</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardInfo}>
                    <div>
                      <h3 className={styles.cardTitle}>{game.title}</h3>
                      <span className={styles.cardCat}>{game.category}</span>
                    </div>
                    <span className={styles.cardScore}>🏆 {game.stats.achievements}</span>
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
