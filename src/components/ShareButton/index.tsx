import { useState } from 'react'
import { Share2, Check, ExternalLink } from 'lucide-react'
import { getProductionUrl, copyToClipboardFallback } from '@/utils/shareUtils'
import styles from './ShareButton.module.css'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
  onShare?: () => void
}

export default function ShareButton({ title, text, url, className = '', onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Força o domínio de produção e limpa duplicidades
    const productionUrl = getProductionUrl(url);

    const shareText = `${text}\n\nEspia só o que aprendi com o Théo:\n${productionUrl}`
    
    try {
      if (navigator.share) {
        // Envia campos separados para a API cuidar da formatação sem duplicidade
        await navigator.share({
          title,
          text: text, // Apenas o texto
          url: productionUrl // O link vai aqui
        })
        if (onShare) onShare()
      } else {
        // Fallback: Clipboard nativo (requer HTTPS)
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText)
          handleCopySuccess()
        } else {
          // Fallback final para ambientes não-seguros (HTTP local no celular)
          const success = copyToClipboardFallback(shareText)
          if (success) handleCopySuccess()
        }
      }
    } catch (err) {
      console.log('Share error:', err)
    }
  }

  const handleCopySuccess = () => {
    setCopied(true)
    if (onShare) onShare()
    setTimeout(() => setCopied(false), 3000)
  }

  const shareOnWhatsApp = () => {
    const productionUrl = getProductionUrl(url);
    const encodedText = encodeURIComponent(`${title}\n\n${text}\n\nConfira aqui: ${productionUrl}`)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    if (onShare) onShare()
  }

  return (
    <div className={`${styles.shareGroup} ${className}`}>
      <button 
        className={styles.shareButton}
        onClick={handleShare}
        aria-label="Compartilhar"
      >
        {copied ? <Check size={18} /> : <Share2 size={18} />}
        <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
      </button>

      <button 
        className={`${styles.shareButton} ${styles.whatsapp}`}
        onClick={shareOnWhatsApp}
        aria-label="Compartilhar no WhatsApp"
      >
        <ExternalLink size={18} />
        <span>WhatsApp</span>
      </button>
    </div>
  )
}
