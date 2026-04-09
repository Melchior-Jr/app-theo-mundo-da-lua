import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, School, Hash, Calendar, CheckCircle2, X } from 'lucide-react'
import styles from './ProfileCompletionModal.module.css'

interface ProfileCompletionModalProps {
  player: any
  onClose: () => void
  onUpdate: () => void
}

export default function ProfileCompletionModal({ player, onClose, onUpdate }: ProfileCompletionModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    school: '',
    class_name: '',
    birth_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (player) {
      setFormData({
        full_name: player.full_name || '',
        username: player.username || '',
        school: player.school || '',
        class_name: player.class_name || '',
        birth_date: player.birth_date || ''
      })
    }
  }, [player])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (!player?.id) {
        throw new Error('Identificador do astronauta não encontrado.')
      }

      const { error } = await supabase
        .from('players')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          school: formData.school,
          class_name: formData.class_name,
          birth_date: formData.birth_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Dados sincronizados com sucesso! 🚀' })
      
      // Marcar como mostrado hoje após preencher (opcional, já que agora está preenchido)
      localStorage.setItem('theo_last_profile_reminder', new Date().toDateString())
      
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro na comunicação interstelar.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <span className={styles.planetIcon}>🚀</span>
          </div>
          <h2>Conclua seu Cadastro Estelar!</h2>
          <p>Para que seus professores acompanhem sua jornada galáctica, precisamos completar seus dados oficiais de astronauta.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label><User size={14} /> Nome Completo</label>
            <input 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
              placeholder="Seu nome" 
              required
            />
          </div>
          
          <div className={styles.field}>
            <label><Hash size={14} /> Como quer ser chamado (Apelido)</label>
            <input 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              placeholder="@nickname" 
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label><School size={14} /> Escola</label>
              <input 
                value={formData.school} 
                onChange={e => setFormData({...formData, school: e.target.value})} 
                placeholder="Sua escola" 
                required
              />
            </div>
            <div className={styles.field}>
              <label><Hash size={14} /> Turma</label>
              <input 
                value={formData.class_name} 
                onChange={e => setFormData({...formData, class_name: e.target.value})} 
                placeholder="Ex: 5º Ano A" 
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label><Calendar size={14} /> Data de Nascimento</label>
            <input 
              type="date" 
              value={formData.birth_date} 
              onChange={e => setFormData({...formData, birth_date: e.target.value})} 
              required
            />
          </div>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
              {message.text}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.laterBtn} onClick={onClose}>
              Lembrar mais tarde
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sincronizando...' : 'Completar Cadastro 🛰️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
