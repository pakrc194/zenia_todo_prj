import styles from './Badge.module.css'

export function Badge({ label, color, onRemove }) {
  return (
    <span className={styles.badge} style={{ '--badge-color': color }}>
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button className={styles.remove} onClick={onRemove} aria-label="제거">✕</button>
      )}
    </span>
  )
}
