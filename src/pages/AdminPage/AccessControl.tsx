import { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Search,
  UserCheck,
  UserMinus,
  AlertCircle,
  Key
} from 'lucide-react';
import { AdminService } from '@/services/adminService';
import styles from './AdminPage.module.css';

export default function AccessControl() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setLoading(true);
      const data = await AdminService.getPlayersList();
      setPlayers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTeacher(id: string, currentStatus: boolean, name: string) {
    const action = currentStatus ? 'remover' : 'conceder';
    if (!confirm(`Deseja realmente ${action} acesso de professor para ${name}?`)) return;
    
    setActionLoading(id);
    try {
      await AdminService.toggleTeacherAccess(id, !currentStatus);
      
      // Atualiza estado local
      setPlayers(prev => prev.map(p => 
        p.id === id ? { ...p, is_teacher: !currentStatus } : p
      ));
      
      alert(`Acesso ${!currentStatus ? 'concedido' : 'removido'} com sucesso para ${name}.`);
    } catch (err) {
      console.error('Erro ao alterar acesso:', err);
      alert('Falha ao processar alteração de acesso.');
    } finally {
      setActionLoading(null);
    }
  }

  const filteredUsers = players.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teacherCount = players.filter(p => p.is_teacher).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className={styles.loadingPulse}>
          <ShieldCheck size={48} color="#00e5ff" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <header className={styles.header}>
        <h1 className={styles.title}>Controle de Acesso</h1>
        <p className={styles.subtitle}>Gerencie permissões e defina quais usuários podem acessar o painel pedagógico.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
            <Key size={24} color="#00e5ff" />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Professores Ativos</div>
            <div className={styles.statValue}>{teacherCount}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(255, 209, 102, 0.1)' }}>
            <Users size={24} color="#ffd166" />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total de Candidatos</div>
            <div className={styles.statValue}>{players.length}</div>
          </div>
        </div>
      </div>

      <div className={styles.glassPanel} style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={20} color="rgba(255,255,255,0.4)" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, usuário ou email..." 
            className={styles.noneInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '1rem' }}
          />
        </div>
      </div>

      <section className={styles.glassPanel}>
        <div className={styles.panelHeader}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Lista de Usuários</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            <AlertCircle size={14} /> Somente o Administrador Master pode alterar estas permissões.
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Status Atual</th>
                <th style={{ textAlign: 'right' }}>Ação de Acesso</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(p => (
                <tr key={p.id} style={{ opacity: actionLoading === p.id ? 0.5 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} 
                        alt="" 
                        style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }} 
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.full_name || 'Astronauta sem Nome'}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>@{p.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {p.email || 'Não informado'}
                  </td>
                  <td>
                    {p.is_teacher ? (
                      <span className={styles.statusPublished} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                         <ShieldCheck size={12} /> PROFESSOR
                      </span>
                    ) : (
                      <span style={{ opacity: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>ALUNO / COMUM</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleToggleTeacher(p.id, p.is_teacher, p.full_name || p.username)}
                      disabled={actionLoading !== null}
                      className={p.is_teacher ? styles.secondaryBtn : styles.primaryBtn}
                      style={{ 
                        padding: '8px 16px', 
                        fontSize: '0.85rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        minWidth: '160px',
                        justifyContent: 'center'
                      }}
                    >
                      {p.is_teacher ? (
                        <>
                          <UserMinus size={16} /> Revogar Acesso
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} /> Tornar Professor
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
                    Nenhum usuário encontrado para "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
