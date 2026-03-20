import { useState, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, format, isSameMonth
} from 'date-fns'
import { ko } from 'date-fns/locale'

export function useCalendar(initialDate = new Date()) {
  const [currentMonth, setCurrentMonth] = useState(initialDate)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end   = endOfWeek(endOfMonth(currentMonth),   { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const goNext = () => setCurrentMonth(m => addMonths(m, 1))
  const goPrev = () => setCurrentMonth(m => subMonths(m, 1))
  const goToday = () => setCurrentMonth(new Date())

  const title = format(currentMonth, 'yyyy년 M월', { locale: ko })

  return { days, currentMonth, goNext, goPrev, goToday, title, isSameMonth }
}
