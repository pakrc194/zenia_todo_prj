import { useTodo } from '@/context/TodoContext'
import { PRIORITIES } from '@/lib/constants'
import { X } from 'lucide-react'
import styles from './FilterBar.module.css'

export function FilterBar() {
  const { state, dispatch } = useTodo()

  const hasFilter =
    state.filterCategoryId !== null ||
    state.filterTagId !== null ||
    state.filterPriority !== null

  return (
    <div className={styles.bar}>
      {/* Category filter */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>카테고리</span>
        <div className={styles.chips}>
          {state.categories.map(c => (
            <button
              key={c.id}
              className={`${styles.chip} ${state.filterCategoryId === c.id ? styles.active : ''}`}
              style={{ '--cc': c.color }}
              onClick={() =>
                dispatch({
                  type: 'SET_FILTER_CATEGORY',
                  payload: state.filterCategoryId === c.id ? null : c.id,
                })
              }
            >
              <span className={styles.dot} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Priority filter */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>우선순위</span>
        <div className={styles.chips}>
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              className={`${styles.chip} ${state.filterPriority === p.value ? styles.active : ''}`}
              style={{ '--cc': p.color }}
              onClick={() =>
                dispatch({
                  type: 'SET_FILTER_PRIORITY',
                  payload: state.filterPriority === p.value ? null : p.value,
                })
              }
            >
              <span className={styles.dot} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>태그</span>
        <div className={styles.chips}>
          {state.tags.map(t => (
            <button
              key={t.id}
              className={`${styles.chip} ${state.filterTagId === t.id ? styles.active : ''}`}
              style={{ '--cc': t.color }}
              onClick={() =>
                dispatch({
                  type: 'SET_FILTER_TAG',
                  payload: state.filterTagId === t.id ? null : t.id,
                })
              }
            >
              <span className={styles.dot} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilter && (
        <button
          className={styles.clearBtn}
          onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
        >
          <X size={13} /> 필터 초기화
        </button>
      )}
    </div>
  )
}
