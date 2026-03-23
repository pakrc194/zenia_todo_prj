import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useTodo } from '@/context/TodoContext'
import { useRecurringTodos } from '@/hooks/useRecurringTodos'
import { useModal } from '@/hooks/useModal'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { FilterBar } from './FilterBar'
import { Button } from '@/components/ui/Button'
import styles from './TodoList.module.css'
import { useTodoApi } from '../../hooks/useTodoApi'

export function TodoList() {
  const { state, filteredTodos } = useTodo()
  const { fetchTodos, addTodo, loadingMap } = useTodoApi() // API 함수 가져오기

  const { getInstancesForDate }  = useRecurringTodos()
  const addModal  = useModal()
  const [editTodo, setEditTodo]     = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  
  const dateLabel = format(
    new Date(state.selectedDate + 'T00:00:00'),
    'M월 d일 (EEEE)',
    { locale: ko }
  )

  useEffect(()=>{
    const setTodos = async () => {
      const response = await fetchTodos({
        date:new Date().toISOString().split("T")[0]
      })
      console.log(response)
    }
    setTodos();
  }, [])

  if (loadingMap.fetchTodos) return <div>로딩 중...</div>
  

  // 반복 인스턴스 (필터 적용)
  const recurringInstances = getInstancesForDate(state.selectedDate).filter(inst => {
    if (state.filterCategoryId && inst.category_id !== state.filterCategoryId) return false
    if (state.filterTagId) {
      const tagIds = state.todoTags.filter(tt => tt.todo_id === inst.id).map(tt => tt.tag_id)
      if (!tagIds.includes(state.filterTagId)) return false
    }
    if (state.filterPriority && inst.priority !== state.filterPriority) return false
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      if (
        !inst.title.toLowerCase().includes(q) &&
        !(inst.description || '').toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const allTodos = [...filteredTodos, ...recurringInstances]
  const pending   = allTodos.filter(t => !t.is_done)
  const completed = allTodos.filter(t => t.is_done)

  const openEdit = (todo) => setEditTodo(todo)
  const closeEdit = () => setEditTodo(null)

  // 반복 인스턴스 클릭 → 원본 todo 찾아서 수정 모달 열기
  const openEditRule = (instanceTodo) => {
    const original = state.todos.find(t => t.id === instanceTodo.id)
    if (original) setEditTodo(original)
  }



  return (
    <main className={styles.main}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.dateTitle}>{dateLabel}</h1>
          <span className={styles.count}>{pending.length}개 남음</span>
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

      {showFilter && <FilterBar />}

      <div className={styles.list}>
        {allTodos.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✦</span>
            <p>이 날의 할 일이 없어요</p>
            <Button size="sm" onClick={addModal.open}>추가하기</Button>
          </div>
        )}

        {pending.map(todo => (
          <TodoItem
            key={todo._is_recurring ? todo.instance_key : todo.id}
            todo={todo}
            onEdit={openEdit}
            onEditRule={openEditRule}
          />
        ))}

        {completed.length > 0 && (
          <>
            <div className={styles.sectionLabel}>완료됨 ({completed.length})</div>
            {completed.map(todo => (
              <TodoItem
                key={todo._is_recurring ? todo.instance_key : todo.id}
                todo={todo}
                onEdit={openEdit}
                onEditRule={openEditRule}
              />
            ))}
          </>
        )}
      </div>

      <TodoForm isOpen={addModal.isOpen} onClose={addModal.close} editTodo={null} />
      {editTodo && (
        <TodoForm isOpen={!!editTodo} onClose={closeEdit} editTodo={editTodo} />
      )}
    </main>
  )
}
