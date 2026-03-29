/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        alt?: string
        'auto-rotate'?: boolean | string
        'camera-controls'?: boolean | string
        ar?: boolean | string
        'ar-modes'?: string
        'shadow-intensity'?: string
        exposure?: string
        poster?: string
        loading?: string
        'interaction-prompt'?: string
        style?: React.CSSProperties
        className?: string
        id?: string
        ref?: any
      },
      HTMLElement
    >
  }
}
