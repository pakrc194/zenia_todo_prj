/**
 * useTodoApi / useCategoryApi / useTagApi
 *
 * API 호출 + TodoContext dispatch를 함께 처리하는 훅.
 * 각 액션별로 독립된 loading 상태를 가지므로
 * "저장 중" / "삭제 중"을 동시에 구분해서 표시할 수 있습니다.
 *
 * 사용 예시:
 *   const { addTodo, loadingMap } = useTodoApi()
 *   await addTodo({ title: '새 할 일', priority: 'high' })
 *   loadingMap.addTodo  // 저장 중 여부
 */

import { useState, useCallback } from 'react'
import { useTodo } from '@/context/TodoContext'
import {
  getTodos,
  createTodo,
  updateTodo,
  patchTodo,
  toggleTodoDone,
  deleteTodo,
  replaceTodoTags,
} from '@/api/todoApi'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categoryApi'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/api/tagApi'

// ── 액션별 독립 loading/error 상태 관리 헬퍼 ─────────────
/**
 * 각 키(액션명)마다 loading/error를 개별로 관리합니다.
 * 기존 단일 useAsync()는 addTodo와 removeTodo가 동시에 실행될 때
 * loading 상태가 섞이는 문제가 있어 loadingMap 구조로 교체합니다.
 *
 * @param {string[]} keys  관리할 액션 키 목록
 */
function useActionState(keys) {
  const initial = Object.fromEntries(keys.map(k => [k, false]))
  const [loadingMap, setLoadingMap] = useState(initial)
  const [errorMap,   setErrorMap]   = useState({})

  /**
   * @param {string}   key  액션 키
   * @param {Function} fn   실행할 async 함수
   */
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

// ═══════════════════════════════════════════════════════════
// Todos
// ═══════════════════════════════════════════════════════════
export function useTodoApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchTodos', 'addTodo', 'editTodo', 'patchTodoField',
    'checkDone', 'removeTodo', 'setTodoTags',
  ])

  // ── 목록 조회 ────────────────────────────────────────────
  const fetchTodos = useCallback(
    (params) =>
      run('fetchTodos', async () => {
        const res = await getTodos(params)
        dispatch({ type: 'SET_TODOS', payload: res.data ?? res })
        return res
      }),
    [dispatch, run],
  )

  // ── 추가 ─────────────────────────────────────────────────
  const addTodo = useCallback(
    (payload) =>
      run('addTodo', async () => {
        const todo = await createTodo(payload)
        dispatch({ type: 'ADD_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // ── 전체 수정 (PUT) ───────────────────────────────────────
  const editTodo = useCallback(
    (id, payload) =>
      run('editTodo', async () => {
        const todo = await updateTodo(id, payload)
        dispatch({ type: 'UPDATE_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // ── 부분 수정 (PATCH) ─────────────────────────────────────
  const patchTodoField = useCallback(
    (id, payload) =>
      run('patchTodoField', async () => {
        const todo = await patchTodo(id, payload)
        dispatch({ type: 'UPDATE_TODO', payload: todo })
        return todo
      }),
    [dispatch, run],
  )

  // ── 완료 토글 (낙관적 업데이트) ───────────────────────────
  const checkDone = useCallback(
    (id, is_done) =>
      run('checkDone', async () => {
        // 1. UI 먼저 변경
        dispatch({ type: 'TOGGLE_DONE', payload: id })
        try {
          // 2. 서버 동기화
          const todo = await toggleTodoDone(id, is_done)
          dispatch({ type: 'UPDATE_TODO', payload: todo })
          return todo
        } catch (e) {
          // 3. 실패 시 롤백
          dispatch({ type: 'TOGGLE_DONE', payload: id })
          throw e
        }
      }),
    [dispatch, run],
  )

  // ── 삭제 ─────────────────────────────────────────────────
  const removeTodo = useCallback(
    (id) =>
      run('removeTodo', async () => {
        await deleteTodo(id)
        dispatch({ type: 'DELETE_TODO', payload: id })
      }),
    [dispatch, run],
  )

  // ── 태그 일괄 교체 ────────────────────────────────────────
  const setTodoTags = useCallback(
    (todoId, tagIds) =>
      run('setTodoTags', async () => {
        const res = await replaceTodoTags(todoId, tagIds)
        dispatch({ type: 'UPDATE_TODO', payload: { id: todoId, tags: res.tag_ids } })
        return res
      }),
    [dispatch, run],
  )

  return {
    loadingMap,   // { addTodo: false, removeTodo: true, ... }
    errorMap,     // { addTodo: null, removeTodo: ApiError, ... }
    fetchTodos,
    addTodo,
    editTodo,
    patchTodoField,
    checkDone,
    removeTodo,
    setTodoTags,
  }
}

// ═══════════════════════════════════════════════════════════
// Categories
// ═══════════════════════════════════════════════════════════
export function useCategoryApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchCategories', 'addCategory', 'editCategory', 'removeCategory',
  ])

  const fetchCategories = useCallback(
    () =>
      run('fetchCategories', async () => {
        const data = await getCategories()
        dispatch({ type: 'SET_CATEGORIES', payload: data })
        return data
      }),
    [dispatch, run],
  )

  const addCategory = useCallback(
    (payload) =>
      run('addCategory', async () => {
        const cat = await createCategory(payload)
        dispatch({ type: 'ADD_CATEGORY', payload: cat })
        return cat
      }),
    [dispatch, run],
  )

  const editCategory = useCallback(
    (id, payload) =>
      run('editCategory', async () => {
        const cat = await updateCategory(id, payload)
        dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
        return cat
      }),
    [dispatch, run],
  )

  const removeCategory = useCallback(
    (id) =>
      run('removeCategory', async () => {
        await deleteCategory(id)
        dispatch({ type: 'DELETE_CATEGORY', payload: id })
      }),
    [dispatch, run],
  )

  return { loadingMap, errorMap, fetchCategories, addCategory, editCategory, removeCategory }
}

// ═══════════════════════════════════════════════════════════
// Tags
// ═══════════════════════════════════════════════════════════
export function useTagApi() {
  const { dispatch } = useTodo()
  const { loadingMap, errorMap, run } = useActionState([
    'fetchTags', 'addTag', 'editTag', 'removeTag',
  ])

  const fetchTags = useCallback(
    () =>
      run('fetchTags', async () => {
        const data = await getTags()
        dispatch({ type: 'SET_TAGS', payload: data })
        return data
      }),
    [dispatch, run],
  )

  const addTag = useCallback(
    (payload) =>
      run('addTag', async () => {
        const tag = await createTag(payload)
        dispatch({ type: 'ADD_TAG', payload: tag })
        return tag
      }),
    [dispatch, run],
  )

  const editTag = useCallback(
    (id, payload) =>
      run('editTag', async () => {
        const tag = await updateTag(id, payload)
        dispatch({ type: 'UPDATE_TAG', payload: tag })
        return tag
      }),
    [dispatch, run],
  )

  const removeTag = useCallback(
    (id) =>
      run('removeTag', async () => {
        await deleteTag(id)
        dispatch({ type: 'DELETE_TAG', payload: id })
      }),
    [dispatch, run],
  )

  return { loadingMap, errorMap, fetchTags, addTag, editTag, removeTag }
}
