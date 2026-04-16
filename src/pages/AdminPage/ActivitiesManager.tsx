import React, { useState } from 'react';
import { Gamepad2, Search, Filter, CheckCircle2, Users } from 'lucide-react';
import styles from './AdminPage.module.css';
import QuizEditor from './QuizEditor';

const ActivitiesManager: React.FC = () => {
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const activities = [
    { id: 'quiz', title: 'Quiz Intergaláctico', type: 'Jogo', difficulty: 'Médio', status: 'published' },
    { id: 'invasores', title: 'Invasores do Saber', type: 'Jogo', difficulty: 'Médio', status: 'published' },
    { id: 'duel', title: 'Arena de Duelos', type: 'PvP', difficulty: 'Difícil', status: 'published' },
    { id: 'hunt', title: 'Caça-planetas', type: 'Minigame', difficulty: 'Difícil', status: 'draft' },
  ];

  if (editingActivity === 'quiz') {
    return <QuizEditor onBack={() => setEditingActivity(null)} />;
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gestão de Atividades</h1>
        <p className={styles.subtitle}>Controle a disponibilidade e dificuldade dos desafios.</p>
      </header>

      <div className={styles.searchBar} style={{ display: 'flex', gap: '1rem', marginBottom: '24px' }}>
        <div className={styles.glassPanel} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input type="text" placeholder="Filtrar jogos..." style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%' }} />
        </div>
      </div>

      <section className={styles.glassPanel} style={{ padding: 0 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Atividade</th>
              <th>Tipo</th>
              <th>Dificuldade</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: '#ffd166' }}><Gamepad2 size={20} /></div>
                    <span style={{ fontWeight: 600 }}>{act.title}</span>
                  </div>
                </td>
                <td>{act.type}</td>
                <td>{act.difficulty}</td>
                <td>
                  <span className={`${styles.statusBadge} ${act.status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
                    {act.status === 'published' ? 'Ativo' : 'Em Breve'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className={styles.actionBtn} 
                    style={{ color: '#ffd166' }}
                    onClick={() => {
                      if (act.id === 'quiz') {
                        setEditingActivity(act.id);
                      } else {
                        alert('A configuração deste módulo ainda está em construção.');
                      }
                    }}
                  >
                    Configurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ActivitiesManager;
