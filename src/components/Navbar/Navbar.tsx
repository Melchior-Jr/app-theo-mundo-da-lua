import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useSound } from '@/context/SoundContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { NotificationService } from '@/services/notificationService';
import { supabase } from '@/lib/supabase';
import { calcLevel } from '@/utils/playerUtils';
import { SettingsModal } from '@/components/SettingsModal';
import { useTeacher } from '@/hooks/useTeacher';
import { TeacherAuthModal } from '@/components/TeacherAuthModal/TeacherAuthModal';
import styles from './Navbar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
  hideLinks?: boolean;
  children?: React.ReactNode;
  customLinks?: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onCategoryChange, 
  activeCategory, 
  hideLinks = false,
  children,
  customLinks
}) => {
  const { session, user } = useAuth();
  const { playerData: player, playerStats: globalStats } = usePlayer();
  const { playSFX } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTeacherAuth, setShowTeacherAuth] = useState(false);
  const { isTeacher } = useTeacher();
  const isCapitulosPage = location.pathname === '/capitulos';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const lastLocalAction = useRef(0);

  // Sistema de atualização com proteção contra dados obsoletos (echo)
  const updateCount = useCallback((newCount: number, source: 'local' | 'external') => {
    const now = Date.now();
    setUnreadCount(prev => {
      // Se houve ação local recente (<3s) e o banco traz um número maior, é dado velho
      if (source === 'external' && now - lastLocalAction.current < 3000 && newCount > prev) {
        console.log(`🛡️ [Navbar] Proteção de Eco: Ignorando count ${newCount} (mantendo ${prev})`);
        return prev;
      }
      return newCount;
    });
  }, []);

  const fetchCount = useCallback(async (force = false) => {
    if (!user?.id) return;
    
    // Bloqueio de fetch de rotina se houve ação local recente
    const now = Date.now();
    if (!force && (now - lastLocalAction.current < 2000)) return;

    try {
      const count = await NotificationService.countUnread(user.id);
      updateCount(count, force ? 'local' : 'external');
    } catch (err) {
      console.error('Erro no fetchCount:', err);
    }
  }, [user?.id, updateCount]);

  useEffect(() => {
    if (!user?.id) return;

    fetchCount(true);

    const handleUpdate = (e: any) => {
      const newCount = e.detail?.count ?? 0;
      console.log('🔔 [Navbar] Ação Local (Evento):', newCount);
      lastLocalAction.current = Date.now();
      updateCount(newCount, 'local');
    };

    window.addEventListener('notification-updated', handleUpdate);
    
    const channel = supabase
      .channel(`notif_radar_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        // Se for uma NOVA notificação (INSERT), ignoramos a trava e mostramos
        if (payload.eventType === 'INSERT') {
          console.log('🔥 [Navbar] Nova notificação via Realtime');
          fetchCount(true);
        } else {
          // Para UPDATE/DELETE, respeitamos a lógica de eco
          fetchCount(false);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'quiz_challenges' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          fetchCount(true);
        } else {
          fetchCount(false);
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('notification-updated', handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCount, updateCount]);

  const toggleMenu = () => {
    playSFX('click');
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = (path: string) => {
    playSFX('click');
    closeMenu();
    if (location.pathname === path) return;
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''} ${isMenuOpen ? styles.navbarMenuOpen : ''}`}>
      <div className={styles.navbarContainer}>
        <Link to="/jogos" className={styles.logo} onClick={() => { playSFX('click'); closeMenu(); }}>
          {(!scrolled && !isMenuOpen) ? (
            <div className={styles.logoMoon}>
              <div className={styles.moon}></div>
              <div className={styles.glow}></div>
            </div>
          ) : (
            <div className={styles.logoText}>
              <span className={styles.theo}>Théo</span>
              <span className={styles.noMundo}> no Mundo</span>
              <span className={styles.daLuaNav}>
                da Lua
                <span className={styles.moonEmojiNav}>🌙</span>
              </span>
            </div>
          )}
        </Link>
        
        {children && <div className={styles.customContent}>{children}</div>}

        <div className={styles.navActions}>
          {session && (
            <div className={styles.mobileBell} style={{ position: 'relative' }}>
              <button 
                className={styles.bellBtn} 
                title="Notificações"
                onClick={() => { playSFX('click'); setShowNotifications(!showNotifications); }}
              >
                <Bell size={18} />
                {unreadCount > 0 && <div className={styles.bellDot} />}
              </button>
              
              <NotificationDropdown 
                userId={user?.id || ''}
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                onUnreadChange={(count) => {
                  lastLocalAction.current = Date.now();
                  updateCount(count, 'local');
                }}
              />
            </div>
          )}
          <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
          {customLinks ? (
            <>
              {customLinks.map((item) => (
                <Link 
                  key={item.to} 
                  to={item.to} 
                  className={`${styles.navLink} ${location.pathname === item.to ? styles.navLinkActive : ''}`}
                  onClick={() => { playSFX('click'); closeMenu(); }}
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            !hideLinks && !isCapitulosPage && (
              <>
                {location.pathname === '/jogos' && onCategoryChange ? (
                  <>
                    <button 
                      className={`${styles.navLink} ${activeCategory === 'Aulas' ? styles.navLinkActive : ''}`} 
                      onClick={() => { onCategoryChange('Aulas'); closeMenu(); }}
                    >
                      AULAS
                    </button>
                    <button 
                      className={`${styles.navLink} ${activeCategory === 'Jogos' ? styles.navLinkActive : ''}`} 
                      onClick={() => { onCategoryChange('Jogos'); closeMenu(); }}
                    >
                      JOGOS
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/capitulos" className={`${styles.navLink} ${isActive('/capitulos') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/capitulos')}>AULAS</Link>
                    <Link to="/jogos" className={`${styles.navLink} ${isActive('/jogos') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/jogos')}>JOGOS</Link>
                  </>
                )}
                
                <Link to="/ranking" className={`${styles.navLink} ${isActive('/ranking') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/ranking')}>RANKING</Link>
                <Link to="/trofeus" className={`${styles.navLink} ${isActive('/trofeus') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/trofeus')}>TROFÉUS</Link>
                
                {isTeacher && (
                  <button 
                    className={`${styles.navLink} ${isActive('/prof') ? styles.navLinkActive : ''}`} 
                    onClick={() => { playSFX('click'); setShowTeacherAuth(true); closeMenu(); }}
                  >
                    PAINEL PROF
                  </button>
                )}

                <Link to="/perfil" className={`${styles.navLink} ${isActive('/perfil') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/perfil')}>PERFIL</Link>
              </>
            )
          )}

          {session && (
            <div className={styles.userWidget}>
              <div className={styles.desktopBell} style={{ position: 'relative' }}>
                <button 
                  className={styles.bellBtn} 
                  title="Notificações"
                  onClick={() => { playSFX('click'); setShowNotifications(!showNotifications); }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && <div className={styles.bellDot} />}
                </button>
                
                <NotificationDropdown 
                  userId={user?.id || ''}
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  onUnreadChange={(count) => {
                    lastLocalAction.current = Date.now();
                    updateCount(count, 'local');
                  }}
                />
              </div>
              
              <button 
                className={styles.settingsBtn} 
                title="Configurações"
                onClick={() => {
                  playSFX('click');
                  setShowSettings(true);
                }}
              >
                <Settings size={18} />
              </button>

              <div className={styles.userCard} onClick={() => handleNavClick('/perfil')}>
                <div className={styles.userAvatarWrap}>
                  {player?.avatar_url ? (
                    <img src={player.avatar_url} className={styles.userAvatar} alt="Avatar" />
                  ) : (
                    <div className={styles.userAvatarFallback}>{player?.username?.charAt(0) || '?'}</div>
                  )}
                </div>
                <div className={styles.userInfoNav}>
                  <span className={styles.userNameNav}>{player?.username || 'Astronauta'}</span>
                  <div className={styles.userMetaNav}>
                    <span className={styles.userLevelNav}>NIV. {calcLevel(globalStats?.galactic_xp)}</span>
                    <span className={styles.userXpNav}>{globalStats?.galactic_xp || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <TeacherAuthModal 
        isOpen={showTeacherAuth}
        onClose={() => setShowTeacherAuth(false)}
        onConfirm={() => {
          setShowTeacherAuth(false);
          navigate('/prof');
        }}
      />
    </nav>
  );
};
