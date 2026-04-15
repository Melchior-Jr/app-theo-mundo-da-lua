import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StarField from '@/components/StarField'
import ChapterHeader from '@/components/ChapterHeader'
import ChapterContainer from '@/components/ChapterContainer'
import { getChapterById, getAdjacentChapters } from '@/data/chapters'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { useProgress } from '@/hooks/useProgress'
import { useAuth } from '@/context/AuthContext'
import SolarSystemChapter from './SolarSystemChapter'
import EarthMotionsChapter from './EarthMotionsChapter'
import ConstellationsChapter from './ConstellationsChapter'
import MoonPhasesChapter from './MoonPhasesChapter'
import GeosciencesChapter from './GeosciencesChapter'
import { MissionsModal } from '@/components/MissionsModal'
import { CHAPTER_MISSIONS } from '@/data/missions'
import { usePlayer } from '@/context/PlayerContext'
import { ChapterService, DBChapter } from '@/services/chapterService'
import styles from './ChapterPage.module.css'

export default function ChapterPage() {
  const { chapterId: rawChapterId, subStep: urlSubStep } = useParams<{ chapterId: string; subStep?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // FIX: Se o chapterId for o slug da matéria (ex: 'geociencias'), o ID real do capítulo está no subStep.
  // Isso acontece em algumas rotas legadas ou URLs mal formadas.
  const isSubjectSlug = rawChapterId === 'geociencias' || rawChapterId === 'astronomia'
  const chapterId = isSubjectSlug && urlSubStep ? urlSubStep : rawChapterId
  const subStep = isSubjectSlug ? 'overview' : (urlSubStep as 'overview' | 'explorer' || 'overview')

  const chapter = getChapterById(chapterId ?? '')
  const { previous, next } = chapter
    ? getAdjacentChapters(chapter.id)
    : { previous: null, next: null }


  const { 
    viewedPlanets, 
    skipAttempts, 
    setSkipAttempts,
    setNextButtonEffect,
    setActiveNarration,
    setOnNarrationFinish 
  } = useNarrationSequence()
  
  const [showMissions, setShowMissions] = useState(false)
  const [dbChapter, setDbChapter] = useState<DBChapter | null>(null)
  const [loadingDbConfig, setLoadingDbConfig] = useState(true)
  const { explorationLogs, progress: allProgress } = usePlayer()

  // Busca as configurações do capítulo no banco por ID direto (narração e missões)
  useEffect(() => {
    if (!chapterId) {
      setLoadingDbConfig(false)
      return
    }
    setLoadingDbConfig(true)
    ChapterService.getById(chapterId)
      .then(found => {
        setDbChapter(found)
      })
      .catch(() => {})
      .finally(() => setLoadingDbConfig(false))
  }, [chapterId])


  // Flags de comportamento — false enquanto carrega para evitar narração prematura.
  const isAstronomy = ['sistema-solar', 'movimentos-da-terra', 'constelaçoes', 'fases-da-lua'].includes(chapterId || '')
  const narrationEnabled = loadingDbConfig ? false : (dbChapter ? dbChapter.narration_enabled !== false : isAstronomy)
  const missionsEnabled = loadingDbConfig ? true : (dbChapter ? dbChapter.missions_enabled !== false : true)

  const { progress, saveProgress, loading: loadingProgress } = useProgress()

  // 1. Resumo Automático: Se entrar no capítulo básico, pula pro último passo salvo
  useEffect(() => {
    if (loadingProgress || !chapterId || !!urlSubStep) return

    const saved = progress.find(p => p.chapter_id === chapterId)
    if (saved && !saved.completed) {
      if (saved.sub_step === 'explorer' && chapterId === 'sistema-solar') {
         navigate(`/capitulos/${chapterId}/explorer`)
      }
    }
  }, [chapterId, urlSubStep, progress, loadingProgress])

  const handlePrevious = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (chapterId === 'sistema-solar' && subStep === 'explorer') {
      navigate(`/capitulos/sistema-solar/overview`)
      return
    }

    if (previous) {
      saveProgress(chapterId!, 'overview')
      navigate(previous.path)
    }
  }

  const handleNext = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (chapterId === 'sistema-solar' && subStep === 'overview') {
      await saveProgress(chapterId, 'explorer')
      navigate(`/capitulos/sistema-solar/explorer`)
      return
    }

    // Validação para o Explorador do Sistema Solar
    if (chapterId === 'sistema-solar' && subStep === 'explorer') {
      const allPlanetsSeen = viewedPlanets.length >= 8

      if (!allPlanetsSeen) {
        if (skipAttempts === 0) {
          const alert1 = getNarrationById('alert-planets-1')
          if (alert1) setActiveNarration(alert1)
          setSkipAttempts(1)
          setNextButtonEffect(true)
          setTimeout(() => setNextButtonEffect(false), 1000)
          return
        } else {
          const alert2 = getNarrationById('alert-planets-2')
          if (alert2) {
            setOnNarrationFinish(() => async () => {
              await saveProgress(chapterId, 'complete', true)
              if (next) navigate(next.path)
              else navigate('/jogos')
            })
            setActiveNarration(alert2)
          } else {
            await saveProgress(chapterId, 'complete', true)
            if (next) navigate(next.path)
            else navigate('/jogos')
          }
          return
        }
      }
    }

    // Navegação padrão entre capítulos
    await saveProgress(chapterId!, 'complete', true)
    if (next) {
      navigate(next.path)
    } else {
      navigate('/jogos')
    }
  }

  if (!chapter) {
    return (
      <div className={styles.notFound}>
        <StarField />
        <div className={styles.notFoundContent}>
          <span className={styles.notFoundIcon} role="img" aria-label="Rosto de Théo surpreso">😮</span>
          <h1 className={styles.notFoundTitle}>Capítulo não encontrado</h1>
          <p className={styles.notFoundText}>Parece que Théo se perdeu no espaço!</p>
          <button className={styles.notFoundButton} onClick={() => navigate('/capitulos')}>← Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} style={{ '--chapter-color': chapter.color, '--chapter-color-bg': chapter.colorBg } as React.CSSProperties}>
      <StarField />
      <div className={styles.themeGlow} />
      <ChapterHeader 
        chapter={chapter} 
        currentStep={chapter.order} 
        totalSteps={[
          'estrutura-interna', 'rochas-minerais', 'formacao-solo', 
          'erosao-relevo', 'vulcoes-terremotos', 'fenomenos-naturais', 
          'acao-humana', 'sustentabilidade'
        ].includes(chapter.id) ? 8 : 4} 
      />
      <ChapterContainer
        chapter={chapter}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={(chapter.id === 'sistema-solar' && subStep !== 'overview') || !!previous}
        hasNext={true}
        disableNarration={!narrationEnabled || subStep !== 'overview'}
        hideFunFact={subStep !== 'overview' || chapter.id === 'movimentos-da-terra'}
      >
        {/* Adiciona botão de missões fixo no HUD lateral ou flutuante via portal se necessário, 
            mas por enquanto vamos injetar no Container se ele permitir ou ser renderizado aqui como overlay */}
        {missionsEnabled && (
          <button 
            className={styles.missionsToggle}
            onClick={() => setShowMissions(true)}
            title="Ver Missões"
          >
            <span className={styles.missionsIcon}>🎯</span>
            <span className={styles.missionsText}>Missões</span>
          </button>
        )}

        {chapter.id === 'sistema-solar' ? <SolarSystemChapter step={subStep} /> :
         chapter.id === 'movimentos-da-terra' ? <EarthMotionsChapter /> :
         chapter.id === 'constelaçoes' ? <ConstellationsChapter /> :
         chapter.id === 'fases-da-lua' ? <MoonPhasesChapter /> :
         [
           'estrutura-interna', 
           'rochas-minerais', 
           'formacao-solo', 
           'erosao-relevo', 
           'vulcoes-terremotos', 
           'fenomenos-naturais', 
           'acao-humana', 
           'sustentabilidade'
         ].includes(chapter.id) ? <GeosciencesChapter /> :
         <div className={styles.placeholder}>Carregando conteúdo...</div>}
      </ChapterContainer>

      {showMissions && missionsEnabled && (
        <MissionsModal
          isOpen={showMissions}
          onClose={() => setShowMissions(false)}
          chapterMissions={{ chapterId: chapter.id, missions: CHAPTER_MISSIONS[chapter.id] || [] }}
          explorationLogs={explorationLogs}
          isChapterCompleted={allProgress.some((p: any) => p.chapter_id === chapter.id && p.completed)}
          chapterColor={chapter.color}
        />
      )}
    </div>
  )
}
