import { createContext, useContext, useReducer } from 'react'
import {
  mockTodos, mockCategories, mockTags, mockRecurrences
} from '@/lib/mockData'

const TodoContext = createContext(null)

const initialState = {
  todos:       mockTodos,
  categories:  mockCategories,
  tags:        mockTags,
  recurrences: mockRecurrences,
  selectedDate: new Date().toISOString().split('T')[0],
  filterCategoryId: null,
  filterTagId: null,
  filterPriority: null,
  searchQuery: '',
}

function reducer(state, action) {
  switch (action.type) {
    // ---- TODOS ----
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, { ...action.payload, id: Date.now() }] }

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
      return { ...state, todos: state.todos.filter(t => t.id !== action.payload) }

    case 'TOGGLE_DONE':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.payload ? { ...t, is_done: !t.is_done } : t
        ),
      }

    // ---- CATEGORIES ----
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: Date.now() }],
      }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      }

    // ---- TAGS ----
    case 'ADD_TAG':
      return {
        ...state,
        tags: [...state.tags, { ...action.payload, id: Date.now() }],
      }

    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(t => t.id !== action.payload),
      }

    // ---- FILTERS & SELECTION ----
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
        filterTagId: null,
        filterPriority: null,
        searchQuery: '',
      }

    default:
      return state
  }
}

export function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Derived: todos filtered by selectedDate + active filters
  const filteredTodos = state.todos.filter(todo => {
    if (todo.due_date !== state.selectedDate) return false
    if (state.filterCategoryId && todo.category_id !== state.filterCategoryId) return false
    if (state.filterTagId && !todo.tags?.includes(state.filterTagId)) return false
    if (state.filterPriority && todo.priority !== state.filterPriority) return false
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      if (!todo.title.toLowerCase().includes(q) &&
          !(todo.description || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  // Dates that have todos (for calendar dots)
  const datesWithTodos = [...new Set(state.todos.map(t => t.due_date))]

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
