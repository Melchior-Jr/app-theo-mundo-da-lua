import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import styles from './ResetPasswordPage.module.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Supabase envia o access_token no hash da URL após o clique no e-mail
  // O onAuthStateChange detecta o evento PASSWORD_RECOVERY automaticamente
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem 🔑 Confere aí!')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter no mínimo 6 caracteres 🔐')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      await supabase.auth.signOut()
      navigate('/login', { replace: true, state: { resetSuccess: true } })
    }
  }

  return (
    <div className={styles.page}>
      {/* Stars */}
      <div className={styles.stars} aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              '--dur': `${(Math.random() * 3 + 2).toFixed(1)}s`,
              '--del': `${(Math.random() * 4).toFixed(1)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.nebula} aria-hidden="true" />

      <main className={styles.card}>
        <div className={styles.cardGlow} aria-hidden="true" />

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoTheo}>Théo</span>
          <span className={styles.logoNoMundo}>no Mundo</span>
          <span className={styles.logoDaLua}>da Lua 🌙</span>
        </div>

        <div className={styles.cardHeader}>
          <p className={styles.icon}>🔐</p>
          <h1 className={styles.title}>Nova senha</h1>
          <p className={styles.subtitle}>
            {ready
              ? 'Escolha uma senha segura para retomar sua missão 🚀'
              : 'Aguardando verificação do link…'}
          </p>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>

            <div className={styles.inputGroup}>
              <label htmlFor="rp-password">Nova senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="rp-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputPassword}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
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

            <div className={styles.inputGroup}>
              <label htmlFor="rp-confirm">Confirmar nova senha</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="rp-confirm"
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

            {error && (
              <div className={styles.feedbackError} role="alert">⚠️ {error}</div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading
                ? <><span className={styles.spinner} />Salvando…</>
                : '🚀 Salvar nova senha'}
            </button>
          </form>
        ) : (
          <div className={styles.waiting}>
            <span className={styles.spinner} style={{ borderTopColor: '#FFD166', borderColor: 'rgba(255,209,102,0.2)' }} />
            <p>Verificando o link…</p>
          </div>
        )}

        <p className={styles.backLink}>
          <a href="/login">← Voltar para o login</a>
        </p>
      </main>
    </div>
  )
}
