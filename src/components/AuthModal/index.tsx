import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'
import styles from './AuthModal.module.css'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [school, setSchool] = useState('')
  const [className, setClassName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
              school: school,
              class_name: className,
              birth_date: birthDate || null
            },
          },
        })
        
        if (error) throw error
      }
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalGlow} />
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <h2 className={styles.title}>
          {isLogin ? 'Estação de Login 👨‍🚀' : 'Nova Inscrição 🚀'}
        </h2>
        <p className={styles.description}>
          {isLogin 
            ? 'Entre para continuar sua aventura no espaço!' 
            : 'Preencha os dados abaixo para se tornar um astronauta.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className={styles.inputGroup}>
                <label>Nome do Astronauta</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Nick (Apelido)</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: theo_lunar"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Escola</label>
                  <input 
                    type="text" 
                    value={school} 
                    onChange={e => setSchool(e.target.value)}
                    placeholder="Sua escola"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Turma</label>
                  <input 
                    type="text" 
                    value={className} 
                    onChange={e => setClassName(e.target.value)}
                    placeholder="Ex: 5º A"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Data de Nascimento</label>
                <input 
                  type="date" 
                  value={birthDate} 
                  onChange={e => setBirthDate(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>E-mail Galáctico</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@escolagomes.com"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Senha Secreta</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              required
              className={styles.input}
            />
          </div>

          {error && <div style={{ color: '#FF7F7F', fontSize: '0.85rem' }}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Viajando...' : (isLogin ? 'Entrar na Galáxia 🛰️' : 'Criar Conta 👨‍🚀')}
          </button>

          <div className={styles.divider}>
            <span>ou {isLogin ? 'continue' : 'cadastre-se'} com</span>
          </div>

          <button 
            type="button" 
            className={styles.googleBtn} 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FcGoogle className={styles.googleIcon} />
            {isLogin ? 'Entrar com Google' : 'Cadastrar com Google'}
          </button>
        </form>

        <button className={styles.switchAuth} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Não tem uma conta?' : 'Já é um astronauta?'} 
          <strong>{isLogin ? 'Cadastre-se' : 'Faça login'}</strong>
        </button>
      </div>
    </div>
  )
}
