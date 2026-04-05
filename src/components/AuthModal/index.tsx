import React, { useState, useCallback } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { Eye, EyeOff, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import styles from './AuthModal.module.css'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

type AuthMode = 'login' | 'signup'

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [school, setSchool] = useState('')
  const [className, setClassName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

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

      onSuccess()
      onClose()
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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.card} onClick={e => e.stopPropagation()}>

        {/* Linha glow topo */}
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* Fechar */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>


        {/* Header */}
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            {mode === 'login' ? 'Entrar na Nave' : 'Criar cadastro'}
          </h2>
          <p className={styles.cardSub}>
            {mode === 'login'
              ? 'Preencha seus dados para decolar'
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
                <label htmlFor="am-fullName">Nome do Astronauta</label>
                <input
                  id="am-fullName"
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
                <label htmlFor="am-nick">Apelido</label>
                <input
                  id="am-nick"
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
                  <label htmlFor="am-school">Escola</label>
                  <input
                    id="am-school"
                    type="text"
                    className={styles.input}
                    placeholder="Sua escola"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="am-class">Turma</label>
                  <input
                    id="am-class"
                    type="text"
                    className={styles.input}
                    placeholder="Ex: 5º A"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="am-birth">Data de Nascimento</label>
                <input
                  id="am-birth"
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
            <label htmlFor="am-email">E-mail Galáctico</label>
            <input
              id="am-email"
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
              <label htmlFor="am-password">Senha Secreta</label>
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
                id="am-password"
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
              <label htmlFor="am-confirm">Confirmar Senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="am-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputPassword} ${
                    confirmPassword && confirmPassword !== password ? styles.inputError : ''
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

          {/* Feedback */}
          {error      && <div className={styles.feedbackError}   role="alert" >⚠️ {error}</div>}
          {successMsg && <div className={styles.feedbackSuccess} role="status">{successMsg}</div>}

          {/* CTA principal */}
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading
              ? <><span className={styles.spinner} />Preparando a nave…</>
              : mode === 'login'
                ? '🚀 Entrar'
                : '🛸 Criar minha conta'}
          </button>
        </form>

        {/* Switch mode */}
        <p className={styles.switchText}>
          {mode === 'login' ? (
            <>
              Ainda não tem conta? 😅{' '}
              <button type="button" className={styles.switchLink} onClick={() => switchMode('signup')}>
                Bora criar uma e começar a missão! 🚀
              </button>
            </>
          ) : (
            <>
              Já é astronauta?{' '}
              <button type="button" className={styles.switchLink} onClick={() => switchMode('login')}>
                Fazer login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
