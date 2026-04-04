import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Rocket, Menu, X } from 'lucide-react'
import StarField from '@/components/StarField'
import NarrationPlayer from '@/components/NarrationPlayer'
import DeviceMockup from '@/components/DeviceMockup'
import TheoCharacter from '@/components/TheoCharacter'
import { getNarrationById } from '@/data/narration'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [photoSlots, setPhotoSlots] = useState([0, 1, 2]) // [Left, Center, Right]
  const homeNarration = getNarrationById('home')

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePhotoClick = (photoIdx: number) => {
    const clickedSlot = photoSlots.indexOf(photoIdx)
    if (clickedSlot === 1) return // Already center

    const newSlots = [...photoSlots]
    const currentCenter = newSlots[1]
    newSlots[1] = photoIdx
    newSlots[clickedSlot] = currentCenter
    setPhotoSlots(newSlots)
  }

  const getSlotClass = (photoIdx: number) => {
    const slot = photoSlots.indexOf(photoIdx)
    if (slot === 0) return styles.posLeft
    if (slot === 1) return styles.posCenter
    return styles.posRight
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Normaliza a posição do mouse para o centro do componente do Théo
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <div className={styles.page}>
      <StarField />

      {/* Planetas decorativos de fundo */}
      <div className={styles.planetLarge} />
      <div className={styles.planetSmall} />
      <div className={styles.ringSystem} />

      {/* NAVBAR */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            {!scrolled ? (
              <div className={styles.logoMoon}>
                <div className={styles.moon}></div>
                <div className={styles.glow}></div>
              </div>
            ) : (
              <div className={styles.logoText}>
                <span className={styles.theo}>Théo</span>
                <span className={styles.noMundo}> no Mundo</span>
                <span className={styles.daLuaNav}>
                  da Lua
                  <span className={styles.moonEmojiNav}>🌙</span>
                </span>
              </div>
            )}
          </Link>

          {/* Botão Hamburger para Mobile */}
          <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <a href="#théo" className={styles.navLink} onClick={closeMenu}>O THÉO</a>
            <a href="#app" className={styles.navLink} onClick={closeMenu}>O APP</a>
            <a href="#download" className={styles.navLink} onClick={closeMenu}>DOWNLOAD</a>
            <Link to="/login" className={styles.loginBtn} onClick={closeMenu}>LOGIN</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.schoolBadge}>
              <span className={styles.badgeIcon}>🎓</span>
              <span>Trabalho de Ciências • 5º Ano C</span>
            </div>

            <h1 className={styles.title}>
              <span className={styles.theo}>Théo</span>
              <br />
              <span className={styles.noMundo}>no Mundo</span>
              <br />
              <span className={styles.daLua}>
                da Lua
                <span className={styles.moonEmoji}>🌙</span>
              </span>
            </h1>

            <p className={styles.taglineDesktop}>
              Bora explorar o espaço comigo? 👨‍🚀
              <br />
              Você vai aprender sobre os planetas, a Lua e os mistérios do universo de um jeito leve e divertido… sem aula chata.
              <br />
              Esse projeto é um trabalho que eu fiz pra escola e ficou muito legal, então bora nessa missão comigo!🚀✨
            </p>

            <p className={styles.taglineMobile}>
              Bora explorar o espaço comigo? 👨‍🚀
              <br />
              Aprenda sobre os planetas, a Lua e o universo de um jeito leve e sem aula chata 😂
              <br />
              Esse projeto foi feito pra escola… e ficou tão legal que vale virar missão! 🚀✨
            </p>

            <div className={styles.ctaGroup}>
              <Link to="/explorar" className={styles.primaryBtn}>
                <Rocket size={20} />
                EXPLORAR AGORA
              </Link>
              <button className={styles.secondaryBtn}>
                <Download size={20} />
                INSTALAR APP
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <DeviceMockup />
          </div>

          {/* Narrador Théo restrito ao Hero (não persegue o scroll) */}
          {homeNarration && (
            <NarrationPlayer
              narration={homeNarration}
              autoPlay={false}
              floating={true}
              sticky={false}
            />
          )}
        </section>

        {/* SECTION: CONHEÇA O THÉO - O CRIADOR */}
        <section id="théo" className={styles.theoSection} onMouseMove={handleMouseMove}>
          <div className={styles.theoGlassCard}>
            <div className={styles.theoVisualContainer}>
              <TheoCharacter
                size={320}
                lookAt={mousePos}
                emotion="default"
              />
            </div>

            <div className={styles.theoTextContent}>
              <h2>Quem sou <span>eu?</span> <span className={styles.theoEmojiWave}>👋</span></h2>

              <div className={styles.theoInfo}>
                <span className={styles.infoTag}>👦 Théo</span>
                <span className={styles.infoTag}>🎂 10 Anos</span>
                <span className={styles.infoTag}>🎓 5º Ano C</span>
                <span className={styles.infoTag}>📚 Trabalho de Ciências</span>
                <span className={styles.infoTag}>🎤 Cantor</span>
              </div>

              <div className={styles.theoSpeechBubble}>
                <div className={styles.theoSpeechDesktop}>
                  "Fala galera! Eu sou o Théo! 😄<br />
                  Esse projeto começou como um trabalho da escola… mas eu queria fazer algo mais legal que só um texto 😅<br /><br />
                  Eu sempre curti explorar, imaginar… e também estar com um microfone na mão 🎤🎸<br />
                  então resolvi juntar tudo e transformar isso em uma aventura narrada, onde dá pra aprender brincando 🚀✨"
                </div>
                <div className={styles.theoSpeechMobile}>
                  "Fala galera! Eu sou o Théo! 😄<br />
                  Esse projeto começou na escola… mas eu queria fazer algo mais legal, então juntei a minha curiosidade, o notebook do papai e meu microfone 🎤🎸 😅
                  <br /><br />
                  Transformei tudo em uma aventura pra aprendermos brincando 🚀✨"
                </div>
              </div>

              <p className={styles.hiddenMobile} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
                "Foi muita pesquisa, mas também foi muito divertido… e no final deu pra ver que aprender pode ser tão massa quanto jogar videogame 😎"
              </p>

            </div>

            {/* BASTIDORES GALLERY */}
            <div className={styles.theoGallery}>
              <div
                className={`${styles.polaroid} ${getSlotClass(0)}`}
                onClick={() => handlePhotoClick(0)}
              >
                <img src="/images/theo_planning.png" alt="Planejando a missão" />
                <span className={styles.polaroidLabel}>💡 Idealizando Tudo</span>
              </div>
              <div
                className={`${styles.polaroid} ${getSlotClass(1)}`}
                onClick={() => handlePhotoClick(1)}
              >
                <img src="/images/theo_recording.png" alt="Gravando a voz" />
                <span className={styles.polaroidLabel}>🎙️ Gravando Voz</span>
              </div>
              <div
                className={`${styles.polaroid} ${getSlotClass(2)}`}
                onClick={() => handlePhotoClick(2)}
              >
                <img src="/images/theo_coding.png" alt="Programando o app" />
                <span className={styles.polaroidLabel}>💻 Mão no Código</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: EXPLORE O APP (UNIFICADA) */}
        <section id="app" className={`${styles.section} ${styles.appExplorer}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.badge}>O UNIVERSO NO SEU DISPOSITIVO 🚀</span>
              <h2>O que você vai <span>encontrar?</span></h2>
              <p className={styles.hiddenMobile}>Aqui você junta a curiosidade de descobrir o espaço com a diversão dos desafios… e quando vê, já tá viciado em aprender 😂🚀</p>
            </div>

            {/* FEATURE 1: MISSÕES */}
            <div className={styles.featureRow}>
              <div className={styles.textContent}>
                <div className={`${styles.featureTag} ${styles.hiddenMobile}`}>MISSÕES DE CONHECIMENTO 🌌</div>
                <h3>Jornada<br className={styles.hiddenDesktop} /><span> Galáctica</span></h3>
                <p className={styles.hiddenMobile}>
                  "Aqui não é aula chata não 😂 é tipo uma viagem pelo espaço enquanto você aprende sem nem perceber!"<br /><br />
                  Explore capítulos interativos que cobrem desde as fases da lua até a imensidão das constelações,
                  tudo guiado pela narração lúdica do Théo.
                </p>
                <p className={styles.hiddenDesktop}>
                  Aqui não é aula chata não! 😂<br />
                  Bora numa viagem pelo espaço pra aprender brincando 🚀✨<br />
                  Vem explorar a Lua, os planetas e as constelações comigo 👨‍🚀🌌
                </p>
              </div>
              <div className={styles.visualContent}>
                {/* MONITOR (DESKTOP) */}
                <div className={styles.monitorMockup}>
                  <div className={styles.monitorScreenShell}>
                    <img
                      src="/images/missions_preview.png"
                      alt="Interface de Missões"
                      className={styles.valueImg}
                    />
                  </div>
                  <div className={styles.monitorStand} />
                  <div className={styles.monitorBase} />
                </div>

                {/* CELULAR (MOBILE SOLO) */}
                <div className={styles.mobileMockupSolo}>
                  <img
                    src="/images/missions_preview_mobile.png"
                    alt="Interface Mobile Missões"
                  />
                </div>
              </div>
              <Link to="/capitulos" className={styles.ctaBtn}>
                DESCUBRIR MISSÕES
              </Link>
            </div>

            {/* FEATURE 2: JOGOS */}
            <div className={`${styles.featureRow} ${styles.rowReverse}`}>
              <div className={styles.textContent}>
                <div className={`${styles.featureTag} ${styles.hiddenMobile}`}>ARENA DE DESAFIOS 🎮</div>
                <h3>Divertido como <span>videogame</span></h3>
                <p className={styles.hiddenMobile}>
                  "Aprender jogando é bem melhor vai 😂 tem foguete, tem alien, tem desafio… e sem perceber você já tá sabendo tudo!"<br /><br />
                  Ponha seus conhecimentos à prova com o Quiz Cósmico, desvie de meteoros no Duelo Espacial e defenda a galáxia com o Théo!
                </p>
                <p className={styles.hiddenDesktop}>
                  Aprender jogando é bem melhor 🚀<br />
                  tem foguete, alien e desafios…<br />
                  e você nem percebe que está aprendendo!
                </p>
                <div className={`${styles.gameListTags} ${styles.hiddenMobile}`}>
                  <span>🧠 QUIZ</span>
                  <span>⚔️ DUELO</span>
                  <span>🛸 INVASORES</span>
                </div>
              </div>
              <div className={styles.visualContent}>
                {/* TRÍPLO MOCKUP (DESKTOP) */}
                <div className={`${styles.tripleMobileContainer} ${styles.hiddenMobile}`}>
                  <div className={styles.mobileMockup}>
                    <img src="/images/games_preview_03.png" alt="Quiz Cósmico Mobile" />
                  </div>
                  <div className={styles.mobileMockup}>
                    <img src="/images/games_preview_01.png" alt="Duelo Espacial Mobile" />
                  </div>
                  <div className={styles.mobileMockup}>
                    <img src="/images/games_preview_02.png" alt="Invasores Mobile" />
                  </div>
                </div>

                {/* SINGLE MOCKUP (MOBILE SOLO) */}
                <div className={`${styles.mobileMockupSolo} ${styles.hiddenDesktop}`}>
                  <img
                    src="/images/games_preview_01.png"
                    alt="Interface Mobile Arena de Desafios"
                  />
                </div>
              </div>
              <Link to="/jogos" className={styles.ctaBtn}>
                BORA JOGAR!
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: DOWNLOAD - UNIVERSO EM SUAS MÃOS */}
        <section id="download" className={`${styles.section} ${styles.downloadSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.badge}>💻 📱 Disponível em qualquer dispositivo</span>
              <h2>O universo na <span>palma da sua mão</span></h2>
              <div className={styles.hiddenMobile}>
                <p>
                  É só abrir e já começar a explorar o universo comigo 👨‍🚀✨<br />
                  Funciona direto no seu celular, tablet ou computador, o espaço vai com você pra qualquer lugar 🚀😄!
                </p>
              </div>
              <div className={styles.hiddenDesktop}>
                <p>
                  É só abrir e começar a explorar comigo 👨‍🚀✨<br />
                  Funciona no celular, tablet ou computador. 🚀
                </p>
              </div>
            </div>

            <div className={styles.trustBadges}>
              <span>✨ 100% GRÁTIS</span>
              <span>🎓 EDUCATIVO</span>
              <span>🛡️ SEGURO</span>
            </div>

            {/* ELEMENTO DECORATIVO (ILUSTRAÇÃO OFICIAL) */}
            <div className={styles.astronautDecoration}>
              <TheoCharacter size={200} emotion="bounce" />
            </div>

            <div className={styles.deviceStack}>
              {/* DESKTOP (BACK) */}
              <div className={`${styles.stackItem} ${styles.monitorFrame}`}>
                <div className={styles.monitorShell}>
                  <div className={styles.monitorScreen}>
                    <img src="/images/mockup_pc.png" alt="Théo no PC" />
                  </div>
                  <div className={styles.monitorStandMini} />
                  <div className={styles.monitorBaseMini} />
                </div>
              </div>

              {/* TABLET (FRONT LEFT) */}
              <div className={`${styles.stackItem} ${styles.tabletFrame}`}>
                <div className={styles.tabletShell}>
                  <div className={styles.tabletScreen}>
                    <img src="/images/mockup_tablet.png" alt="Théo no Tablet" />
                  </div>
                </div>
              </div>

              {/* MOBILE (FRONT RIGHT) */}
              <div className={`${styles.stackItem} ${styles.mobileFrame}`}>
                <div className={styles.mobileShell}>
                  <div className={styles.mobileScreen}>
                    <img src="/images/mockup_mobile.png" alt="Théo no Celular" />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÃO DE INSTALAÇÃO UNIFICADO COM A HOME (Abaixo da pilha) */}
            <div className={styles.installBtnContainer}>
              <button className={styles.secondaryBtn}>
                <Download size={20} />
                INSTALAR APP
              </button>
            </div>

            {/* BOTÃO ÚNICO DE INSTALAÇÃO (Substitui as antigas lojas separadas) */}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerTop}>
              <div className={styles.footerBrand}>
                <div className={styles.footerLogo}>
                  <span className={styles.theo}>Théo</span>
                  <br />
                  <span className={styles.noMundo}>no Mundo</span>
                  <br />
                  <span className={styles.daLua}>
                    da Lua
                    <span className={styles.moonEmoji}>🌙</span>
                  </span>
                </div>
                <p>Uma aventura pelo espaço onde você explora, joga e aprende de verdade 🚀</p>
              </div>

              <div className={`${styles.footerLinks} ${styles.hiddenMobile}`}>
                <h4>Navegação</h4>
                <a href="#théo">O Théo</a>
                <a href="#app">O App</a>
                <a href="#download">Instalar</a>
              </div>

              <div className={`${styles.footerLinks} ${styles.hiddenMobile}`}>
                <h4>Explorar</h4>
                <Link to="/capitulos">Jornada Galáctica</Link>
                <Link to="/jogos">Estação de Jogos</Link>
                <Link to="/login">Meu Painel</Link>
              </div>

              <div className={styles.footerLinks}>
                <h4 className={styles.hiddenMobile}>Redes</h4>
                <div className={styles.socialIcons}>
                  <a href="https://wa.me/5567998635674?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20a%20respeito%20do%20projeto%20Th%C3%A9o%20no%20Mundo%20da%20Lua" target="_blank" rel="noopener" aria-label="WhatsApp">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/theo_fernandesmelchior/" target="_blank" rel="noopener" aria-label="Instagram">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@ThéoFMelchior" target="_blank" rel="noopener" aria-label="YouTube">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p>© 2026 Théo no Mundo da Lua • Uma aventura educativa ✨</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
