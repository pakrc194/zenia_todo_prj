import { useTodo } from '@/context/TodoContext'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Repeat, ChevronRight } from 'lucide-react'
import styles from './TodoItem.module.css'

const PRIORITY_COLOR = {
  high:   '#FF3B30',
  medium: '#FF9500',
  low:    '#34C759',
}

export function TodoItem({ todo, onEdit }) {
  const { state, dispatch } = useTodo()

  const category = state.categories.find(c => c.id === todo.category_id)
  const todoTags  = state.tags.filter(t => todo.tags?.includes(t.id))
  const isRecurring = !!todo.recurrence_id

  const toggle = (e) => {
    e.stopPropagation()
    dispatch({ type: 'TOGGLE_DONE', payload: todo.id })
  }

  const remove = (e) => {
    e.stopPropagation()
    dispatch({ type: 'DELETE_TODO', payload: todo.id })
  }

  return (
    <div
      className={`${styles.item} ${todo.is_done ? styles.done : ''}`}
      onClick={() => onEdit(todo)}
    >
      {/* Priority stripe */}
      <span
        className={styles.priorityStripe}
        style={{ '--stripe': PRIORITY_COLOR[todo.priority] }}
      />

      {/* Checkbox */}
      <button
        className={`${styles.checkbox} ${todo.is_done ? styles.checked : ''}`}
        onClick={toggle}
        aria-label="완료 토글"
      />

      {/* Content */}
      <div className={styles.content}>
        <span className={styles.title}>{todo.title}</span>
        {todo.description && (
          <span className={styles.desc}>{todo.description}</span>
        )}
        <div className={styles.meta}>
          {category && (
            <Badge label={category.name} color={category.color} />
          )}
          {todoTags.map(tag => (
            <Badge key={tag.id} label={tag.name} color={tag.color} />
          ))}
          {isRecurring && (
            <span className={styles.recurIcon} title="반복 일정">
              <Repeat size={11} /> 반복
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={remove} aria-label="삭제">
          <Trash2 size={14} />
        </button>
        <ChevronRight size={14} className={styles.chevron} />
      </div>
    </div>
  )
}
