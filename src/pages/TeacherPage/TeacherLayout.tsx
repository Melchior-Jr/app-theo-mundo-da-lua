import React, { Suspense, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart2,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StarField from '@/components/StarField';
import styles from './TeacherLayout.module.css';

const TeacherLayout: React.FC = () => {
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = [
    { to: '/prof', icon: <LayoutDashboard size={20} />, label: 'Overview', end: true },
    { to: '/prof/alunos', icon: <Users size={20} />, label: 'Alunos' },
    { to: '/prof/analise', icon: <BarChart2 size={20} />, label: 'Análise' },
  ];

  return (
    <div className={styles.adminContainer}>
      <StarField />
      <div className={styles.nebula1} />
      <div className={styles.nebula2} />

      {/* Navbar Mobile (Matching GamesPage) */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMoon}><div className={styles.moon}></div><div className={styles.glow}></div></div>
            <div className={styles.logoText}>
              <span className={styles.theo}>Théo</span>
              <span className={styles.noMundo}> no Mundo</span>
              <span className={styles.daLuaNav}>da Lua<span className={styles.moonEmojiNav}>🌙</span></span>
            </div>
          </Link>
          <div className={styles.navActions}>
            <button className={styles.menuToggle} onClick={toggleSidebar} aria-label="Menu">
              {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isSidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      {/* Sidebar (Cockpit HUD) */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <ShieldCheck size={32} color="#f7c762" style={{ filter: 'drop-shadow(0 0 10px rgba(247,199,98,0.4))' }} />
          <div className={styles.logoText}>
            <span className={styles.theo}>Théo</span>
            <span className={styles.noMundo}>no Mundo</span>
            <span className={styles.daLua}>da Lua 🌙</span>
          </div>
          <button className={styles.closeSidebarBtn} onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
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
          <button 
            onClick={() => signOut()} 
            className={`${styles.navItem} ${styles.signOutBtn}`} 
            style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            <span>Sair da Área</span>
          </button>
        </div>
      </aside>

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
