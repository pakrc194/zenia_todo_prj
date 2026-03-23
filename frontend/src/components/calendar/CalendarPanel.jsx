import { format, isToday, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { useRecurringTodos } from '@/hooks/useRecurringTodos'
import { useTodo } from '@/context/TodoContext'
import styles from './CalendarPanel.module.css'

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarPanel() {
  const { days, currentMonth, goNext, goPrev, goToday, title } = useCalendar()
  const { state, dispatch, datesWithTodos } = useTodo()
  const { getInstancesForMonth } = useRecurringTodos()

  const select = (date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: format(date, 'yyyy-MM-dd') })
  }

  // 반복 인스턴스 날짜 Set (캘린더 점 표시용)
  const recurringDates = new Set(
    getInstancesForMonth(currentMonth).map(i => i.instance_date)
  )

  // 이번 달 일반 todo + 반복 인스턴스
  const monthStr = format(currentMonth, 'yyyy-MM')
  const monthTodos = state.todos.filter(
    t => !t.recurrence_id && t.due_date?.startsWith(monthStr)
  )
  const monthRecurringInstances = getInstancesForMonth(currentMonth).filter(
    i => i.instance_date.startsWith(monthStr)
  )

  return (
    <aside className={styles.panel}>
      {/* Month nav */}
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={goPrev}><ChevronLeft size={16} /></button>
        <button className={styles.monthTitle} onClick={goToday}>{title}</button>
        <button className={styles.navBtn} onClick={goNext}><ChevronRight size={16} /></button>
      </div>

      {/* Week header */}
      <div className={styles.weekRow}>
        {WEEK_DAYS.map(d => (
          <span key={d} className={styles.weekDay}>{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className={styles.grid}>
        {days.map(day => {
          const key     = format(day, 'yyyy-MM-dd')
          const sel     = state.selectedDate === key
          const today   = isToday(day)
          const inMonth = isSameMonth(day, currentMonth)
          const hasTodo = datesWithTodos.includes(key) || recurringDates.has(key)

          return (
            <button
              key={key}
              className={[
                styles.day,
                !inMonth ? styles.outOfMonth : '',
                today    ? styles.today : '',
                sel      ? styles.selected : '',
              ].join(' ')}
              onClick={() => select(day)}
            >
              <span className={styles.dayNum}>{format(day, 'd')}</span>
              {hasTodo && !sel && <span className={styles.dot} />}
            </button>
          )
        })}
      </div>

      {/* Today button */}
      <button className={styles.todayBtn} onClick={goToday}>오늘</button>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Monthly summary */}
      <div className={styles.summary}>
        <p className={styles.summaryTitle}>이번 달 카테고리</p>
        <div className={styles.summaryList}>
          {state.categories.map(cat => {
            const normalCnt = monthTodos.filter(t => t.category_id === cat.id).length
            const recurCnt  = new Set(
              monthRecurringInstances
                .filter(i => i.category_id === cat.id)
                .map(i => i.id)
            ).size
            const cnt = normalCnt + recurCnt
            if (cnt === 0) return null
            return (
              <div key={cat.id} className={styles.summaryRow}>
                <span className={styles.summaryDot} style={{ background: cat.color }} />
                <span className={styles.summaryLabel}>{cat.name}</span>
                <span className={styles.summaryCount}>{cnt}</span>
              </div>
            )
          })}
          {monthTodos.length === 0 && monthRecurringInstances.length === 0 && (
            <p className={styles.summaryEmpty}>이번 달 할 일이 없어요</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>
            {monthTodos.length + monthRecurringInstances.length}
          </span>
          <span className={styles.statLabel}>전체</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum} style={{ color: 'var(--color-green)' }}>
            {monthTodos.filter(t => t.is_done).length +
             monthRecurringInstances.filter(i => i.is_done).length}
          </span>
          <span className={styles.statLabel}>완료</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum} style={{ color: 'var(--color-orange)' }}>
            {monthTodos.filter(t => !t.is_done).length +
             monthRecurringInstances.filter(i => !i.is_done).length}
          </span>
          <span className={styles.statLabel}>남음</span>
        </div>
      </div>
    </aside>
  )
}
