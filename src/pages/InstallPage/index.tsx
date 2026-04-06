import React, { useState, useEffect } from 'react';
import styles from './InstallPage.module.css';
import StarField from '@/components/StarField';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  Rocket
} from 'lucide-react';
import { usePwaInstall, AppPlatform } from '@/hooks/usePwaInstall';


const InstallPage: React.FC = () => {
  const { 
    isInstallable, 
    isStandalone, 
    platform: detectedPlatform, 
    wasInstalled, 
    install 
  } = usePwaInstall();

  const [activeTab, setActiveTab] = useState<AppPlatform | 'success'>('android');
  const [isInstalling, setIsInstalling] = useState(false);

  // Sincroniza a aba ativa com a plataforma detectada
  useEffect(() => {
    if (isStandalone || wasInstalled) {
      setActiveTab('success');
    } else {
      setActiveTab(detectedPlatform);
    }
  }, [detectedPlatform, isStandalone, wasInstalled]);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const success = await install();
    if (!success && detectedPlatform === 'ios') {
      // No iOS não há prompt nativo, então rolamos para as instruções
      const el = document.getElementById('instructions');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsInstalling(false);
  };

  const getStatusMessage = () => {
    if (isStandalone || wasInstalled) return 'O app já está com você! Agora é só continuar a aventura.';
    if (isInstalling) return 'Preparando propulsores para a decolagem...';
    if (detectedPlatform === 'ios') return 'No iPhone, o Théo é um passageiro especial. Siga as instruções abaixo!';
    if (isInstallable) return 'Pronto para decolar! Clique em instalar para começar.';
    return 'Estação de rastreamento ativa. Siga o guia para instalar manualmente.';
  };

  return (
    <div className={styles.page}>
      <div className={styles.starFieldWrapper}>
        <StarField />
      </div>

      <main className={styles.content}>
        {/* --- HERO SECTION --- */}
        <section className={styles.hero}>
          <p>
            Instale o <span className={styles.theo}>Théo</span> <span className={styles.noMundo}>no Mundo</span> <span className={styles.daLua}>da Lua 🌙</span> e explore o universo de forma mais rápida, prática e divertida direto no seu celular.
          </p>
        </section>

        {/* --- INSTALL CARD --- */}
        <section className={styles.installCard}>
          <div className={styles.cardIcon}>
            <Download size={40} />
          </div>
          
          <div className={styles.cardHeader}>
            <h2>Estação Espacial do Théo</h2>
            <p>Versão 1.2.0 • Web App Oficial</p>
          </div>

          <div className={styles.actions}>
            {!isStandalone && !wasInstalled ? (
              <>
                <button 
                  className={styles.primaryBtn}
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                >
                  {isInstalling ? <Rocket className={styles.spinning} size={20} /> : <Download size={20} />}
                  {isInstallable ? 'Instalar App' : 'Ver Como Instalar'}
                </button>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => window.open(window.location.origin + '/login', '_blank')}
                >
                  <ExternalLink size={20} />
                  Abrir Agora
                </button>
              </>
            ) : (
              <button 
                className={styles.primaryBtn}
                onClick={() => window.location.href = '/jogos'}
              >
                <Rocket size={20} />
                Ir para a Estação
              </button>
            )}
          </div>

          <div className={styles.statusBox}>
            <span>{getStatusMessage()}</span>
          </div>
        </section>

        {/* --- BENEFITS SECTION --- */}
        <section className={styles.benefitsGrid}>
          <div className={styles.benefitItem}>
            <Zap className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Ultra Rápido</h3>
            <p className={styles.benefitDesc}>Acesso instantâneo sem precisar abrir o navegador toda vez.</p>
          </div>
          <div className={styles.benefitItem}>
            <Smartphone className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Experiência App</h3>
            <p className={styles.benefitDesc}>Interface em tela cheia, como um aplicativo de verdade.</p>
          </div>
          <div className={styles.benefitItem}>
            <ShieldCheck className={styles.benefitIcon} />
            <h3 className={styles.benefitTitle}>Seguro & Leve</h3>
            <p className={styles.benefitDesc}>Não ocupa espaço na memória e é 100% seguro.</p>
          </div>
        </section>

        {/* --- INSTRUCTIONS SECTION --- */}
        <section className={styles.instructions} id="instructions">
          <div className={styles.instructionTabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'android' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('android')}
            >
              <Smartphone size={18} /> Android
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'ios' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('ios')}
            >
              <Smartphone size={18} /> iPhone
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'desktop' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('desktop')}
            >
              <Monitor size={18} /> Computador
            </button>
            {(isStandalone || wasInstalled) && (
              <button 
                className={`${styles.tabBtn} ${activeTab === 'success' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('success')}
              >
                <CheckCircle2 size={18} /> Sucesso
              </button>
            )}
          </div>

          <div className={styles.instructionContent}>
            <div className={styles.instructionText}>
              {activeTab === 'android' && (
                <>
                  <h3>Como instalar no Android</h3>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <p>Toque no ícone de <strong>três pontinhos</strong> <MoreVertical size={16} /> no canto superior do Chrome.</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <p>Selecione a opção <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <p>Confirme a instalação e pronto! O Théo aparecerá nos seus apps.</p>
                  </div>
                </>
              )}

              {activeTab === 'ios' && (
                <>
                  <h3>Como instalar no iPhone/iPad</h3>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <p>Toque no botão de <strong>Compartilhar</strong> <Share size={16} /> na barra inferior do Safari.</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <p>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={16} />.</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <p>Toque em <strong>"Adicionar"</strong> no canto superior direito.</p>
                  </div>
                </>
              )}

              {activeTab === 'desktop' && (
                <>
                  <h3>Como instalar no Computador</h3>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <p>Olhe para a <strong>barra de endereço</strong> do seu navegador (Chrome ou Edge).</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <p>Clique no ícone de <strong>Instalar</strong> <PlusSquare size={16} /> que aparece no lado direito.</p>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <p>Clique em <strong>"Instalar"</strong> na janela que abrirá.</p>
                  </div>
                </>
              )}

              {activeTab === 'success' && (
                <>
                  <h3>Missão Cumprida! 🚀</h3>
                  <p>O Théo agora vive na sua tela inicial. Você pode acessar todos os jogos, missões e conquistas com apenas um clique.</p>
                  <div className={styles.step}>
                    <CheckCircle2 color="#00f3ff" />
                    <p>Experiência em tela cheia ativada.</p>
                  </div>
                  <div className={styles.step}>
                    <CheckCircle2 color="#00f3ff" />
                    <p>Carregamento mais rápido.</p>
                  </div>
                </>
              )}
            </div>

            <div className={styles.mockupContainer}>
              {/* Aqui poderiam entrar ilustrações ou mockups visuais explicativos */}
              <div style={{ 
                fontSize: '120px', 
                filter: 'drop-shadow(0 0 30px rgba(0, 243, 255, 0.4))',
                animation: 'float 4s ease-in-out infinite'
              }}>
                {activeTab === 'success' ? '🛸' : (activeTab === 'desktop' ? '💻' : '📱')}
              </div>
            </div>
          </div>
        </section>

        {/* --- TRUST SECTION --- */}
        <footer className={styles.trust}>
          <p>
            <Sparkles size={18} color="#FFD166" />
            VANTAGEM EXCLUSIVA DA ESTAÇÃO ESPACIAL
            <Sparkles size={18} color="#FFD166" />
          </p>
        </footer>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default InstallPage;
