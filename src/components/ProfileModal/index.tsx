import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './ProfileModal.module.css'

interface ProfileModalProps {
  player: any
  onClose: () => void
  onUpdate: () => void
}

export default function ProfileModal({ player, onClose, onUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    school: '',
    class_name: '',
    age: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Initialize and sync form data when player prop changes
  React.useEffect(() => {
    if (player) {
      setFormData({
        full_name: player.full_name || '',
        username: player.username || '',
        school: player.school || '',
        class_name: player.class_name || '',
        age: player.age || ''
      })
    }
  }, [player])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (!player?.id) {
        throw new Error('Identificador do astronauta não encontrado. Tente fazer login novamente.')
      }

      const { error } = await supabase
        .from('players')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          school: formData.school,
          class_name: formData.class_name,
          age: parseInt(formData.age as string) || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! 🚀' })
      setTimeout(() => {
        onUpdate()
        setIsEditing(false)
        setMessage({ type: '', text: '' })
      }, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.header}>
          <div className={styles.avatarLarge}>
            {player?.avatar_url ? (
              <img src={player.avatar_url} alt="Avatar" />
            ) : (
              <span className={styles.avatarEmoji}>👨‍🚀</span>
            )}
          </div>
          <h2>{isEditing ? 'Ajustando Traje Espacial' : 'Perfil do Astronauta'}</h2>
          <p>{isEditing ? 'Atualize seus dados para a próxima missão!' : 'Veja suas conquistas na Galáxia Théo!'}</p>
        </div>

        {!isEditing ? (
          <div className={styles.viewMode}>
            <div className={styles.profileInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nome</span>
                <span className={styles.infoValue}>{player?.full_name || 'Explorador Sem Nome'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Usuário</span>
                <span className={styles.infoValue}>@{player?.username || 'astronauta'}</span>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Escola</span>
                  <span className={styles.infoValue}>{player?.school || 'Base Lunar'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Turma</span>
                  <span className={styles.infoValue}>{player?.class_name || '5º Ano'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Idade</span>
                  <span className={styles.infoValue}>{player?.age || '--'} anos</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                ✏️ Editar Informações
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Ex: Théo Silva"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Nome de Usuário (Nick)</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Ex: theo_espacial"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Escola</label>
                <input 
                  type="text" 
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  placeholder="Nome da sua escola"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Série/Turma</label>
                <input 
                  type="text" 
                  value={formData.class_name}
                  onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  placeholder="Ex: 5º Ano A"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Idade</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="Sua idade"
                />
              </div>
            </div>

            {message.text && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                Voltar
              </button>
              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
