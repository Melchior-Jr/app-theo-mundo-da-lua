import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Navbar } from '@/components/Navbar/Navbar';
import styles from './AdminPage.module.css';

const AdminLayout: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  // handleSignOut removed as unused

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
    { to: '/admin', label: 'OVERVIEW', end: true },
    { to: '/admin/subjects', label: 'JORNADAS' },
    { to: '/admin/chapters', label: 'CAPÍTULOS' },
    { to: '/admin/activities', label: 'JOGOS' },
    { to: '/admin/notifications', label: 'NOTIFICAÇÕES' },
    { to: '/admin/users', label: 'ALUNOS' },
    { to: '/admin/pedagogical', label: 'ANÁLISE' },
    { to: '/admin/access', label: 'ACESSO' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Top Navbar for Admin */}
      <Navbar customLinks={navItems} />

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
