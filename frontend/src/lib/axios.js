/**
 * axios 인스턴스
 * - baseURL  : .env VITE_API_BASE_URL
 * - 인증     : Bearer 토큰 (localStorage) — withCredentials 제거
 * - 401 처리 : refresh 재시도 → 실패 시 로그아웃
 * - 에러     : ApiError 클래스로 통일
 */

import axios from 'axios'

// ── 상수 ──────────────────────────────────────────────────
const BASE_URL  = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/'
const TOKEN_KEY = 'access_token'

// 환경변수가 유효한 양수가 아니면 10초 고정
const _rawTimeout = Number(import.meta.env.VITE_API_TIMEOUT)
const TIMEOUT = Number.isFinite(_rawTimeout) && _rawTimeout > 0 ? _rawTimeout : 10_000

// ── 1. ApiError — 인터셉터보다 반드시 먼저 선언 ──────────
// class는 함수와 달리 호이스팅되지 않으므로 파일 최상단에 위치해야 함
export class ApiError extends Error {
  /**
   * @param {string}      message  사용자에게 보여줄 메시지
   * @param {number}      status   HTTP 상태 코드 (네트워크 오류 시 0)
   * @param {Error}       cause    원본 axios 에러
   * @param {object|null} fields   422 유효성 에러 { fieldName: string[] }
   */
  constructor(message, status, cause, fields = null) {
    super(message)
    this.name   = 'ApiError'
    this.status = status
    this.cause  = cause
    this.fields = fields
  }
}

// ── 2. 토큰 헬퍼 — axios.js와 authApi.js 양쪽에서 공유 ──
export const tokenStore = {
  get:    ()      => localStorage.getItem(TOKEN_KEY),
  set:    (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: ()      => localStorage.removeItem(TOKEN_KEY),
}

// ── 3. axios 인스턴스 ─────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // withCredentials는 쿠키 기반 인증 시에만 true.
  // Bearer 토큰과 동시에 사용하면 CORS preflight 충돌 발생 → false 고정
  withCredentials: false,
})

// ── 4. 요청 인터셉터 — Authorization 헤더 자동 주입 ───────
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── 5. 응답 인터셉터 — 에러 처리 + 401 refresh 재시도 ─────

// refresh 진행 중 플래그: 동시에 여러 요청이 401을 받아도 refresh는 1회만 수행
let isRefreshing = false
// refresh 완료를 기다리는 대기 요청 큐
let pendingQueue = []

/**
 * refresh 성공/실패 후 대기 중인 요청들을 일괄 처리
 * @param {string|null} newToken  성공 시 새 토큰, 실패 시 null
 */
function flushQueue(newToken) {
  pendingQueue.forEach(({ resolve, reject }) =>
    newToken ? resolve(newToken) : reject(new Error('Token refresh failed')),
  )
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { response }    = error

    // ── 네트워크 오류 / 타임아웃 (response 자체가 없음) ───
    if (!response) {
      const isTimeout = error.code === 'ECONNABORTED'
      return Promise.reject(
        new ApiError(
          isTimeout
            ? '요청 시간이 초과됐습니다. 네트워크를 확인해주세요.'
            : '네트워크 오류가 발생했습니다.',
          0,
          error,
        ),
      )
    }

    const { status, data } = response

    // ── 401: access token 만료 → refresh 후 재시도 ────────
    if (status === 401 && !originalRequest._retry) {

      // 이미 refresh 진행 중이면 완료될 때까지 큐에서 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // authApi.refreshToken()을 직접 호출하면 circular import 발생.
        // api 인스턴스와 독립된 axios 원본으로 직접 호출.
        const { data: refreshData } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }, // refresh token은 httpOnly 쿠키로 수신
        )
        const newToken = refreshData.access_token
        tokenStore.set(newToken)
        flushQueue(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // refresh 실패 → 대기 요청 전부 reject 후 로그아웃
        flushQueue(null)
        tokenStore.remove()
        window.location.href = '/login'
        return Promise.reject(
          new ApiError('세션이 만료됐습니다. 다시 로그인해주세요.', 401, refreshError),
        )
      } finally {
        isRefreshing = false
      }
    }

    // ── 그 외 HTTP 상태 코드 ──────────────────────────────
    switch (status) {
      case 400:
        return Promise.reject(
          new ApiError(data?.message ?? '잘못된 요청입니다.', status, error),
        )

      case 401:
        // _retry 이후 재시도에서도 401 → 더 이상 복구 불가, 로그아웃
        tokenStore.remove()
        window.location.href = '/login'
        return Promise.reject(
          new ApiError('인증이 만료됐습니다. 다시 로그인해주세요.', status, error),
        )

      case 403:
        return Promise.reject(
          new ApiError('접근 권한이 없습니다.', status, error),
        )

      case 404:
        return Promise.reject(
          new ApiError(data?.message ?? '요청한 데이터를 찾을 수 없습니다.', status, error),
        )

      case 422:
        return Promise.reject(
          new ApiError(
            data?.message ?? '입력 값을 확인해주세요.',
            status,
            error,
            data?.errors ?? null,
          ),
        )

      case 500:
      case 502:
      case 503:
        return Promise.reject(
          new ApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', status, error),
        )

      default:
        return Promise.reject(
          new ApiError(data?.message ?? '알 수 없는 오류가 발생했습니다.', status, error),
        )
    }
  },
)

export default api
