import { useCallback } from 'react'
import {
  eachDayOfInterval,
  startOfMonth, endOfMonth,
  addMonths, subMonths,
  format, parseISO, isAfter, isBefore,
  getDay,
} from 'date-fns'
import { useTodo } from '@/context/TodoContext'

// API 요일 숫자 → JS getDay() 매핑 (1=월~7=일, JS 0=일~6=토)
const API_DAY_TO_JS = { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:0 }

function parseDaysOfWeek(daysOfWeek) {
  if (!daysOfWeek) return new Set()
  return new Set(daysOfWeek.split(',').map(d => API_DAY_TO_JS[Number(d.trim())]))
}

function expandRecurrence(todo, rangeStart, rangeEnd) {
  // todo.recurrence 가 조인되어 있으므로 직접 참조
  const rec = todo.recurrence
  const startDate = parseISO(todo.dueDate)
  const endDate   = rec.endDate ? parseISO(rec.endDate) : null

  const effectiveStart = isAfter(startDate, rangeStart) ? startDate : rangeStart
  const effectiveEnd   = endDate && isBefore(endDate, rangeEnd) ? endDate : rangeEnd

  if (isAfter(effectiveStart, effectiveEnd)) return []

  const allDays = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd })
  const result  = []

  if (rec.type === 'daily') {
    const interval = rec.interval ?? 1
    allDays.forEach(day => {
      const diff = Math.round((day.getTime() - startDate.getTime()) / 86400000)
      if (diff >= 0 && diff % interval === 0) result.push(format(day, 'yyyy-MM-dd'))
    })
  } else if (rec.type === 'weekly') {
    const allowed = parseDaysOfWeek(rec.daysOfWeek)
    allDays.forEach(day => {
      if (allowed.has(getDay(day))) result.push(format(day, 'yyyy-MM-dd'))
    })
  } else if (rec.type === 'monthly') {
    const interval  = rec.interval ?? 1
    const targetDay = startDate.getDate()
    allDays.forEach(day => {
      if (day.getDate() !== targetDay) return
      const monthDiff =
        (day.getFullYear() - startDate.getFullYear()) * 12 +
        (day.getMonth() - startDate.getMonth())
      if (monthDiff >= 0 && monthDiff % interval === 0) result.push(format(day, 'yyyy-MM-dd'))
    })
  }

  return result
}

export function useRecurringTodos() {
  const { state, dispatch } = useTodo()

  const getInstancesForMonth = useCallback((currentMonth) => {
    const rangeStart = startOfMonth(subMonths(currentMonth, 1))
    const rangeEnd   = endOfMonth(addMonths(currentMonth, 1))
    const instances  = []

    state.todos.forEach(todo => {
      if (!todo.recurrence) return

      expandRecurrence(todo, rangeStart, rangeEnd).forEach(date => {
        const instanceKey = `${todo.id}_${date}`
        instances.push({
          ...todo,
          instanceDate: date,
          instanceKey,
          dueDate:      date,
          isDone:       state.completions?.[instanceKey] ?? false,
          _isRecurring: true,
        })
      })
    })

    return instances
  }, [state.todos, state.completions])

  const getInstancesForDate = useCallback((date) => {
    const d = parseISO(date)
    const instances = []

    state.todos.forEach(todo => {
      if (!todo.recurrence) return

      expandRecurrence(todo, d, d).forEach(instanceDate => {
        const instanceKey = `${todo.id}_${instanceDate}`
        instances.push({
          ...todo,
          instanceDate,
          instanceKey,
          dueDate:      instanceDate,
          isDone:       state.completions?.[instanceKey] ?? false,
          _isRecurring: true,
        })
      })
    })

    return instances
  }, [state.todos, state.completions])

  const toggleInstanceDone = useCallback((instanceKey) => {
    dispatch({ type: 'TOGGLE_RECURRING_DONE', payload: instanceKey })
  }, [dispatch])

  return { getInstancesForMonth, getInstancesForDate, toggleInstanceDone }
}
