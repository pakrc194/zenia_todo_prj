import { Bot, X } from 'lucide-react'
import styles from './ChatFab.module.css'

export function ChatFab({ isOpen, onClick }) {
  return (
    <button
      className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
      onClick={onClick}
      aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
    >
      <span className={styles.iconWrap}>
        <Bot  size={22} className={`${styles.icon} ${styles.iconBot}  ${isOpen ? styles.hidden : ''}`} />
        <X    size={20} className={`${styles.icon} ${styles.iconX}    ${!isOpen ? styles.hidden : ''}`} />
      </span>
      {!isOpen && <span className={styles.ping} />}
    </button>
  )
}
