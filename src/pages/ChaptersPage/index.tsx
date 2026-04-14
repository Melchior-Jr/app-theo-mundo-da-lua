import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import StarField from '@/components/StarField'
import ChapterCard from '@/components/ChapterCard'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { getNarrationById } from '@/data/narration'
import { useSound } from '@/context/SoundContext'
import { Navbar } from '@/components/Navbar'
import { MissionsModal } from '@/components/MissionsModal'
import { ChapterService, DBChapter } from '@/services/chapterService'
import { SubjectService, Subject } from '@/services/subjectService'
import styles from './ChaptersPage.module.css'

export default function ChaptersPage() {
  const { user } = useAuth()
  const { subjectSlug } = useParams<{ subjectSlug?: string }>()
  const { 
    playerData,
    progress,
    explorationLogs 
  } = usePlayer()

  const [chapters, setChapters] = useState<DBChapter[]>([])
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [selectedMissionsChapter, setSelectedMissionsChapter] = useState<any>(null)
  const [chapterMissionsMap, setChapterMissionsMap] = useState<Record<string, any>>({})

  const { playBGMusic, playSFX } = useSound()
  const [narration, setNarration] = useState<any>(null)
  const { setActiveNarration, isGlobalLoading } = useNarrationSequence()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const slug = subjectSlug || 'astronomia'
        const currentSubject = await SubjectService.getBySlug(slug)
        setSubject(currentSubject)

        if (currentSubject) {
          const chaptersData = await ChapterService.getBySubject(currentSubject.id, playerData?.is_tester)

          // Narração dinâmica baseada no slug ou campo da matéria
          const subjectNarration = getNarrationById(`journey-${slug}`) || getNarrationById('chapters-selection')
          setNarration(subjectNarration)

          // Carregar missões de todos os capítulos para o mapa antes de setar os capítulos
          const missionsMap: Record<string, any> = {}
          await Promise.all(
            chaptersData.map(async (ch) => {
              const m = await ChapterService.getMissions(ch.id)
              missionsMap[ch.id] = m
            })
          )
          
          setChapterMissionsMap(missionsMap)
          setChapters(chaptersData)
        }
      } catch (err) {
        console.error('Erro ao carregar capítulos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [subjectSlug, playerData?.is_tester])

  useEffect(() => {
    if (isGlobalLoading || loading) return

    if (narration) setActiveNarration(narration)
    playBGMusic()
  }, [narration, setActiveNarration, playBGMusic, isGlobalLoading, loading])

  // Lógica de scroll e notificações centralizada na Navbar


  return (
    <div className={styles.page}>
      <StarField />

      <Navbar />

      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div className={`${styles.headingGroup} opacity-0 animate-slide-up delay-100`}>
            <p className={styles.pageLabel}>{subject?.name || 'Jornada Galáctica'}</p>
            <h1 className={styles.pageTitle}>{subject?.description || 'O que você quer explorar?'}</h1>
          </div>

          <div className={`${styles.progressPills} opacity-0 animate-fade-in delay-200`}>
            {chapters.map((c) => (
              <Link key={c.id} to={c.path} className={styles.pill} style={{ '--pill-color': c.color } as React.CSSProperties} />
            ))}
          </div>
        </header>

        <div className={styles.grid}>
          {chapters.map((chapter, i) => {
            const isCompleted = progress.some((p: any) => p.chapter_id === chapter.id && p.completed)
            
            // Calcula XP Ganho (Conclusão + Exploração)
            const chapterCompletionXP = isCompleted ? (chapter.xp_award || 0) : 0
            
            const chapterMissions = chapterMissionsMap[chapter.id] || []
            
            // Filtra missões de exploração concluídas
            const explorationXP = chapterMissions
              .filter((m: any) => m.category !== 'completion')
              .filter((m: any) => explorationLogs.some((log: any) => log.exploration_id === m.id))
              .reduce((sum: number, m: any) => sum + m.xp, 0)

            // O totalMaxXP é o xp_award (conclusão) + soma das missões que NÃO são de conclusão
            const totalMaxXP = (chapter.xp_award || 0) + chapterMissions
              .filter((m: any) => m.category !== 'completion')
              .reduce((sum: number, m: any) => sum + m.xp, 0)

            const totalEarned = Math.min(chapterCompletionXP + explorationXP, totalMaxXP)

            return (
              <ChapterCard 
                key={chapter.id} 
                chapter={chapter as any} // Cast temporário enquanto unificamos tipos
                featured={i === 0}
                animationDelay={150 + i * 100} 
                isCompleted={isCompleted} 
                xpEarned={totalEarned}
                xpTotal={totalMaxXP}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    setShowAuth(true)
                  }
                }}
                onXPClick={() => {
                  const missions = chapterMissionsMap[chapter.id]
                  if (missions) {
                    setSelectedMissionsChapter({
                      chapterMissions: { chapterId: chapter.id, missions },
                      isCompleted,
                      color: chapter.color
                    })
                  }
                }}
              />
            )
          })}

          <Link 
            to="/jogos" 
            className={styles.quizCard} 
            style={{ animationDelay: '600ms' }}
            onClick={() => playSFX('click')}
          >
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

      {showAuth && (
        <div className={styles.authModal}>
          <div className={styles.authModalContent}>
            <h2>Seja bem-vindo, Astronauta!</h2>
            <p>Para salvar seu progresso e ganhar XP, você precisa estar logado.</p>
            <div className={styles.authModalButtons}>
              <Link to="/login" className={styles.authModalPrimary}>Ir para Login</Link>
              <button onClick={() => setShowAuth(false)} className={styles.authModalSecondary}>Continuar como Visitante</button>
            </div>
          </div>
        </div>
      )}

      {/* SettingsModal removido pois agora está na Navbar */}

      {selectedMissionsChapter && (
        <MissionsModal
          isOpen={!!selectedMissionsChapter}
          onClose={() => setSelectedMissionsChapter(null)}
          chapterMissions={selectedMissionsChapter.chapterMissions}
          explorationLogs={explorationLogs}
          isChapterCompleted={selectedMissionsChapter.isCompleted}
          chapterColor={selectedMissionsChapter.color}
        />
      )}
    </div>
  )
}
