import { useEffect, useState } from 'react'

/**
 * useViewportSize — retorna as dimensões atuais do viewport.
 * Atualiza ao redimensionar a janela.
 */
export function useViewportSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handler = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handler, { passive: true })
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size
}

/**
 * useIsMobile — indica se estamos em um dispositivo móvel.
 */
export function useIsMobile(breakpoint = 768) {
  const { width } = useViewportSize()
  return width < breakpoint
}
