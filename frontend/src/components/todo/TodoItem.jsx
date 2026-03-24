import { useTodo } from '@/context/TodoContext'
import { useRecurringTodos } from '@/hooks/useRecurringTodos'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Repeat, ChevronRight } from 'lucide-react'
import styles from './TodoItem.module.css'

const PRIORITY_COLOR = { high: '#FF3B30', medium: '#FF9500', low: '#34C759' }

export function TodoItem({ todo, onEdit, onEditRule }) {
  const { dispatch }         = useTodo()
  const { toggleInstanceDone } = useRecurringTodos()

  // 백엔드가 조인해서 준 category, tags 객체 직접 사용
  const category    = todo.category
  const todoTags    = todo.tags ?? []
  const isRecurring = !!todo.recurrence

  const toggle = (e) => {
    e.stopPropagation()
    if (todo._isRecurring) {
      toggleInstanceDone(todo.instanceKey)
    } else {
      dispatch({ type: 'TOGGLE_DONE', payload: todo.id })
    }
  }

  const remove = (e) => {
    e.stopPropagation()
    dispatch({ type: 'DELETE_TODO', payload: todo.id })
  }

  const handleClick = () => {
    if (todo._isRecurring) {
      if (onEditRule) onEditRule(todo)
    } else {
      if (onEdit) onEdit(todo)
    }
  }

  return (
    <div
      className={`${styles.item} ${todo.isDone ? styles.done : ''} ${todo._isRecurring ? styles.recurring : ''}`}
      onClick={handleClick}
    >
      <span className={styles.priorityStripe} style={{ '--stripe': PRIORITY_COLOR[todo.priority] }} />

      <button
        className={`${styles.checkbox} ${todo.isDone ? styles.checked : ''}`}
        onClick={toggle}
        aria-label="완료 토글"
      />

      <div className={styles.content}>
        <span className={styles.title}>{todo.title}</span>
        {todo.description && <span className={styles.desc}>{todo.description}</span>}
        <div className={styles.meta}>
          {category && <Badge label={category.name} color={category.color} />}
          {todoTags.map(tag => (
            <Badge key={tag.id} label={tag.name} color={tag.color} />
          ))}
          {isRecurring && (
            <span className={styles.recurIcon} title="반복 일정">
              <Repeat size={11} /> 반복
            </span>
          )}
          {todo._isRecurring && todo.recurrence?.endDate && (
            <span className={styles.endDateBadge} title={`${todo.recurrence.endDate} 까지`}>
              ~{todo.recurrence.endDate.slice(5).replace('-', '/')}
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {!todo._isRecurring && (
          <button className={styles.actionBtn} onClick={remove} aria-label="삭제">
            <Trash2 size={14} />
          </button>
        )}
        <ChevronRight size={14} className={styles.chevron} />
      </div>
    </div>
  )
}
