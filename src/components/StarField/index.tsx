import styles from './StarField.module.css'

/**
 * StarField — fundo cósmico com estrelas animadas.
 * Usa CSS puro (sem canvas) para máxima performance.
 */
export default function StarField() {
  return (
    <div className={styles.starField} aria-hidden="true">
      {/* Camada 1: estrelas pequenas */}
      <div className={styles.starsSmall} />
      {/* Camada 2: estrelas médias */}
      <div className={styles.starsMedium} />
      {/* Camada 3: estrelas grandes (piscando) */}
      <div className={styles.starsLarge} />
      {/* Nebulosa de fundo */}
      <div className={styles.nebula} />
      <div className={styles.nebula2} />
    </div>
  )
}
