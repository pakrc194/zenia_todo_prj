import { TAG_COLORS } from '@/lib/constants'
import styles from './ColorPicker.module.css'
import { Check } from 'lucide-react'

export function ColorPicker({ value, onChange }) {
  return (
    <div className={styles.grid}>
      {TAG_COLORS.map(c => (
        <button
          key={c.id}
          type="button"
          className={`${styles.swatch} ${value === c.hex ? styles.active : ''}`}
          style={{ '--c': c.hex }}
          onClick={() => onChange(c.hex)}
          title={c.label}
          aria-label={c.label}
        >
          {value === c.hex && <Check size={12} color="#fff" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
