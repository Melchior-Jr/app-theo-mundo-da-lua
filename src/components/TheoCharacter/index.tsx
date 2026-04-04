import styles from './TheoCharacter.module.css'

interface TheoCharacterProps {
  size?: number
  className?: string
  emotion?: 'default' | 'celebrate' | 'sad' | 'thinking' | 'bounce' | 'tilt'
}

/**
 * TheoCharacter — ilustração SVG do personagem Théo.
 * Astronauta menino com expressão aventureira e suporte a estados emocionais.
 */
export default function TheoCharacter({ 
  size = 280, 
  className = '', 
  emotion = 'default',
  lookAt = { x: 0, y: 0 }
}: TheoCharacterProps & { lookAt?: { x: number, y: number } }) {
  // Mapeamento de classes de emoção
  const emotionClass = emotion !== 'default' ? styles[emotion] : ''

  // Lógica de eye-tracking (limita o movimento da pupila dentro do globo ocular)
  const calculateEyeRotation = (baseX: number, baseY: number) => {
    if (!lookAt.x && !lookAt.y) return { x: baseX, y: baseY };
    
    // Suavização do movimento
    const dx = lookAt.x - baseX;
    const dy = lookAt.y - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRange = 5; // Limite de movimento da pupila
    
    const limitedDist = Math.min(distance * 0.05, maxRange);
    const angle = Math.atan2(dy, dx);
    
    return {
      x: baseX + Math.cos(angle) * limitedDist,
      y: baseY + Math.sin(angle) * limitedDist
    };
  };

  const leftPupil = calculateEyeRotation(128, 110);
  const rightPupil = calculateEyeRotation(156, 110);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Théo, o astronauta aventureiro"
      role="img"
      className={`${styles.character} ${emotionClass} ${className}`}
    >
      {/* Capacete - visor externo */}
      <circle cx="140" cy="110" r="75" fill="#1a2340" stroke="#FFD166" strokeWidth="4"/>

      {/* Capacete - reflexo de luz */}
      <ellipse cx="120" cy="85" rx="28" ry="18" fill="rgba(255,209,102,0.08)"/>

      {/* Visor do capacete - escuro */}
      <ellipse cx="140" cy="110" rx="52" ry="44" fill="#060C1A"/>

      {/* Visor - reflexo brilhante */}
      <ellipse cx="125" cy="92" rx="16" ry="10" fill="rgba(126,251,253,0.15)"/>
      <ellipse cx="118" cy="88" rx="6" ry="4" fill="rgba(255,255,255,0.2)"/>

      {/* Rosto de Théo dentro do visor */}
      <ellipse cx="140" cy="112" rx="36" ry="32" fill="#D29668"/>

      {/* Cabelo */}
      <g fill="#3B2314" stroke="#2B1B10" strokeWidth="0.5">
        <circle cx="106" cy="100" r="14"/>
        <circle cx="102" cy="112" r="12"/>
        <circle cx="108" cy="88" r="14"/>
        <circle cx="174" cy="100" r="14"/>
        <circle cx="178" cy="112" r="12"/>
        <circle cx="172" cy="88" r="14"/>
        <circle cx="140" cy="76" r="18"/>
        <circle cx="122" cy="80" r="15"/>
        <circle cx="158" cy="80" r="15"/>
        <circle cx="130" cy="90" r="6"/>
        <circle cx="140" cy="92" r="7"/>
        <circle cx="150" cy="90" r="6"/>
      </g>

      {/* Olhos com Eye-Tracking */}
      <g className={emotion === 'sad' ? styles.eyeSad : ''}>
        <ellipse cx="126" cy="108" rx="9" ry="10" fill="#fff"/>
        <ellipse cx="154" cy="108" rx="9" ry="10" fill="#fff"/>
        
        {/* Íris */}
        <circle cx={leftPupil.x} cy={leftPupil.y} r="6" fill="#3D6BAF" />
        <circle cx={rightPupil.x} cy={rightPupil.y} r="6" fill="#3D6BAF" />
        
        {/* Pupila */}
        <circle cx={leftPupil.x + 1} cy={leftPupil.y + 1} r="3.5" fill="#0A0E1A" />
        <circle cx={rightPupil.x + 1} cy={rightPupil.y + 1} r="3.5" fill="#0A0E1A" />
        
        {/* Brilho do olho */}
        <circle cx={leftPupil.x + 3} cy={leftPupil.y - 2} r="1.5" fill="#fff" opacity="0.8" />
        <circle cx={rightPupil.x + 3} cy={rightPupil.y - 2} r="1.5" fill="#fff" opacity="0.8" />
      </g>

      {/* Sorriso / Boca Dinâmica */}
      {emotion === 'sad' ? (
        <path d="M130 132 Q140 126 150 132" stroke="#8E5A35" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      ) : emotion === 'celebrate' ? (
        <path d="M125 125 Q140 145 155 125" stroke="#8E5A35" strokeWidth="3" strokeLinecap="round" fill="none"/>
      ) : (
        <path d="M128 126 Q140 138 152 126" stroke="#8E5A35" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      )}

      {/* Bochechas */}
      <ellipse cx="115" cy="122" rx="9" ry="6" fill="rgba(255,107,53,0.25)"/>
      <ellipse cx="165" cy="122" rx="9" ry="6" fill="rgba(255,107,53,0.25)"/>

      {/* Corpo */}
      <path
        d="M80 190 C70 175 65 175 70 195 L75 230 Q80 245 140 245 Q200 245 205 230 L210 195 C215 175 210 175 200 190 C190 200 175 210 140 212 C105 210 90 200 80 190Z"
        fill="#1a2340"
        stroke="#FFD166"
        strokeWidth="2.5"
      />

      {/* Painel de controle */}
      <rect x="118" y="215" width="44" height="22" rx="4" fill="#0A0E1A" stroke="#FFD166" strokeWidth="1.5"/>
      <circle cx="128" cy="226" r="4" fill="#E63946"/>
      <circle cx="140" cy="226" r="4" fill="#FFD166"/>
      <circle cx="152" cy="226" r="4" fill="#7EFBFD"/>

      {/* Braços */}
      <path d="M80 190 C65 185 50 190 45 210 C42 222 50 230 58 225 L75 210Z" fill="#1a2340" stroke="#FFD166" strokeWidth="2.5"/>
      <path d="M200 190 C215 185 230 190 235 210 C238 222 230 230 222 225 L205 210Z" fill="#1a2340" stroke="#FFD166" strokeWidth="2.5"/>

      {/* Luvas */}
      <ellipse cx="50" cy="225" rx="14" ry="12" fill="#FFD166"/>
      <ellipse cx="230" cy="225" rx="14" ry="12" fill="#FFD166"/>

      {/* Sparkles */}
      <g className={styles.sparkle}>
        <path d="M48 160 L51 167 L58 170 L51 173 L48 180 L45 173 L38 170 L45 167Z" fill="#FFD166" opacity="0.9"/>
      </g>
      <g className={styles.sparkleSlow}>
        <path d="M220 145 L222 150 L227 152 L222 154 L220 159 L218 154 L213 152 L218 150Z" fill="#7EFBFD" opacity="0.8"/>
      </g>
    </svg>
  )
}

