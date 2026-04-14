import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useTeacher } from '@/hooks/useTeacher';
import StarField from '@/components/StarField';
import { Navbar } from '@/components/Navbar';
import styles from './TeacherLayout.module.css';

const TeacherLayout: React.FC = () => {
  const { isTeacher, loading } = useTeacher();

  if (loading) {
    return (
      <div className={styles.adminContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.loadingPulse}>
          <ShieldCheck size={48} color="#f7c762" />
        </div>
      </div>
    );
  }

  if (isTeacher === false) {
    return <Navigate to="/capitulos" replace />;
  }

  const navItems = [
    { to: '/prof', icon: <LayoutDashboard size={20} />, label: 'Overview', end: true },
    { to: '/prof/alunos', icon: <Users size={18} />, label: 'Alunos' },
    { to: '/prof/analise', icon: <BarChart2 size={18} />, label: 'Análise' },
    { to: '/prof/comunicacao', icon: <MessageSquare size={18} />, label: 'Comunicação' },
  ];

  return (
    <div className={styles.adminContainer}>
      <StarField />
      <div className={styles.decorContainer}>
        <div className={styles.nebula1} />
        <div className={styles.nebula2} />
      </div>

      <Navbar customLinks={navItems.map(item => ({ ...item, label: item.label.toUpperCase() }))} />

      {/* Main Stage */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Suspense fallback={
            <div className={styles.loadingContainer}>
              <div className={styles.loadingPulse}>
                <ShieldCheck size={48} color="#8bf9ff" />
              </div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
