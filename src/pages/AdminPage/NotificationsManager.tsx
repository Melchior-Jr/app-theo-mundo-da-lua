import React, { useState } from 'react';
import { 
  Send, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info,
  History
} from 'lucide-react';
import { NotificationService, NotificationType } from '@/services/notificationService';
import styles from './AdminPage.module.css';

const NotificationsManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await NotificationService.notifyAll(title, content, type);
      setSuccess(true);
      setTitle('');
      setContent('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao enviar notificação global:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Central de Notificações</h1>
        <p className={styles.subtitle}>Comunique-se diretamente com todos os exploradores cósmicos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Envio de Notificação */}
        <section className={styles.glassPanel} style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="#00e5ff" />
            Nova Transmissão Global
          </h2>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className={styles.statLabel}>Título da Mensagem</label>
              <input 
                type="text" 
                className={styles.glassInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novo Capítulo Liberado! 🚀"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>

            <div>
              <label className={styles.statLabel}>Conteúdo</label>
              <textarea 
                className={styles.glassInput}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o que há de novo para os alunos..."
                rows={4}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {(['info', 'success', 'warning', 'system'] as NotificationType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={styles.navItem}
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center',
                    background: type === t ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: type === t ? '1px solid #00e5ff' : '1px solid transparent'
                  }}
                >
                  {t === 'success' && <CheckCircle size={16} />}
                  {t === 'warning' && <AlertCircle size={16} />}
                  {t === 'info' && <Info size={16} />}
                  {t === 'system' && <Bell size={16} />}
                  <span style={{ textTransform: 'capitalize' }}>{t}</span>
                </button>
              ))}
            </div>

            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={loading || !title || !content}
              style={{ padding: '1.25rem' }}
            >
              {loading ? 'Transmitindo...' : success ? '✅ Transmissão Concluída!' : 'Disparar Notificação'}
            </button>
          </form>
        </section>

        {/* Info & Dicas */}
        <section className={styles.glassPanel} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#00e5ff', marginBottom: '1rem' }}>Dicas Cósmicas</h3>
            <ul style={{ color: 'rgba(255,255,255,0.6)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Use emojis para chamar atenção.</li>
              <li>Seja breve e direto ao ponto.</li>
              <li>Use o tipo "Success" para recompensas e "Info" para novidades.</li>
              <li>O tipo "Warning" é ideal para avisos de manutenção.</li>
            </ul>
          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <History size={18} color="#FFD166" />
              <span style={{ fontWeight: 600 }}>Cuidado!</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
              Lembre-se: Notificações globais são enviadas para TODOS os usuários cadastrados. Use com sabedoria!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationsManager;
