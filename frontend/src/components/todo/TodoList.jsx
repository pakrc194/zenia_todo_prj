import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useTodo } from '@/context/TodoContext'
import { useModal } from '@/hooks/useModal'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { FilterBar } from './FilterBar'
import { Button } from '@/components/ui/Button'
import styles from './TodoList.module.css'

export function TodoList() {
  const { state, filteredTodos } = useTodo()
  const addModal  = useModal()
  const [editTodo, setEditTodo] = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  const dateLabel = format(
    new Date(state.selectedDate + 'T00:00:00'),
    'M월 d일 (EEEE)',
    { locale: ko }
  )

  const pending   = filteredTodos.filter(t => !t.is_done)
  const completed = filteredTodos.filter(t => t.is_done)

  const openEdit = (todo) => setEditTodo(todo)
  const closeEdit = () => setEditTodo(null)

  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dateTitle}>{dateLabel}</h1>
          <span className={styles.count}>
            {pending.length}개 남음
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.iconBtn} ${showFilter ? styles.iconBtnActive : ''}`}
            onClick={() => setShowFilter(v => !v)}
            aria-label="필터"
          >
            <SlidersHorizontal size={16} />
          </button>
          <Button onClick={addModal.open} size="sm">
            <Plus size={15} /> 추가
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && <FilterBar />}

      {/* List */}
      <div className={styles.list}>
        {/* Pending */}
        {pending.length === 0 && completed.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✦</span>
            <p>이 날의 할 일이 없어요</p>
            <Button size="sm" onClick={addModal.open}>추가하기</Button>
          </div>
        )}

        {pending.map(todo => (
          <TodoItem key={todo.id} todo={todo} onEdit={openEdit} />
        ))}

        {/* Completed section */}
        {completed.length > 0 && (
          <>
            <div className={styles.sectionLabel}>완료됨 ({completed.length})</div>
            {completed.map(todo => (
              <TodoItem key={todo.id} todo={todo} onEdit={openEdit} />
            ))}
          </>
        )}
      </div>

      {/* Add modal */}
      <TodoForm
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        editTodo={null}
      />

      {/* Edit modal */}
      {editTodo && (
        <TodoForm
          isOpen={!!editTodo}
          onClose={closeEdit}
          editTodo={editTodo}
        />
      )}
    </main>
  )
}
