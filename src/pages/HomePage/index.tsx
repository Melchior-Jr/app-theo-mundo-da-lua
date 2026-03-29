import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import StarField from '@/components/StarField'
import NarrationPlayer from '@/components/NarrationPlayer'
import { getNarrationByChapter } from '@/data/narration'
import styles from './HomePage.module.css'

/**
 * HomePage — tela inicial do Théo no Mundo da Lua.
 * Design: Cosmic Storybook — elementos flutuantes + tipografia massiva.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const homeNarration = getNarrationByChapter('home')
  const [shouldAutoPlay] = useState(false)

  const handleStartJourney = () => {
    navigate('/capitulos')
  }

  return (
    <div className={styles.page}>
      {/* Fundo cósmico animado */}
      <StarField />

      {/* Planetas decorativos */}
      <div className={styles.planetLarge} aria-hidden="true" />
      <div className={styles.planetSmall} aria-hidden="true" />
      <div className={styles.ringSystem} aria-hidden="true" />

      {/* Conteúdo principal */}
      <div className={styles.content}>

        {/* Seção superior — badge da escola */}
        <div className={`${styles.schoolBadge} opacity-0 animate-slide-up delay-100`}>
          <span className={styles.badgeIcon} aria-hidden="true">🎓</span>
          <span>Trabalho de Ciências · 5º Ano C</span>
        </div>

        {/* Layout principal: Théo + Texto */}
        <div className={styles.hero}>

          {/* O Théo agora vem diretamente pelo NarrationPlayer abaixo */}

          {/* Bloco de texto */}
          <div className={styles.textBlock}>
            {/* Título principal */}
            <h1 className={`${styles.title} opacity-0 animate-slide-up delay-200`}>
              <span className={styles.titleTheo}>Théo</span>
              <br />
              <span className={styles.titleRest}>no Mundo</span>
              <br />
              <span className={styles.titleMoon}>
                da Lua
                <span className={styles.moonEmoji} aria-hidden="true">🌙</span>
              </span>
            </h1>

            {/* Tagline / descrição */}
            <p className={`${styles.tagline} opacity-0 animate-slide-up delay-400`}>
              Uma aventura pelo espaço sideral.<br />
              Descubra planetas, estrelas e os segredos do universo!
            </p>

            {/* Narração da Home */}
            {homeNarration && (
              <div className="opacity-0 animate-slide-up delay-500 w-full mb-4">
                <NarrationPlayer 
                  narration={homeNarration} 
                  autoPlay={shouldAutoPlay}
                />
              </div>
            )}

            {/* Botão de ação */}
            <button
              id="btn-start-journey"
              className={`${styles.startButton} opacity-0 animate-slide-up delay-600`}
              onClick={handleStartJourney}
              aria-label="Começar a aventura com Théo"
            >
              <span className={styles.buttonText}>Começar viagem</span>
              <span className={styles.buttonIcon} aria-hidden="true">🚀</span>
              <div className={styles.buttonGlow} aria-hidden="true" />
            </button>

            {/* Botão Secundário de Jogos */}
            <Link 
              to="/jogos" 
              className={`${styles.gamesAccess} opacity-0 animate-slide-up delay-700`}
            >
              <span className={styles.gamesIcon}>🎮</span>
              <span className={styles.gamesText}>Ir para Central de Jogos</span>
            </Link>

            {/* Detalhes da escola */}
            <div className={`${styles.schoolInfo} opacity-0 animate-fade-in delay-700`}>
              <p className={styles.schoolName}>Escola Arassuay Gomes de Castro</p>
              <p className={styles.teacherName}>Professora Marta</p>
            </div>
          </div>
        </div>

        <footer className={`${styles.footer} opacity-0 animate-fade-in delay-800`}>
          <p>Uma jornada educativa criada com carinho ✨</p>
        </footer>
      </div>
    </div>
  )
}
