import { useState, useCallback } from 'react'
import { useTodo } from '@/context/TodoContext'
import {
  getTodos, createTodo, updateTodo, patchTodo,
  toggleTodoDone, deleteTodo,
} from '@/api/todoApi'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categoryApi'
import { getTags, createTag, updateTag, deleteTag } from '@/api/tagApi'

// ── 액션별 독립 loading/error ─────────────────────────────
function useActionState(keys) {
  const [loadingMap, setLoadingMap] = useState(Object.fromEntries(keys.map(k => [k, false])))
  const [errorMap,   setErrorMap]   = useState({})

  const run = useCallback(async (key, fn) => {
    setLoadingMap(prev => ({ ...prev, [key]: true }))
    setErrorMap(prev => ({ ...prev, [key]: null }))
    try {
      return await fn()
    } catch (e) {
      setErrorMap(prev => ({ ...prev, [key]: e }))
      throw e
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  return { loadingMap, errorMap, run }
}

// ── Todos ─────────────────────────────────────────────────
export function useTodoApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchTodos', 'addTodo', 'editTodo', 'patchTodoField', 'checkDone', 'removeTodo',
  ])

  // 목록 조회 — 백엔드가 category, recurrence, tags 조인해서 반환
  // 프론트는 응답을 그대로 SET_TODOS로 저장
  const fetchTodos = useCallback(
    (params) =>
      run('fetchTodos', async () => {
        const res  = await getTodos(params)
        const list = res.data ?? res
        dispatch({ type: 'SET_TODOS', payload: Array.isArray(list) ? list : [list] })
        return list
      }),
    [dispatch, run],
  )

  // 추가 — 백엔드가 생성된 todo를 조인 포함해서 반환
  const addTodo = useCallback(
    (payload) =>
      run('addTodo', async () => {
        const todo = await createTodo(payload)
        dispatch({ type: 'ADD_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // 수정 (PUT) — 백엔드가 수정된 todo를 조인 포함해서 반환
  const editTodo = useCallback(
    (id, payload) =>
      run('editTodo', async () => {
        const todo = await updateTodo(id, payload)
        dispatch({ type: 'UPDATE_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // 부분 수정 (PATCH)
  const patchTodoField = useCallback(
    (id, payload) =>
      run('patchTodoField', async () => {
        const todo = await patchTodo(id, payload)
        dispatch({ type: 'UPDATE_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // 완료 토글 — 낙관적 업데이트 후 서버 응답으로 확정
  const checkDone = useCallback(
    (id, isDone) =>
      run('checkDone', async () => {
        dispatch({ type: 'TOGGLE_DONE', payload: id })
        try {
          const todo = await toggleTodoDone(id, isDone)
          dispatch({ type: 'UPDATE_TODO', payload: todo })
          return todo
        } catch (e) {
          dispatch({ type: 'TOGGLE_DONE', payload: id }) // 롤백
          throw e
        }
      }),
    [dispatch, run],
  )

  // 삭제
  const removeTodo = useCallback(
    (id) =>
      run('removeTodo', async () => {
        await deleteTodo(id)
        dispatch({ type: 'DELETE_TODO', payload: id })
      }),
    [dispatch, run],
  )

  return { loadingMap, errorMap, fetchTodos, addTodo, editTodo, patchTodoField, checkDone, removeTodo }
}

// ── Categories ────────────────────────────────────────────
export function useCategoryApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchCategories', 'addCategory', 'editCategory', 'removeCategory',
  ])

  const fetchCategories = useCallback(
    () => run('fetchCategories', async () => {
      const data = await getCategories()
      dispatch({ type: 'SET_CATEGORIES', payload: data })
      return data
    }),
    [dispatch, run],
  )

  const addCategory = useCallback(
    (payload) => run('addCategory', async () => {
      const cat = await createCategory(payload)
      dispatch({ type: 'ADD_CATEGORY', payload: cat })
      return cat
    }),
    [dispatch, run],
  )

  const editCategory = useCallback(
    (id, payload) => run('editCategory', async () => {
      const cat = await updateCategory(id, payload)
      dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
      return cat
    }),
    [dispatch, run],
  )

  const removeCategory = useCallback(
    (id) => run('removeCategory', async () => {
      await deleteCategory(id)
      dispatch({ type: 'DELETE_CATEGORY', payload: id })
    }),
    [dispatch, run],
  )

  return { loadingMap, errorMap, fetchCategories, addCategory, editCategory, removeCategory }
}

// ── Tags ──────────────────────────────────────────────────
export function useTagApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchTags', 'addTag', 'editTag', 'removeTag',
  ])

  const fetchTags = useCallback(
    () => run('fetchTags', async () => {
      const data = await getTags()
      dispatch({ type: 'SET_TAGS', payload: data })
      return data
    }),
    [dispatch, run],
  )

  const addTag = useCallback(
    (payload) => run('addTag', async () => {
      const tag = await createTag(payload)
      dispatch({ type: 'ADD_TAG', payload: tag })
      return tag
    }),
    [dispatch, run],
  )

  const editTag = useCallback(
    (id, payload) => run('editTag', async () => {
      const tag = await updateTag(id, payload)
      dispatch({ type: 'UPDATE_TAG', payload: tag })
      return tag
    }),
    [dispatch, run],
  )

  const removeTag = useCallback(
    (id) => run('removeTag', async () => {
      await deleteTag(id)
      dispatch({ type: 'DELETE_TAG', payload: id })
    }),
    [dispatch, run],
  )

  return { loadingMap, errorMap, fetchTags, addTag, editTag, removeTag }
}
