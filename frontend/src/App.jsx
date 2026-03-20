import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { TodoProvider }  from '@/context/TodoContext'
import { AppHeader }     from '@/components/layout/AppHeader'
import HomePage  from '@/pages/HomePage'
import TagsPage  from '@/pages/TagsPage'
import styles from './App.module.css'
import { CalendarDays, Tags } from 'lucide-react'

function AppShell() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <div className={styles.body}>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <CalendarDays size={18} />
            <span>홈</span>
          </NavLink>
          <NavLink
            to="/tags"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <Tags size={18} />
            <span>태그</span>
          </NavLink>
        </nav>

        <div className={styles.content}>
          <Routes>
            <Route path="/"     element={<HomePage />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </TodoProvider>
    </ThemeProvider>
  )
}
