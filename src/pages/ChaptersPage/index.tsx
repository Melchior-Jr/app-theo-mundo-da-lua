import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import StarField from '@/components/StarField'
import ChapterCard from '@/components/ChapterCard'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { CHAPTERS } from '@/data/chapters'
import { getNarrationById } from '@/data/narration'
import styles from './ChaptersPage.module.css'

/**
 * ChaptersPage — tela de seleção de capítulos.
 * Layout: card featured (primeiro) + grade 3 cards menores.
 */
export default function ChaptersPage() {
  const [featured, ...rest] = CHAPTERS
  const narration = getNarrationById('chapters-selection')
  const { setActiveNarration } = useNarrationSequence()

  useEffect(() => {
    if (narration) {
      setActiveNarration(narration)
    }
    // Limpar quando sair da página (opcional, ou deixar o próximo substituir)
    // return () => setActiveNarration(null)
  }, [narration, setActiveNarration])

  return (
    <div className={styles.page}>
      <StarField />

      <div className={styles.content}>
        {/* Header da página */}
        <header className={styles.pageHeader}>
          <Link
            to="/"
            className={`${styles.homeLink} opacity-0 animate-fade-in`}
            aria-label="Voltar para o início"
            id="btn-home-from-chapters"
          >
            <span aria-hidden="true">🌙</span>
            <span>Início</span>
          </Link>

          <div className={`${styles.headingGroup} opacity-0 animate-slide-up delay-100`}>
            <p className={styles.pageLabel}>Escolha um capítulo</p>
            <h1 className={styles.pageTitle}>O que você quer explorar?</h1>
          </div>

          {/* Indicador de progresso linear */}
          <div
            className={`${styles.progressPills} opacity-0 animate-fade-in delay-200`}
            aria-label="Capítulos disponíveis"
          >
            {CHAPTERS.map((c) => (
              <Link
                key={c.id}
                to={c.path}
                className={styles.pill}
                style={{ '--pill-color': c.color } as React.CSSProperties}
                title={c.title}
                aria-label={`Ir para ${c.title}`}
              />
            ))}
          </div>
        </header>

        {/* Grade de capítulos */}
        <div className={styles.grid}>
          {/* Card em destaque — capítulo 1 */}
          <ChapterCard
            chapter={featured}
            featured
            animationDelay={150}
          />

          {/* Demais capítulos */}
          {rest.map((chapter, i) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              animationDelay={250 + i * 80}
            />
          ))}

          {/* Card Especial da Central de Jogos */}
          <Link to="/jogos" className={styles.quizCard} style={{ animationDelay: '600ms' }}>
            <div className={styles.quizIcon}>🎮</div>
            <div className={styles.quizContent}>
              <span className={styles.quizTag}>CENTRAL DE JOGOS</span>
              <h3 className={styles.quizTitle}>Desafios no Espaço</h3>
              <p className={styles.quizDesc}>Pronto para os jogos do Théo?</p>
            </div>
            <div className={styles.quizArrow}>→</div>
          </Link>
        </div>

        <footer className={`${styles.footer} opacity-0 animate-fade-in delay-800`}>
          <p>🚀 Théo vai te guiar em cada capítulo!</p>
        </footer>
      </div>
    </div>
  )
}
