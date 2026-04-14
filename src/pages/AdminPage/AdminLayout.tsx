import React, { Suspense } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Gamepad2, 
  Bell, 
  Users, 
  LogOut, 
  ShieldCheck,
  Compass,
  BarChart2
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminPage.module.css';

const AdminLayout: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/jogos');
  };

  if (loading) {
    return (
      <div className={styles.adminContainer} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div className={styles.loadingPulse}>
          <ShieldCheck size={48} color="#00e5ff" />
        </div>
        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
          VERIFICANDO CREDENCIAIS GALÁCTICAS...
        </p>
      </div>
    );
  }

  // Redireciona se não for admin (uma vez que o loading terminou)
  if (isAdmin === false) {
    return <Navigate to="/capitulos" replace />;
  }

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview', end: true },
    { to: '/admin/subjects', icon: <Compass size={20} />, label: 'Jornadas' },
    { to: '/admin/chapters', icon: <BookOpen size={20} />, label: 'Capítulos' },
    { to: '/admin/activities', icon: <Gamepad2 size={20} />, label: 'Jogos' },
    { to: '/admin/notifications', icon: <Bell size={20} />, label: 'Notificações' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Alunos' },
    { to: '/admin/pedagogical', icon: <BarChart2 size={20} />, label: 'Análise' },
    { to: '/admin/access', icon: <ShieldCheck size={20} />, label: 'Acesso' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <ShieldCheck size={28} color="#00e5ff" />
          <span>Théo Admin</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleSignOut} className={styles.navItem} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.backgroundDecor}>
          <div className={styles.gradientOrb1} />
          <div className={styles.gradientOrb2} />
        </div>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <div className={styles.loadingPulse}>
              <ShieldCheck size={32} color="#00e5ff" opacity={0.5} />
            </div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
