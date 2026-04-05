import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { unlockAudio } from '@/hooks/useNarration'
import styles from './LoginPage.module.css'

// Estrelas geradas uma única vez fora do componente (performance)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.2 + 0.4,
  duration: (Math.random() * 4 + 2).toFixed(1),
  delay: (Math.random() * 5).toFixed(1),
  minOp: (Math.random() * 0.1 + 0.04).toFixed(2),
  maxOp: (Math.random() * 0.45 + 0.35).toFixed(2),
}))

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()

  // Auth state
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [school, setSchool] = useState('')
  const [className, setClassName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/jogos', { replace: true })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) navigate('/jogos', { replace: true })
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const switchMode = useCallback((next: AuthMode) => {
    setMode(next)
    setError(null)
    setSuccessMsg(null)
    setConfirmPassword('')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('As senhas não coincidem 🔑 Confere aí!')
      setLoading(false)
      return
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setSuccessMsg('Boa! Partiu missão 😎🚀')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username,
              school,
              class_name: className,
              birth_date: birthDate || null,
            },
          },
        })
        if (error) throw error
        setSuccessMsg('Conta criada! Confirma seu e-mail e depois faz login 🚀')
      }

      // Unlock audio context on user gesture
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('')
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u)
      }
      unlockAudio()

      if (mode === 'login') {
        navigate('/jogos', { replace: true })
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : ''
      const friendlyError = raw.includes('Invalid login credentials')
        ? 'Eita… e-mail ou senha errados 😅 Tenta de novo aí!'
        : raw.includes('already registered')
          ? 'Esse e-mail já tem conta! Faz login 😉'
          : raw || 'Eita… algo não bateu 😅 Tenta de novo aí!'
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/jogos' },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Coloca teu e-mail no campo acima primeiro 👆')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccessMsg('Link de redefinição enviado pro teu e-mail 📬')
  }

  return (
    <div className={styles.page}>

      {/* Stars */}
      <div className={styles.stars} aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className={styles.star}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--dur': `${s.duration}s`,
              '--del': `${s.delay}s`,
              '--min': s.minOp,
              '--max': s.maxOp,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Nebulae */}
      <div className={styles.nebula1} aria-hidden="true" />
      <div className={styles.nebula2} aria-hidden="true" />

      {/* Layout */}
      <div className={styles.layout}>

        {/* ── Hero side (desktop only) ── */}
        <aside className={styles.hero} aria-hidden="true">
          <div className={styles.heroBadge}>
            <span>🛰️</span>
            <span>Portal da Estação Espacial</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTheo}>Théo</span>
            <span className={styles.heroNoMundo}>no Mundo</span>
            <span className={styles.heroDaLua}>da Lua 🌙</span>
          </h1>

          <p className={styles.heroSub}>
            Explore planetas, constelações e muito mais. Faça login para retomar sua aventura ou crie uma conta e se torne um astronauta.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>8+</span>
              <span className={styles.statLabel}>Capítulos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>100+</span>
              <span className={styles.statLabel}>Descobertas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>3D</span>
              <span className={styles.statLabel}>Explorador</span>
            </div>
          </div>
        </aside>

        {/* ── Auth Card ── */}
        <main className={styles.card}>
          <div className={styles.cardGlow} aria-hidden="true" />


          {/* Header */}
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {mode === 'login' ? 'Entrar na Nave' : 'Criar cadastro'}
            </h2>
            <p className={styles.cardSub}>
              {mode === 'login'
                ? 'preenche aí pra gente saber se você é você mesmo'
                : 'Preencha os dados do astronauta'}
            </p>
          </div>

          {/* Google first (login mode) */}
          {mode === 'login' && (
            <>
              <button
                type="button"
                className={styles.googleBtn}
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Entrar com Google"
              >
                <FcGoogle size={20} />
                <span>Entrar rápido com Google</span>
              </button>

              <div className={styles.divider}>
                <span>ou entre com e-mail</span>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            {/* Signup-only fields */}
            {mode === 'signup' && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="fullName">Nome do Astronauta</label>
                  <input
                    id="fullName"
                    type="text"
                    className={styles.input}
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="nick">Apelido</label>
                  <input
                    id="nick"
                    type="text"
                    className={styles.input}
                    placeholder="Ex: theo_lunar"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="school">Escola</label>
                    <input
                      id="school"
                      type="text"
                      className={styles.input}
                      placeholder="Sua escola"
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="class">Turma</label>
                    <input
                      id="class"
                      type="text"
                      className={styles.input}
                      placeholder="Ex: 5º A"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="birth">Data de Nascimento</label>
                  <input
                    id="birth"
                    type="date"
                    className={styles.input}
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">E-mail Galáctico</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <div className={styles.passwordLabelRow}>
                <label htmlFor="password">Senha Secreta</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={handleForgotPassword}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputPassword}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password — signup only */}
            {mode === 'signup' && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputPassword} ${confirmPassword && confirmPassword !== password ? styles.inputError : ''
                      }`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span className={styles.fieldHint}>As senhas não coincidem</span>
                )}
              </div>
            )}
            {error && <div className={styles.feedbackError} role="alert">⚠️ {error}</div>}
            {successMsg && <div className={styles.feedbackSuccess} role="status">✅ {successMsg}</div>}

            {/* Primary CTA */}
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading
                ? <><span className={styles.spinner} />Preparando a nave…</>
                : mode === 'login'
                  ? '🚀 Entrar'
                  : '🛸 Criar minha conta'}
            </button>
          </form>

          {/* Mode switch */}
          <p className={styles.switchText}>
            {mode === 'login' ? (
              <>
                Ainda não tem conta? 😅{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => switchMode('signup')}
                >
                  Bora criar uma e começar a missão! 🚀
                </button>
              </>
            ) : (
              <>
                Já é astronauta?{' '}
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={() => switchMode('login')}
                >
                  Fazer login
                </button>
              </>
            )}
          </p>
        </main>
      </div>

      <p className={styles.pageFooter}>© 2025 Théo no Mundo da Lua · Todos os direitos reservados</p>
    </div>
  )
}
