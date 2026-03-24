import { createContext, useContext, useReducer, useMemo } from 'react'
import { mockTodos, mockCategories, mockTags } from '@/lib/mockData'

const TodoContext = createContext(null)

// todos 안에 category, recurrence, tags 객체가 이미 조인되어 있음
// todoTags, recurrence 별도 state 제거
const initialState = {
  todos:       mockTodos,
  categories:  mockCategories,  // 폼 선택 목록 전용
  tags:        mockTags,        // 폼 선택 목록 전용
  completions: {},              // 반복 인스턴스 날짜별 완료 { `${todoId}_${date}`: bool }
  selectedDate:     new Date().toISOString().split('T')[0],
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
      return { ...state, todos: [...state.todos, action.payload] }

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload, updatedAt: new Date().toISOString() }
            : t
        ),
      }

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.payload),
        completions: Object.fromEntries(
          Object.entries(state.completions).filter(([k]) => !k.startsWith(`${action.payload}_`))
        ),
      }

    case 'TOGGLE_DONE':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, isDone: !t.isDone } : t
        ),
      }

    case 'TOGGLE_RECURRING_DONE':
      return {
        ...state,
        completions: {
          ...state.completions,
          [action.payload]: !state.completions[action.payload],
        },
      }

    // ── categories (폼 선택 목록) ──────────────────────────
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }

    // ── tags (폼 선택 목록) ────────────────────────────────
    case 'SET_TAGS':
      return { ...state, tags: action.payload }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] }
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
    case 'DELETE_TAG':
      return { ...state, tags: state.tags.filter(t => t.id !== action.payload) }

    // ── filters ────────────────────────────────────────────
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
      return {
        ...state,
        filterCategoryId: null,
        filterTagId:      null,
        filterPriority:   null,
        searchQuery:      '',
      }

    default:
      return state
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const filteredTodos = useMemo(() =>
    state.todos.filter(todo => {
      if (todo.recurrence) return false   // 반복 todo는 useRecurringTodos에서 처리
      if (todo.dueDate !== state.selectedDate) return false
      if (state.filterCategoryId && todo.category?.id !== state.filterCategoryId) return false
      if (state.filterTagId && !todo.tags?.some(t => t.id === state.filterTagId)) return false
      if (state.filterPriority && todo.priority !== state.filterPriority) return false
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        if (!todo.title.toLowerCase().includes(q) &&
            !(todo.description || '').toLowerCase().includes(q)) return false
      }
      return true
    }),
    [state.todos, state.selectedDate, state.filterCategoryId,
     state.filterTagId, state.filterPriority, state.searchQuery],
  )

  const datesWithTodos = useMemo(
    () => [...new Set(state.todos.filter(t => !t.recurrence).map(t => t.dueDate))],
    [state.todos],
  )

  return (
    <TodoContext.Provider value={{ state, dispatch, filteredTodos, datesWithTodos }}>
      {children}
    </TodoContext.Provider>
  )
}

export const useTodo = () => {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo must be inside TodoProvider')
  return ctx
}
