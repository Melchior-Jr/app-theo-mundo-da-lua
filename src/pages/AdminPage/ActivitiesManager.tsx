import React from 'react';
import { Gamepad2, Search, Filter } from 'lucide-react';
import styles from './AdminPage.module.css';

const ActivitiesManager: React.FC = () => {
  const activities = [
    { id: 'quiz', title: 'Quiz Intergaláctico', type: 'Jogo', difficulty: 'Médio', status: 'published' },
    { id: 'invasores', title: 'Invasores do Saber', type: 'Jogo', difficulty: 'Médio', status: 'published' },
    { id: 'duel', title: 'Arena de Duelos', type: 'PvP', difficulty: 'Difícil', status: 'published' },
    { id: 'hunt', title: 'Caça-planetas', type: 'Minigame', difficulty: 'Difícil', status: 'draft' },
  ];

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Gestão de Atividades</h1>
        <p className={styles.subtitle}>Controle a disponibilidade e dificuldade dos desafios.</p>
      </header>

      <section className={styles.glassPanel}>
        <div className={styles.panelHeader}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <div className={styles.glassPanel} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Search size={18} color="rgba(255,255,255,0.4)" />
              <input type="text" placeholder="Filtrar jogos..." style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }} />
            </div>
            <button className={styles.actionBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <Filter size={18} />
              Dificuldade
            </button>
          </div>
        </div>

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
                    <div style={{ color: '#00e5ff' }}><Gamepad2 size={20} /></div>
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
                  <button className={styles.actionBtn} style={{ color: '#00e5ff' }}>
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
