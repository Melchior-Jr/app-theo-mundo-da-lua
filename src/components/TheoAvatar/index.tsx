import React from 'react'

interface TheoAvatarProps {
  className?: string
  width?: number | string
  height?: number | string
}

const TheoAvatar: React.FC<TheoAvatarProps> = ({ className, width = "120", height = "120" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 280 280" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="Théo, o astronauta aventureiro" 
      role="img" 
      className={className}
    >
      <circle cx="140" cy="110" r="75" fill="#1a2340" stroke="#FFD166" stroke-width="4"></circle>
      <ellipse cx="120" cy="85" rx="28" ry="18" fill="rgba(255,209,102,0.08)"></ellipse>
      <ellipse cx="140" cy="110" rx="52" ry="44" fill="#060C1A"></ellipse>
      <ellipse cx="125" cy="92" rx="16" ry="10" fill="rgba(126,251,253,0.15)"></ellipse>
      <ellipse cx="118" cy="88" rx="6" ry="4" fill="rgba(255,255,255,0.2)"></ellipse>
      <ellipse cx="140" cy="112" rx="36" ry="32" fill="#D29668"></ellipse>
      <g fill="#3B2314" stroke="#2B1B10" stroke-width="0.5">
        <circle cx="106" cy="100" r="14"></circle>
        <circle cx="102" cy="112" r="12"></circle>
        <circle cx="108" cy="88" r="14"></circle>
        <circle cx="174" cy="100" r="14"></circle>
        <circle cx="178" cy="112" r="12"></circle>
        <circle cx="172" cy="88" r="14"></circle>
        <circle cx="140" cy="76" r="18"></circle>
        <circle cx="122" cy="80" r="15"></circle>
        <circle cx="158" cy="80" r="15"></circle>
        <circle cx="130" cy="90" r="6"></circle>
        <circle cx="140" cy="92" r="7"></circle>
        <circle cx="150" cy="90" r="6"></circle>
      </g>
      <ellipse cx="126" cy="108" rx="9" ry="10" fill="#fff"></ellipse>
      <ellipse cx="154" cy="108" rx="9" ry="10" fill="#fff"></ellipse>
      <circle cx="128" cy="110" r="6" fill="#3D6BAF"></circle>
      <circle cx="156" cy="110" r="6" fill="#3D6BAF"></circle>
      <circle cx="129" cy="111" r="3.5" fill="#0A0E1A"></circle>
      <circle cx="157" cy="111" r="3.5" fill="#0A0E1A"></circle>
      <circle cx="131" cy="108" r="1.5" fill="#fff"></circle>
      <circle cx="159" cy="108" r="1.5" fill="#fff"></circle>
      <path d="M117 97 Q126 93 135 97" stroke="#2B1B10" stroke-width="2.5" stroke-linecap="round" fill="none"></path>
      <path d="M145 97 Q154 93 163 97" stroke="#2B1B10" stroke-width="2.5" stroke-linecap="round" fill="none"></path>
      <path d="M128 126 Q140 138 152 126" stroke="#8E5A35" stroke-width="2.5" stroke-linecap="round" fill="none"></path>
      <ellipse cx="115" cy="122" rx="9" ry="6" fill="rgba(255,107,53,0.25)"></ellipse>
      <ellipse cx="165" cy="122" rx="9" ry="6" fill="rgba(255,107,53,0.25)"></ellipse>
      <ellipse cx="140" cy="118" rx="4" ry="3" fill="#B1774A"></ellipse>
      <path d="M80 190 C70 175 65 175 70 195 L75 230 Q80 245 140 245 Q200 245 205 230 L210 195 C215 175 210 175 200 190 C190 200 175 210 140 212 C105 210 90 200 80 190Z" fill="#1a2340" stroke="#FFD166" stroke-width="2.5"></path>
      <rect x="118" y="215" width="44" height="22" rx="4" fill="#0A0E1A" stroke="#FFD166" stroke-width="1.5"></rect>
      <circle cx="128" cy="226" r="4" fill="#E63946"></circle>
      <circle cx="140" cy="226" r="4" fill="#FFD166"></circle>
      <circle cx="152" cy="226" r="4" fill="#7EFBFD"></circle>
      <path d="M80 190 C65 185 50 190 45 210 C42 222 50 230 58 225 L75 210Z" fill="#1a2340" stroke="#FFD166" stroke-width="2.5"></path>
      <path d="M200 190 C215 185 230 190 235 210 C238 222 230 230 222 225 L205 210Z" fill="#1a2340" stroke="#FFD166" stroke-width="2.5"></path>
      <ellipse cx="50" cy="225" rx="14" ry="12" fill="#FFD166"></ellipse>
      <ellipse cx="230" cy="225" rx="14" ry="12" fill="#FFD166"></ellipse>
      <rect x="105" y="178" width="70" height="18" rx="6" fill="#263456" stroke="#FFD166" stroke-width="2"></rect>
      <g>
        <path d="M48 160 L51 167 L58 170 L51 173 L48 180 L45 173 L38 170 L45 167Z" fill="#FFD166" opacity="0.9"></path>
      </g>
      <g>
        <path d="M220 145 L222 150 L227 152 L222 154 L220 159 L218 154 L213 152 L218 150Z" fill="#7EFBFD" opacity="0.8"></path>
      </g>
      <g>
        <path d="M60 240 L62 244 L66 246 L62 248 L60 252 L58 248 L54 246 L58 244Z" fill="#FF6B35" opacity="0.7"></path>
      </g>
    </svg>
  )
}

export default TheoAvatar
