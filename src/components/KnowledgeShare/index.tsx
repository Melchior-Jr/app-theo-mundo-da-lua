import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { getProductionUrl, copyToClipboardFallback } from '@/utils/shareUtils';
import styles from './KnowledgeShare.module.css';

interface KnowledgeShareProps {
  /** Título para o compartilhamento */
  title: string;
  /** Texto descritivo para o compartilhamento */
  text: string;
  /** Callback opcional ao finalizar */
  onShare?: () => void;
  /** Cor temática para o hover */
  themeColor?: string;
  /** Tamanho do ícone */
  size?: number;
}

/**
 * KnowledgeShare — Versão Lite & Veloz 🚀
 * Compartilha o conhecimento diretamente via link + texto.
 */
const KnowledgeShare: React.FC<KnowledgeShareProps> = ({
  title,
  text,
  onShare,
  themeColor = '#4b7bed',
  size = 18
}) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'success'>('idle');

  const handleShare = async () => {
    // Força o domínio de produção e limpa duplicidades
    const currentUrl = getProductionUrl();
    const shareText = `${text}\n\nConfira aqui: ${currentUrl}`;

    try {
      if (navigator.share) {
        // Na Share API, enviamos o texto SEM o link e o link no campo 'url'.
        // O navegador já formata e evita a duplicidade.
        await navigator.share({
          title,
          text: text, // Apenas o texto original
          url: currentUrl // O link vai aqui
        });
        setShareStatus('success');
      } else {
        // Tentativa de Clipboard nativo (requer HTTPS)
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          setShareStatus('success');
        } else {
          // Fallback final para ambientes não-seguros (HTTP local no celular)
          const success = copyToClipboardFallback(shareText);
          if (success) setShareStatus('success');
        }
      }

      onShare?.();
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    } finally {
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.shareBtn} 
        onClick={handleShare}
        title="Compartilhar Conhecimento"
        style={{ '--theme-color': themeColor } as React.CSSProperties}
      >
        {shareStatus === 'success' ? (
          <Check size={size} className={styles.successIcon} />
        ) : (
          <Share2 size={size} />
        )}
        <span className={styles.tooltip}>Compartilhar Link</span>
      </button>
    </div>
  );
};

export default KnowledgeShare;
