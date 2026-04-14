import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Trophy, Info, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NotificationService, Notification, NotificationSource } from '@/services/notificationService'
import styles from './NotificationDropdown.module.css'

interface Props {
  userId: string
  source?: NotificationSource
  isOpen: boolean
  onClose: () => void
  onUnreadChange?: (count: number) => void
}

export const NotificationDropdown: React.FC<Props> = ({ 
  userId, 
  source, 
  isOpen, 
  onClose,
  onUnreadChange 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch when opened or identity changes
  useEffect(() => {
    if (userId && isOpen) load()
  }, [userId, source, isOpen])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const load = async () => {
    try {
      const data = await NotificationService.fetch(userId, source)
      setNotifications(data)
      const unreadCount = data.filter(n => !n.read).length
      onUnreadChange?.(unreadCount)
    } catch (e) {
      console.error('Falha ao carregar notificações:', e)
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id: string, url?: string) => {
    console.log('🌌 [Radar] Marcando como lida (otimista):', id);
    
    // Atualiza interface local instantaneamente (otimista)
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n)
      const count = next.filter(n => !n.read).length
      onUnreadChange?.(count)
      return next
    })

    try {
      // Garante que o Navbar receba o sinal de atualização forçada
      await NotificationService.markAsRead(id, userId)
      
      if (url) navigate(url)
    } catch (e) {
      console.error('❌ [Radar] Erro ao marcar como lida no banco:', e)
      // Recarrega em caso de erro para sincronizar se necessário
      load()
    }
  }

  const markAllRead = async () => {
    console.log('🌌 [Radar] Limpando todas (otimista)...');
    
    // UI Local instantânea
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    onUnreadChange?.(0)
    
    try {
      await NotificationService.markAllAsRead(userId, source)
    } catch (e) {
      console.error('❌ [Radar] Erro ao limpar todas no banco:', e)
      load() // Recarrega se falhar
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Bell size={16} className={styles.iconH} />
          <h3>Notificações {source && <span className={styles.sourceTag}>{source}</span>}</h3>
        </div>
        <div className={styles.actions}>
          <button onClick={markAllRead} className={styles.markAll} title="Marcar todas como lidas">
            <Check size={14} />
          </button>
          <button onClick={onClose} className={styles.close}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>Processando sinais estelares...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🌌</div>
            <p>Silêncio absoluto no cosmos por enquanto.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!n.read) markRead(n.id);
              }}
            >
              <div className={`${styles.itemIcon} ${styles[n.type]}`}>
                {n.type === 'trophy' && <Trophy size={16} />}
                {n.type === 'success' && <Check size={16} />}
                {n.type === 'warning' && <AlertTriangle size={16} />}
                {n.type === 'info' && <Info size={16} />}
                {n.type === 'system' && <Bell size={16} />}
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                   <span className={styles.itemTitle}>{n.title}</span>
                   <span className={styles.itemDate}>
                     {new Date(n.created_at).toLocaleDateString()}
                   </span>
                </div>
                <p className={styles.itemText}>{n.content}</p>
                <div className={styles.itemFooter}>
                  {(n.sender_role || n.sender_name || n.source) && (
                    <span className={styles.itemSource}>
                      {n.sender_role ? `${n.sender_role}${n.sender_name ? `: ${n.sender_name}` : ''}` : (n.sender_name || (n.source && n.source.charAt(0).toUpperCase() + n.source.slice(1)))}
                    </span>
                  )}
                  {!n.read && <div className={styles.dot} />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className={styles.footer}>
        <span>Sincronizado com a Estação Terrestre</span>
      </div>
    </div>
  )
}
