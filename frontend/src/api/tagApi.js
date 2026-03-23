/**
 * Tag API
 *
 * DB 스키마 (tags 테이블):
 *   id, name, color
 *
 * todo_tags 조인 테이블:
 *   todo_id, tag_id
 */

import api from '@/lib/axios'

const BASE = '/tags'

// ── 전체 조회 ─────────────────────────────────────────────
/** @returns {Promise<Tag[]>} */
export const getTags = () =>
  api.get(BASE).then(r => r.data)

// ── 단건 조회 ─────────────────────────────────────────────
/** @param {number} id */
export const getTag = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data)

// ── 생성 ──────────────────────────────────────────────────
/**
 * @param {{ name: string, color: string }} payload
 * @returns {Promise<Tag>}
 */
export const createTag = (payload) =>
  api.post(BASE, payload).then(r => r.data)

// ── 수정 ──────────────────────────────────────────────────
/**
 * @param {number} id
 * @param {{ name?: string, color?: string }} payload
 * @returns {Promise<Tag>}
 */
export const updateTag = (id, payload) =>
  api.patch(`${BASE}/${id}`, payload).then(r => r.data)

// ── 삭제 ──────────────────────────────────────────────────
/** @param {number} id */
export const deleteTag = (id) =>
  api.delete(`${BASE}/${id}`).then(r => r.data)
