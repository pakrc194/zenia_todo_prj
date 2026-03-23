/**
 * Recurrence API
 *
 * DB 스키마 (recurrences 테이블):
 *   id(BIGINT PK), type(ENUM), interval(INT), days_of_week(VARCHAR), end_date(DATE)
 */

import api from '@/lib/axios'

const BASE = '/recurrences'

export const getRecurrences = () =>
  api.get(BASE).then(r => r.data)

export const getRecurrence = (id) =>
  api.get(`${BASE}/${id}`).then(r => r.data)

/**
 * @param {CreateRecurrenceDto} payload
 *
 * CreateRecurrenceDto:
 *   type          'daily' | 'weekly' | 'monthly'  (required)
 *   interval      number   반복 간격 (기본 1)
 *   days_of_week  string   'MON,WED,FRI' — weekly 전용
 *   end_date      string   'YYYY-MM-DD' | null
 */
export const createRecurrence = (payload) =>
  api.post(BASE, payload).then(r => r.data)

export const updateRecurrence = (id, payload) =>
  api.patch(`${BASE}/${id}`, payload).then(r => r.data)

export const deleteRecurrence = (id) =>
  api.delete(`${BASE}/${id}`).then(r => r.data)
