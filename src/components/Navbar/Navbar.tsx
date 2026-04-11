import React, { useState, useEffect } from 'react';
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
import styles from './Navbar.module.css';

interface NavbarProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
  hideLinks?: boolean;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onCategoryChange, 
  activeCategory, 
  hideLinks = false,
  children 
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

  useEffect(() => {
    if (!user?.id) return;

    const fetchCount = () => NotificationService.countUnread(user.id).then(setUnreadCount);
    
    fetchCount();

    // RADAR GALÁCTICO: Escuta notificações em tempo real
    const channel = supabase
      .channel(`notif_radar_${user.id}`)
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        fetchCount
      )
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'quiz_challenges', filter: `challenged_id=eq.${user.id}` },
        fetchCount
      )
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'quiz_challenges', filter: `challenger_id=eq.${user.id}` },
        fetchCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
                onUnreadChange={setUnreadCount}
              />
            </div>
          )}
          <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
          {!hideLinks && !isCapitulosPage && (
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
                  <Link to="/jogos" className={`${styles.navLink} ${isActive('/capitulos') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/jogos')}>AULAS</Link>
                  <Link to="/jogos" className={`${styles.navLink} ${isActive('/jogos') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/jogos')}>JOGOS</Link>
                </>
              )}
              
              <Link to="/ranking" className={`${styles.navLink} ${isActive('/ranking') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/ranking')}>RANKING</Link>
              <Link to="/trofeus" className={`${styles.navLink} ${isActive('/trofeus') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/trofeus')}>TROFÉUS</Link>
              <Link to="/perfil" className={`${styles.navLink} ${isActive('/perfil') ? styles.navLinkActive : ''}`} onClick={() => handleNavClick('/perfil')}>PERFIL</Link>
            </>
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
                  onUnreadChange={setUnreadCount}
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
    </nav>
  );
};
