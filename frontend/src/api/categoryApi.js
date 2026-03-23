/**
 * Category API
 *
 * DB 스키마 (categories 테이블):
 *   id, name, color, created_at
 */

import api from '@/lib/axios'

const BASE = '/categories'

// ── 전체 조회 ─────────────────────────────────────────────
/** @returns {Promise<Category[]>} */
export const getCategories = () =>
  api.get(BASE).then(r => r.data)

// ── 단건 조회 ─────────────────────────────────────────────
/** @param {number} id */
export const getCategory = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data)

// ── 생성 ──────────────────────────────────────────────────
/**
 * @param {{ name: string, color: string }} payload
 * @returns {Promise<Category>}
 */
export const createCategory = (payload) =>
  api.post(BASE, payload).then(r => r.data)

// ── 수정 ──────────────────────────────────────────────────
/**
 * @param {number} id
 * @param {{ name?: string, color?: string }} payload
 * @returns {Promise<Category>}
 */
export const updateCategory = (id, payload) =>
  api.patch(`${BASE}/${id}`, payload).then(r => r.data)

// ── 삭제 ──────────────────────────────────────────────────
/** @param {number} id */
export const deleteCategory = (id) =>
  api.delete(`${BASE}/${id}`).then(r => r.data)
