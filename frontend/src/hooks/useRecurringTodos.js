/**
 * useRecurringTodos
 *
 * recurrence 규칙을 가진 todo를 날짜 범위에 따라 인스턴스로 전개합니다.
 * DB에는 규칙 1개만 저장하고, 프론트에서 렌더링 시점에 날짜를 계산합니다.
 *
 * 반환하는 인스턴스 구조:
 * {
 *   ...todo,                     // 원본 todo 필드 그대로
 *   instance_date: 'YYYY-MM-DD', // 해당 반복 인스턴스의 날짜
 *   instance_key:  '2_2026-03-24', // `${todoId}_${date}` — 완료 상태 키
 *   is_done: boolean,            // 날짜별 독립 완료 상태
 * }
 */

import { useMemo, useCallback } from 'react'
import {
  eachDayOfInterval,
  startOfMonth, endOfMonth,
  addMonths, subMonths,
  format, parseISO, isAfter, isBefore, isEqual,
  getDay,
} from 'date-fns'
import { useTodo } from '@/context/TodoContext'

// JS getDay() → 요일 문자열 매핑 (0=일요일)
const JS_DAY_TO_KEY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/**
 * 'MON,WED,FRI' 문자열을 Set으로 파싱
 * @param {string|null} daysOfWeekStr
 * @returns {Set<string>}
 */
function parseDaysOfWeek(daysOfWeekStr) {
  if (!daysOfWeekStr) return new Set()
  return new Set(daysOfWeekStr.split(',').map(d => d.trim()))
}

/**
 * 하나의 todo + recurrence 규칙으로 날짜 범위 내 인스턴스 날짜 배열 반환
 * @param {object} todo
 * @param {object} recurrence
 * @param {Date}   rangeStart
 * @param {Date}   rangeEnd
 * @returns {string[]} 'YYYY-MM-DD' 배열
 */
function expandRecurrence(todo, recurrence, rangeStart, rangeEnd) {
  // 반복 시작 기준: todo.due_date (반복 등록일)
  const startDate = parseISO(todo.due_date)
  // 반복 종료일이 있으면 그것도 고려
  const endDate   = recurrence.end_date ? parseISO(recurrence.end_date) : null

  // 실제 탐색 범위 = rangeStart와 startDate 중 더 늦은 것 ~ rangeEnd와 endDate 중 더 이른 것
  const effectiveStart = isAfter(startDate, rangeStart) ? startDate : rangeStart
  const effectiveEnd   = endDate && isBefore(endDate, rangeEnd) ? endDate : rangeEnd

  if (isAfter(effectiveStart, effectiveEnd)) return []

  const allDays = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd })
  const result  = []

  if (recurrence.type === 'daily') {
    const interval = recurrence.interval ?? 1
    allDays.forEach((day, idx) => {
      // 시작일로부터 interval 배수 날짜만 포함
      const diffFromStart = Math.round(
        (day.getTime() - startDate.getTime()) / 86400000
      )
      if (diffFromStart >= 0 && diffFromStart % interval === 0) {
        result.push(format(day, 'yyyy-MM-dd'))
      }
    })
  } else if (recurrence.type === 'weekly') {
    const allowedDays = parseDaysOfWeek(recurrence.days_of_week)
    allDays.forEach(day => {
      const dayKey = JS_DAY_TO_KEY[getDay(day)]
      if (allowedDays.has(dayKey)) {
        result.push(format(day, 'yyyy-MM-dd'))
      }
    })
  } else if (recurrence.type === 'monthly') {
    const interval    = recurrence.interval ?? 1
    const targetDay   = startDate.getDate() // 매월 같은 일(日)에 반복
    allDays.forEach(day => {
      if (day.getDate() !== targetDay) return
      const monthDiff =
        (day.getFullYear() - startDate.getFullYear()) * 12 +
        (day.getMonth() - startDate.getMonth())
      if (monthDiff >= 0 && monthDiff % interval === 0) {
        result.push(format(day, 'yyyy-MM-dd'))
      }
    })
  }

  return result
}

// ─────────────────────────────────────────────────────────
export function useRecurringTodos() {
  const { state, dispatch } = useTodo()

  /**
   * 주어진 달(currentMonth)을 기준으로 ±1개월 범위의
   * 반복 인스턴스를 전개합니다.
   * CalendarPanel은 앞뒤 달 날짜도 표시하므로 여유 범위를 줍니다.
   *
   * @param {Date} currentMonth
   * @returns {object[]} 반복 인스턴스 배열
   */
  const getInstancesForMonth = useCallback((currentMonth) => {
    const rangeStart = startOfMonth(subMonths(currentMonth, 1))
    const rangeEnd   = endOfMonth(addMonths(currentMonth, 1))

    const instances = []

    state.todos.forEach(todo => {
      if (!todo.recurrence_id) return

      const recurrence = state.recurrences.find(r => r.id === todo.recurrence_id)
      if (!recurrence) return

      const dates = expandRecurrence(todo, recurrence, rangeStart, rangeEnd)

      dates.forEach(date => {
        const instanceKey = `${todo.id}_${date}`
        // 날짜별 독립 완료 상태: completions Map에서 조회
        const isDone = state.completions?.[instanceKey] ?? false

        instances.push({
          ...todo,
          instance_date: date,
          instance_key:  instanceKey,
          due_date:      date,     // 필터링·표시용으로 덮어씀
          is_done:       isDone,
          _is_recurring: true,     // 반복 인스턴스 식별 플래그
        })
      })
    })

    return instances
  }, [state.todos, state.recurrences, state.completions])

  /**
   * 특정 날짜의 반복 인스턴스만 반환 (TodoList에서 사용)
   * @param {string} date 'YYYY-MM-DD'
   */
  const getInstancesForDate = useCallback((date) => {
    const d = parseISO(date)
    const rangeStart = d
    const rangeEnd   = d

    const instances = []

    state.todos.forEach(todo => {
      if (!todo.recurrence_id) return
      const recurrence = state.recurrences.find(r => r.id === todo.recurrence_id)
      if (!recurrence) return

      const dates = expandRecurrence(todo, recurrence, rangeStart, rangeEnd)
      dates.forEach(instanceDate => {
        const instanceKey = `${todo.id}_${instanceDate}`
        const isDone = state.completions?.[instanceKey] ?? false
        instances.push({
          ...todo,
          instance_date: instanceDate,
          instance_key:  instanceKey,
          due_date:      instanceDate,
          is_done:       isDone,
          _is_recurring: true,
        })
      })
    })

    return instances
  }, [state.todos, state.recurrences, state.completions])

  /**
   * 반복 인스턴스의 완료 상태를 토글합니다.
   * recurrence_id가 있는 todo의 TOGGLE_DONE은 이 함수를 사용하세요.
   * @param {string} instanceKey  `${todoId}_${date}`
   */
  const toggleInstanceDone = useCallback((instanceKey) => {
    dispatch({ type: 'TOGGLE_RECURRING_DONE', payload: instanceKey })
  }, [dispatch])

  return { getInstancesForMonth, getInstancesForDate, toggleInstanceDone }
}
