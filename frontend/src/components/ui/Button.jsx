import { clsx } from 'clsx'
import styles from './Button.module.css'

/**
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'sm' | 'md' | 'lg'
 */
export function Button({
  children, variant = 'primary', size = 'md',
  className, disabled, onClick, type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
