import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QUIZ_QUESTIONS } from '@/data/quiz'
import { getNarrationById } from '@/data/narration'
import NarrationPlayer from '@/components/NarrationPlayer'
import StarField from '@/components/StarField'
import styles from './QuizPage.module.css'

export default function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const chapterId = searchParams.get('chapter')

  // Seleciona as perguntas (embaralhadas) no carregamento inicial do Quiz
  const [questions] = useState(() => {
    let pool = QUIZ_QUESTIONS
    if (chapterId) {
      pool = QUIZ_QUESTIONS.filter(q => q.chapterId === chapterId)
    }
    
    // Embaralha aleatoriamente
    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    // Seleciona 10 perguntas estourando (todas as rodadas terão 10 questões, ou o máximo que houver)
    return shuffled.slice(0, 10)
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [feedbackNarration, setFeedbackNarration] = useState<any>(getNarrationById('quiz-intro'))

  const currentQuestion = questions[currentStep]
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? ((currentStep + 1) / totalQuestions) * 100 : 0


  // Ao responder
  const handleAnswer = (answer: string | boolean) => {
    if (isAnswered || !currentQuestion) return
    
    setSelectedAnswer(answer)
    setIsAnswered(true)

    const isCorrect = answer === currentQuestion.correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 1)
      setFeedbackNarration(getNarrationById('quiz-success'))
    } else {
      setFeedbackNarration(getNarrationById('quiz-error'))
    }

    // Avanço automático após 3 segundos
    setTimeout(() => {
      if (currentStep < totalQuestions - 1) {
        setCurrentStep(prev => prev + 1)
        setIsAnswered(false)
        setSelectedAnswer(null)
        setFeedbackNarration(null) // Reset para a próxima
      } else {
        setShowResult(true)
      }
    }, 4000)
  }

  if (showResult) {
    return <ResultScreen score={score} total={totalQuestions} navigate={navigate} />
  }

  return (
    <div className={styles.quizPage}>
      <StarField />
      
      {/* Header do Quiz */}
      <header className={styles.quizHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/capitulos')}>✕ Sair</button>
        <div className={styles.progressContainer}>
           <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.stepIndicator}>Questão {currentStep + 1}/{totalQuestions}</span>
      </header>

      <main className={styles.quizMain}>
        {/* Card de Pergunta */}
        <section className={`${styles.questionCard} ${isAnswered ? styles.cardAnswered : ''}`}>
          {currentQuestion && <span className={styles.categoryBadge}>{currentQuestion.chapterId.replace(/-/g, ' ')}</span>}
          <h2 className={styles.questionText}>{currentQuestion?.question}</h2>

          <div className={styles.optionsGrid}>
            {currentQuestion?.type === 'multiple-choice' ? (
              currentQuestion?.options?.map((opt, i) => (
                <OptionButton 
                  key={i} 
                  label={opt} 
                  isSelected={selectedAnswer === opt}
                  isCorrect={isAnswered && opt === currentQuestion?.correctAnswer}
                  isWrong={isAnswered && selectedAnswer === opt && opt !== currentQuestion?.correctAnswer}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswered}
                />
              ))
            ) : currentQuestion?.type === 'true-false' ? (
              <>
                <OptionButton 
                  label="Verdadeiro" 
                  isSelected={selectedAnswer === true}
                  isCorrect={isAnswered && currentQuestion?.correctAnswer === true}
                  isWrong={isAnswered && selectedAnswer === true && currentQuestion?.correctAnswer === false}
                  onClick={() => handleAnswer(true)}
                  disabled={isAnswered}
                />
                <OptionButton 
                  label="Falso" 
                  isSelected={selectedAnswer === false}
                  isCorrect={isAnswered && currentQuestion?.correctAnswer === false}
                  isWrong={isAnswered && selectedAnswer === false && currentQuestion?.correctAnswer === true}
                  onClick={() => handleAnswer(false)}
                  disabled={isAnswered}
                />
              </>
            ) : null}
          </div>

          {/* Feedback do Théo */}
          {isAnswered && currentQuestion && (
            <div className={`${styles.explanationBox} animate-fade-in`}>
               <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </section>
      </main>

      {/* Narração do Théo */}
      {feedbackNarration && (
        <div className={styles.narrationPortal}>
          <NarrationPlayer 
            key={feedbackNarration.id}
            narration={feedbackNarration}
            autoPlay={true}
          />
        </div>
      )}
    </div>
  )
}

function OptionButton({ label, isSelected, isCorrect, isWrong, onClick, disabled }: any) {
  let statusClass = ''
  if (isCorrect) statusClass = styles.correct
  else if (isWrong) statusClass = styles.wrong
  else if (isSelected) statusClass = styles.selected

  return (
    <button 
      className={`${styles.optionBtn} ${statusClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

function ResultScreen({ score, total, navigate }: any) {
  const percentage = (score / total) * 100
  let message = "Precisa estudar mais um pouquinho, astronauta! 🚀"
  let icon = "🔭"

  if (percentage === 100) {
    message = "UAU! Você é um verdadeiro Comandante Espacial! 👑"
    icon = "👨‍🚀"
  } else if (percentage >= 70) {
    message = "Muito bem! Você conhece bem o nosso universo! 🌟"
    icon = "🚀"
  } else if (percentage >= 50) {
    message = "Boa! Você aprendeu bastante coisa legal! 👍"
    icon = "🌎"
  }

  return (
    <div className={styles.resultOverlay}>
      <StarField />
      <div className={styles.resultCard}>
        <span className={styles.resultIcon}>{icon}</span>
        <h1 className={styles.resultTitle}>Viagem Concluída!</h1>
        <div className={styles.scoreCircle}>
           <span className={styles.scoreText}>{score}/{total}</span>
        </div>
        <p className={styles.resultMsg}>{message}</p>
        
        <div className={styles.resultActions}>
          <button className={styles.restartBtn} onClick={() => window.location.reload()}>Refazer Quiz</button>
          <button className={styles.homeBtn} onClick={() => navigate('/capitulos')}>Voltar aos Capítulos</button>
        </div>
      </div>
    </div>
  )
}
