import { CalendarPanel } from '@/components/calendar/CalendarPanel'
import { TodoList }      from '@/components/todo/TodoList'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <div className={styles.layout}>
      <CalendarPanel />
      <TodoList />
    </div>
  )
}
