import { Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useTodo } from '@/context/TodoContext'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const { theme, toggleTheme } = useTheme()
  const { state, dispatch } = useTodo()

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>✦</span>
        <span className={styles.logoText}>DoDay</span>
      </div>

      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.search}
          type="text"
          placeholder="할 일 검색..."
          value={state.searchQuery}
          onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
        />
      </div>

      <button
        className={styles.themeBtn}
        onClick={toggleTheme}
        aria-label="테마 전환"
      >
        {theme === 'light'
          ? <Moon size={18} />
          : <Sun size={18} />
        }
      </button>
    </header>
  )
}
