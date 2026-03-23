import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { TodoProvider }  from '@/context/TodoContext'
import { AppHeader }     from '@/components/layout/AppHeader'
import { ChatBot }       from '@/components/chat/ChatBot'
import { ChatFab }       from '@/components/chat/ChatFab'
import HomePage  from '@/pages/HomePage'
import TagsPage  from '@/pages/TagsPage'
import styles from './App.module.css'
import { CalendarDays, Tags, Bot } from 'lucide-react'

function AppShell() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <AppHeader />
      <div className={styles.body}>
        {/* Side nav */}
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

          {/* Chat 진입 버튼 (사이드 nav 하단) */}
          <div className={styles.navSpacer} />
          <button
            className={`${styles.navItem} ${styles.navBtn} ${chatOpen ? styles.navItemActive : ''}`}
            onClick={() => setChatOpen(v => !v)}
            aria-label="AI 채팅"
          >
            <Bot size={18} />
            <span>AI</span>
            {!chatOpen && <span className={styles.chatDot} />}
          </button>
        </nav>

        {/* Page content */}
        <div className={styles.content}>
          <Routes>
            <Route path="/"     element={<HomePage />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </div>
      </div>

      {/* Floating chat window */}
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* FAB */}
      <ChatFab isOpen={chatOpen} onClick={() => setChatOpen(v => !v)} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <TodoProvider>
        <BrowserRouter future={{ v7_startTransition: true }}>
          <AppShell />
        </BrowserRouter>
      </TodoProvider>
    </ThemeProvider>
  )
}
