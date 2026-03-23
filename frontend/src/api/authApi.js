/**
 * Auth API
 *
 * 로그인 / 로그아웃 / 토큰 갱신
 */

import api, { tokenStore } from '@/lib/axios'

const BASE = '/auth'

// ── 로그인 ────────────────────────────────────────────────
/**
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ access_token: string, user: User }>}
 */
export const login = async (payload) => {
  const { data } = await api.post(`${BASE}/login`, payload)
  tokenStore.set(data.access_token)
  return data
}

// ── 로그아웃 ──────────────────────────────────────────────
/**
 * 서버에 로그아웃 요청 후 로컬 토큰 삭제
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await api.post(`${BASE}/logout`)
  } finally {
    tokenStore.remove()
  }
}

// ── 토큰 갱신 ─────────────────────────────────────────────
/**
 * Refresh token (쿠키 기반) → 새 access_token 반환 & 저장
 * @returns {Promise<{ access_token: string }>}
 */
export const refreshToken = async () => {
  const { data } = await api.post(`${BASE}/refresh`)
  tokenStore.set(data.access_token)
  return data
}

// ── 내 정보 조회 ──────────────────────────────────────────
/** @returns {Promise<User>} */
export const getMe = () =>
  api.get(`${BASE}/me`).then(r => r.data)
