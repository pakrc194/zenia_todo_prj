/**
 * Todo API
 *
 * DB 스키마 (todos 테이블):
 *   id, title, description, is_done, priority,
 *   due_date, category_id, recurrence_id,
 *   created_at, updated_at
 *
 * todo_tags 테이블:
 *   todo_id, tag_id
 */

import api from '@/lib/axios'

const BASE = '/todo'

// ── 전체 조회 ─────────────────────────────────────────────
/**
 * @param {object} [params]
 * @param {string} [params.dueDate]     'YYYY-MM-DD'
 * @param {number} [params.categoryId]
 * @param {string} [params.priority]     'high' | 'medium' | 'low'
 * @param {boolean}[params.isDone]
 * @param {string} [params.search]       제목/설명 검색
 * @param {number} [params.page]         페이지 번호 (1-based)
 * @param {number} [params.per_page]     페이지당 개수 (기본 20)
 * @returns {Promise<{ data: Todo[], total: number, page: number, per_page: number }>}
 */
export const getTodos = (params = {}) =>
  api.get(`${BASE}/month`, { params }).then(r => r.data)

// ── 단건 조회 ─────────────────────────────────────────────
/**
 * @param {number} id
 * @returns {Promise<Todo>}
 */
export const getTodo = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data)

// ── 생성 ──────────────────────────────────────────────────
/**
 * @param {CreateTodoDto} payload
 * @returns {Promise<Todo>}
 *
 * CreateTodoDto:
 *   title         string   (required)
 *   description   string
 *   priority      'high' | 'medium' | 'low'   (default 'medium')
 *   due_date      string   'YYYY-MM-DD'
 *   category_id   number
 *   recurrence_id number
 *   tag_ids       number[]
 */
export const createTodo = (payload) =>
  api.post(BASE, payload).then(r => r.data)

// ── 전체 수정 (PUT) ───────────────────────────────────────
/**
 * @param {number} id
 * @param {UpdateTodoDto} payload
 * @returns {Promise<Todo>}
 */
export const updateTodo = (id, payload) =>
  api.put(`${BASE}/${id}`, payload).then(r => r.data)

// ── 부분 수정 (PATCH) ─────────────────────────────────────
/**
 * @param {number} id
 * @param {Partial<UpdateTodoDto>} payload
 * @returns {Promise<Todo>}
 */
export const patchTodo = (id, payload) =>
  api.patch(`${BASE}/${id}`, payload).then(r => r.data)

// ── 완료 토글 전용 PATCH ──────────────────────────────────
/**
 * @param {number}  id
 * @param {boolean} isDone
 * @returns {Promise<Todo>}
 */
export const toggleTodoDone = (id, isDone) =>
  api.patch(`${BASE}/${id}/done`, { isDone }).then(r => r.data).then(r => r.data)

// ── 삭제 ──────────────────────────────────────────────────
/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteTodo = (id) =>
  api.delete(`${BASE}/${id}`).then(r => r.data)

// ── 태그 일괄 교체 ────────────────────────────────────────
/**
 * todo_tags 테이블 전체를 교체 (기존 태그 삭제 후 새 태그 삽입)
 * @param {number}   todoId
 * @param {number[]} tagIds
 * @returns {Promise<{ tag_ids: number[] }>}
 */
export const replaceTodoTags = (todoId, tagIds) =>
  api.put(`${BASE}/${todoId}/tags`, { tag_ids: tagIds }).then(r => r.data)
