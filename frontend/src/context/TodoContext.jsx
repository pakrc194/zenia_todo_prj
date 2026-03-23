import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { mockTodos, mockCategories, mockTags, mockRecurrences, mockTodoTags } from '@/lib/mockData'

const TodoContext = createContext(null)


const initialState = {
  todos:        mockTodos,
  categories:   mockCategories,
  tags:         mockTags,
  recurrences:  mockRecurrences,
  // todo_tags 조인 테이블: { todo_id, tag_id }[]
  // todos.tags[] 배열 제거 후 태그 관계의 유일한 출처
  todoTags:     mockTodoTags,
  // 반복 인스턴스 날짜별 완료 상태: { '${todoId}_${date}': boolean }
  completions:  {},
  selectedDate: new Date().toISOString().split('T')[0],
  filterCategoryId: null,
  filterTagId:      null,
  filterPriority:   null,
  searchQuery:      '',
}

function reducer(state, action) {
  switch (action.type) {
    // ── todos ──────────────────────────────────────────────
    case 'SET_TODOS':
      return { ...state, todos: action.payload }

    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, { id: Date.now(), ...action.payload }] }

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, updated_at: new Date().toISOString() }
            : t
        ),
      }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload),
        // 연관된 todo_tags 행 같이 삭제
        todoTags: state.todoTags.filter(tt => tt.todo_id !== action.payload),
        completions: Object.fromEntries(
          Object.entries(state.completions).filter(([k]) => !k.startsWith(`${action.payload}_`))
        ),
      }

    case 'TOGGLE_DONE':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, is_done: !t.is_done } : t
        ),
      }

    case 'TOGGLE_RECURRING_DONE':
      return {
        ...state,
        completions: { ...state.completions, [action.payload]: !state.completions[action.payload] },
      }

    // ── todo_tags (태그 관계) ──────────────────────────────
    // todo_tags 전체 교체: 특정 todo의 태그를 새 목록으로 덮어씀
    case 'SET_TODO_TAGS': {
      const { todoId, tagIds } = action.payload
      const filtered = state.todoTags.filter(tt => tt.todo_id !== todoId)
      const added    = tagIds.map(tagId => ({ todo_id: todoId, tag_id: tagId }))
      return { ...state, todoTags: [...filtered, ...added] }
    }

    // ── categories ─────────────────────────────────────────
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, { id: Date.now(), ...action.payload }] }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }

    // ── tags ───────────────────────────────────────────────
    case 'SET_TAGS':
      return { ...state, tags: action.payload }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, { id: Date.now(), ...action.payload }] }
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(t => t.id !== action.payload),
        // 연관된 todo_tags 행 같이 삭제
        todoTags: state.todoTags.filter(tt => tt.tag_id !== action.payload),
      }

    // ── recurrences ────────────────────────────────────────
    case 'ADD_RECURRENCE':
      return { ...state, recurrences: [...state.recurrences, action.payload] }
    case 'UPDATE_RECURRENCE':
      return {
        ...state,
        recurrences: state.recurrences.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      }

    // ── filters & selection ────────────────────────────────
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    case 'SET_FILTER_CATEGORY':
      return { ...state, filterCategoryId: action.payload }
    case 'SET_FILTER_TAG':
      return { ...state, filterTagId: action.payload }
    case 'SET_FILTER_PRIORITY':
      return { ...state, filterPriority: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    case 'CLEAR_FILTERS':
      return { ...state, filterCategoryId: null, filterTagId: null, filterPriority: null, searchQuery: '' }

    default:
      return state
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // todo_id → tag id 배열 조회 헬퍼 (컴포넌트에서 todo.tags 대신 사용)
  const getTagIds = useMemo(() => (todoId) =>
    state.todoTags
      .filter(tt => tt.todo_id === todoId)
      .map(tt => tt.tag_id),
    [state.todoTags]
  )

  const filteredTodos = useMemo(() =>
    state.todos.filter(todo => {
      if (todo.recurrence_id) return false
      if (todo.due_date !== state.selectedDate) return false
      if (state.filterCategoryId && todo.category_id !== state.filterCategoryId) return false
      if (state.filterTagId) {
        const tagIds = state.todoTags.filter(tt => tt.todo_id === todo.id).map(tt => tt.tag_id)
        if (!tagIds.includes(state.filterTagId)) return false
      }
      if (state.filterPriority && todo.priority !== state.filterPriority) return false
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        if (!todo.title.toLowerCase().includes(q) &&
            !(todo.description || '').toLowerCase().includes(q)) return false
      }
      return true
    }),
    [state.todos, state.todoTags, state.selectedDate, state.filterCategoryId,
     state.filterTagId, state.filterPriority, state.searchQuery],
  )

  const datesWithTodos = useMemo(
    () => [...new Set(state.todos.filter(t => !t.recurrence_id).map(t => t.due_date))],
    [state.todos],
  )

  return (
    <TodoContext.Provider value={{ state, dispatch, filteredTodos, datesWithTodos, getTagIds }}>
      {children}
    </TodoContext.Provider>
  )
}

export const useTodo = () => {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo must be inside TodoProvider')
  return ctx
}
