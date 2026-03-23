import { useTodo } from '@/context/TodoContext'
import { useRecurringTodos } from '@/hooks/useRecurringTodos'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Repeat, ChevronRight, Lock } from 'lucide-react'
import styles from './TodoItem.module.css'
import { useTodoApi } from '../../hooks/useTodoApi'
import { useEffect } from 'react'

const PRIORITY_COLOR = {
  high:   '#FF3B30',
  medium: '#FF9500',
  low:    '#34C759',
}

export function TodoItem({ todo, onEdit, onEditRule }) {
  const { state, dispatch, getTagIds } = useTodo()
  const { toggleInstanceDone }         = useRecurringTodos()
  const { fetchTodos, addTodo, loadingMap } = useTodoApi() // API 함수 가져오기

  const category    = state.categories.find(c => c.id === todo.category_id)
  // todo.tags[] 대신 todo_tags 조인 테이블 기반 조회
  const tagIds      = todo._is_recurring ? getTagIds(todo.id) : getTagIds(todo.id)
  const todoTags    = state.tags.filter(t => tagIds.includes(t.id))
  const isRecurring = !!todo.recurrence_id

  const toggle = (e) => {
    e.stopPropagation()
    if (todo._is_recurring) {
      toggleInstanceDone(todo.instance_key)
    } else {
      dispatch({ type: 'TOGGLE_DONE', payload: todo.id })
    }
  }

  const remove = (e) => {
    e.stopPropagation()
    dispatch({ type: 'DELETE_TODO', payload: todo.id })
  }

  const handleClick = () => {
    if (todo._is_recurring) {
      // 반복 인스턴스 클릭 → 원본 todo의 규칙 수정 모달 열기
      if (onEditRule) onEditRule(todo)
    } else {
      if (onEdit) onEdit(todo)
    }
  }

  useEffect(()=>{
    const setTodos = async () => {
      const response = await fetchTodos({
        date:new Date().toISOString().split("T")[0]
      })
      console.log(response)
    }
    setTodos();
  }, [fetchTodos])

  if (loadingMap.fetchTodos) return <div>로딩 중...</div>

  return (
    <div
      className={`${styles.item} ${todo.is_done ? styles.done : ''} ${todo._is_recurring ? styles.recurring : ''}`}
      onClick={handleClick}
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
          {category && <Badge label={category.name} color={category.color} />}
          {todoTags.map(tag => (
            <Badge key={tag.id} label={tag.name} color={tag.color} />
          ))}
          {isRecurring && (
            <span className={styles.recurIcon} title="반복 일정">
              <Repeat size={11} />
              반복
            </span>
          )}
          {/* 종료일 배지 — 반복 인스턴스에만 표시 */}
          {todo._is_recurring && (() => {
            const rec = state.recurrences.find(r => r.id === todo.recurrence_id)
            if (!rec?.end_date) return null
            return (
              <span className={styles.endDateBadge} title={`${rec.end_date} 까지`}>
                ~{rec.end_date.slice(5).replace('-', '/')}
              </span>
            )
          })()}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {!todo._is_recurring && (
          <button className={styles.actionBtn} onClick={remove} aria-label="삭제">
            <Trash2 size={14} />
          </button>
        )}
        <ChevronRight size={14} className={styles.chevron} />
      </div>
    </div>
  )
}
