import { useState } from 'react'
import { Share2, Check, ExternalLink } from 'lucide-react'
import styles from './ShareButton.module.css'

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
  onShare?: () => void
}

export default function ShareButton({ title, text, url = window.location.href, className = '', onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title,
      text: `${text}\n\nEspia só o que aprendi com o Théo:`,
      url
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        if (onShare) onShare()
      } catch (err) {
        console.log('Share failed:', err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        setCopied(true)
        if (onShare) onShare()
        setTimeout(() => setCopied(false), 3000)
      } catch (err) {
        console.error('Clipboard failed', err)
      }
    }
  }

  const shareOnWhatsApp = () => {
    const encodedText = encodeURIComponent(`${title}\n\n${text}\n\n${url}`)
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
