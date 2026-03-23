import { useState, useEffect, useCallback } from 'react'
import { useTodo } from '@/context/TodoContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PRIORITIES, RECURRENCE_TYPES, DAYS_OF_WEEK } from '@/lib/constants'
import styles from './TodoForm.module.css'

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: new Date().toISOString().split('T')[0],
  category_id: null,
  recurrence_id: null,
  recurrence_type: null,     // 'daily' | 'weekly' | 'monthly' | null
  recurrence_days: [],       // 매주 선택 요일 ['MON','WED','FRI']
  recurrence_end_date: '',   // 반복 종료일 'YYYY-MM-DD' | '' (없으면 무기한)
  tags: [],
  is_done: false,
}

export function TodoForm({ isOpen, onClose, editTodo }) {
  const { state, dispatch, getTagIds } = useTodo()
  const [form, setForm]     = useState(EMPTY)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (editTodo) {
      const rec = editTodo.recurrence_id
        ? state.recurrences.find(r => r.id === editTodo.recurrence_id)
        : null
      setForm({
        ...EMPTY,
        ...editTodo,
        // todo_tags 조인 테이블에서 태그 id 배열 로드
        tags: getTagIds(editTodo.id),
        recurrence_type: rec?.type ?? null,
        recurrence_days: rec?.days_of_week
          ? rec.days_of_week.split(',')
          : [],
        recurrence_end_date: rec?.end_date ?? '',
      })
    } else {
      setForm({ ...EMPTY, due_date: state.selectedDate })
    }
    setIsDirty(false)
  }, [isOpen, editTodo, state.selectedDate, state.recurrences, state.todoTags])

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setIsDirty(true)
  }, [])

  const toggleTag = useCallback((id) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id],
    }))
    setIsDirty(true)
  }, [])

  const toggleDay = useCallback((dayVal) => {
    setForm(f => ({
      ...f,
      recurrence_days: f.recurrence_days.includes(dayVal)
        ? f.recurrence_days.filter(d => d !== dayVal)
        : [...f.recurrence_days, dayVal],
    }))
    setIsDirty(true)
  }, [])

  const submit = useCallback(() => {
    if (!form.title.trim()) return

    if (form.recurrence_type === 'weekly' && form.recurrence_days.length === 0) {
      alert('반복 요일을 하나 이상 선택해주세요.')
      return
    }

    if (form.recurrence_type && form.recurrence_end_date) {
      if (form.recurrence_end_date <= form.due_date) {
        alert('반복 종료일은 시작 날짜보다 이후여야 합니다.')
        return
      }
    }

    const isDuplicate = !editTodo && state.todos.some(
      t => !t.recurrence_id &&
           t.title.trim() === form.title.trim() &&
           t.due_date === form.due_date
    )
    if (isDuplicate) {
      const ok = window.confirm(`"${form.title}" 항목이 이미 있습니다.\n그래도 추가하시겠습니까?`)
      if (!ok) return
    }

    // recurrence 처리 — interval (ERD 컬럼명)
    let recurrenceId = null
    if (form.recurrence_type) {
      const newRec = {
        type:         form.recurrence_type,
        interval:     1,                          // interval_val → interval
        days_of_week: form.recurrence_type === 'weekly'
          ? form.recurrence_days.join(',')
          : null,
        end_date: form.recurrence_end_date || null,
      }
      if (editTodo?.recurrence_id) {
        dispatch({ type: 'UPDATE_RECURRENCE', payload: { ...newRec, id: editTodo.recurrence_id } })
        recurrenceId = editTodo.recurrence_id
      } else {
        recurrenceId = Date.now()
        dispatch({ type: 'ADD_RECURRENCE', payload: { ...newRec, id: recurrenceId } })
      }
    }

    // todos 테이블에는 태그 컬럼 없음 — tags 필드 제외하고 저장
    const { tags: formTags, recurrence_type, recurrence_days, recurrence_end_date, ...todoFields } = form
    const todoPayload = {
      ...todoFields,
      recurrence_id: recurrenceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (editTodo) {
      dispatch({ type: 'UPDATE_TODO', payload: { ...todoPayload, id: editTodo.id } })
    } else {
      const newId = Date.now()
      dispatch({ type: 'ADD_TODO', payload: { ...todoPayload, id: newId } })
      // todo_tags 조인 테이블에 태그 관계 저장
      dispatch({ type: 'SET_TODO_TAGS', payload: { todoId: newId, tagIds: formTags } })
      setIsDirty(false)
      onClose()
      return
    }

    // 수정 시에도 todo_tags 갱신
    dispatch({ type: 'SET_TODO_TAGS', payload: { todoId: editTodo.id, tagIds: formTags } })
    setIsDirty(false)
    onClose()
  }, [form, editTodo, state.todos, dispatch, onClose])

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }, [submit])

  const isSaveDisabled = !form.title.trim() ||
    (form.recurrence_type === 'weekly' && form.recurrence_days.length === 0) ||
    (form.recurrence_type && form.recurrence_end_date && form.recurrence_end_date <= form.due_date)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTodo ? '할 일 수정' : '새 할 일'}
      isDirty={isDirty}
    >
      <div className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <label className={styles.label}>제목 *</label>
          <input
            className={styles.input}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="할 일을 입력하세요"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>설명</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="자세한 내용을 입력하세요 (선택)"
            rows={3}
          />
        </div>

        {/* Due date + Priority */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>시작 날짜</label>
            <input
              type="date"
              className={styles.input}
              value={form.due_date}
              onChange={e => set('due_date', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>우선순위</label>
            <div className={styles.priorityGroup}>
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  className={`${styles.priorityBtn} ${form.priority === p.value ? styles.priorityActive : ''}`}
                  style={{ '--pc': p.color }}
                  onClick={() => set('priority', p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.chipGroup}>
            <button
              type="button"
              className={`${styles.chip} ${form.category_id === null ? styles.chipActive : ''}`}
              onClick={() => set('category_id', null)}
            >없음</button>
            {state.categories.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.chip} ${form.category_id === c.id ? styles.chipActive : ''}`}
                style={{ '--cc': c.color }}
                onClick={() => set('category_id', c.id)}
              >
                <span className={styles.chipDot} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.field}>
          <label className={styles.label}>태그</label>
          <div className={styles.chipGroup}>
            {state.tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`${styles.chip} ${form.tags.includes(tag.id) ? styles.chipActive : ''}`}
                style={{ '--cc': tag.color }}
                onClick={() => toggleTag(tag.id)}
              >
                <span className={styles.chipDot} />
                {tag.name}
              </button>
            ))}
          </div>
          {form.tags.length > 0 && (
            <div className={styles.selectedTags}>
              {state.tags.filter(t => form.tags.includes(t.id)).map(t => (
                <Badge key={t.id} label={t.name} color={t.color} onRemove={() => toggleTag(t.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Recurrence type */}
        <div className={styles.field}>
          <label className={styles.label}>반복</label>
          <div className={styles.chipGroup}>
            <button
              type="button"
              className={`${styles.chip} ${form.recurrence_type === null ? styles.chipActive : ''}`}
              onClick={() => { set('recurrence_type', null); set('recurrence_days', []) }}
            >없음</button>
            {RECURRENCE_TYPES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`${styles.chip} ${form.recurrence_type === r.value ? styles.chipActive : ''}`}
                onClick={() => {
                  set('recurrence_type', r.value)
                  // 매주가 아닌 걸 선택하면 요일 초기화
                  if (r.value !== 'weekly') set('recurrence_days', [])
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 매주 선택 시 요일 체크박스 */}
          {form.recurrence_type === 'weekly' && (
            <div className={styles.weekdayPicker}>
              <p className={styles.weekdayHint}>반복할 요일을 선택하세요</p>
              <div className={styles.weekdayGrid}>
                {DAYS_OF_WEEK.map(d => {
                  const active = form.recurrence_days.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      type="button"
                      className={`${styles.weekdayBtn} ${active ? styles.weekdayBtnActive : ''}`}
                      onClick={() => toggleDay(d.value)}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
              {form.recurrence_days.length > 0 && (
                <p className={styles.weekdaySelected}>
                  매주 {DAYS_OF_WEEK.filter(d => form.recurrence_days.includes(d.value)).map(d => d.label).join(', ')}요일
                </p>
              )}
              {form.recurrence_days.length === 0 && (
                <p className={styles.weekdayWarn}>요일을 하나 이상 선택해주세요</p>
              )}
            </div>
          )}

          {/* 반복 종료일 — 반복 유형 선택 시 공통 표시 */}
          {form.recurrence_type && (
            <div className={styles.endDateRow}>
              <div className={styles.endDateLeft}>
                <span className={styles.endDateLabel}>종료일</span>
                <span className={styles.endDateSub}>설정 안 하면 무기한 반복</span>
              </div>
              <div className={styles.endDateRight}>
                <input
                  type="date"
                  className={`${styles.input} ${styles.endDateInput} ${
                    form.recurrence_end_date && form.recurrence_end_date <= form.due_date
                      ? styles.inputError : ''
                  }`}
                  value={form.recurrence_end_date}
                  min={form.due_date}
                  onChange={e => set('recurrence_end_date', e.target.value)}
                />
                {form.recurrence_end_date && (
                  <button
                    type="button"
                    className={styles.clearEndDate}
                    onClick={() => set('recurrence_end_date', '')}
                    title="종료일 제거"
                  >✕</button>
                )}
              </div>
              {form.recurrence_end_date && form.recurrence_end_date <= form.due_date && (
                <p className={styles.weekdayWarn} style={{ width: '100%' }}>
                  종료일은 시작 날짜보다 이후여야 합니다
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={submit} disabled={isSaveDisabled}>
            {editTodo ? '수정 완료' : '추가하기'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
