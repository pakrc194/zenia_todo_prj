import { useEffect } from 'react'
import styles from './Modal.module.css'

/**
 * @param {boolean}  isDirty   true이면 ESC·배경 클릭 시 확인 다이얼로그 표시
 */
export function Modal({ isOpen, onClose, title, children, size = 'md', isDirty = false }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key !== 'Escape') return
      handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, isDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  function handleClose() {
    if (isDirty && !window.confirm('입력 중인 내용이 사라집니다. 닫으시겠습니까?')) return
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.modal} ${styles[`modal--${size}`]}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.close} onClick={handleClose} aria-label="닫기">✕</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
