import { useState, useEffect } from 'react';

/** 🚀 Hook Théo em Órbita — usePwaInstall 🌙
 * Sistema de monitoramento e execução da decolagem PWA (instalação).
 */
export type AppPlatform = 'android' | 'ios' | 'desktop';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<AppPlatform>('desktop');
  const [wasInstalled, setWasInstalled] = useState(false);

  useEffect(() => {
    // 🛠️ 1. Detecção Inicial de Ambiente (Standalone/PWA já rodando)
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore - Safari Navigator extend
      const isNavigatorStandalone = window.navigator.standalone === true;
      setIsStandalone(isWindowStandalone || isNavigatorStandalone);
    };

    // 🛠️ 2. Detecção de Plataforma Única
    const detectPlatform = () => {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) setPlatform('android');
      else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');
      else setPlatform('desktop');
    };

    checkStandalone();
    detectPlatform();

    // 🛠️ 3. O "Santo Graal" das PWAs (antes de instalar)
    const handleBeforeInstall = (e: any) => {
      console.log('🌠 Théo detectou a Estação pronta para decolar (beforeinstallprompt)');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 🛠️ 4. Comemoração de Decolagem Concluída
    const handleInstalled = () => {
      console.log('🚀 Missão decolagem com sucesso! App instalado.');
      setDeferredPrompt(null);
      setIsInstallable(false);
      setWasInstalled(true);
      
      // Armazena localmente pra garantir que não incomodaremos o viajante
      localStorage.setItem('theo_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  /** Realiza a tentativa de acoplamento na tela inicial */
  const install = async () => {
    if (!deferredPrompt) {
      console.warn('🛰️ Sistema Offline: Prompt indisponível. Tentando via fallback...');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`🌌 Viajante decidiu: ${outcome}`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('💥 Erro na decolagem:', e);
      return false;
    }
  };

  return {
    isInstallable,
    isStandalone,
    platform,
    wasInstalled,
    install,
    deferredPrompt
  };
}
