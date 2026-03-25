import { useState, useEffect, useCallback } from 'react'
import { useTodo } from '@/context/TodoContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PRIORITIES, RECURRENCE_TYPES, DAYS_OF_WEEK } from '@/lib/constants'
import styles from './TodoForm.module.css'
import { useCategoryApi, useTagApi, useTodoApi } from '../../hooks/useTodoApi'

const DAY_NUM_TO_LABEL = { '1':'월','2':'화','3':'수','4':'목','5':'금','6':'토','7':'일' }

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: new Date().toISOString().split('T')[0],
  categoryId: null,
  // 반복 설정 (폼 전용 임시 필드)
  recurrenceType: null,
  recurrenceDays: [],
  recurrenceEndDate: '',
  // 선택된 tag id 배열
  tagIds: [],
  isDone: false,
}

export function TodoForm({ isOpen, onClose, editTodo }) {
  const { state, dispatch } = useTodo()
  const [form, setForm]       = useState(EMPTY)
  const [isDirty, setIsDirty] = useState(false)

  const {addTodo, patchTodoField} = useTodoApi()
  const {fetchTags} = useTagApi()
  const {fetchCategories} = useCategoryApi()


  useEffect(() => {
    if (!isOpen) return
    if (editTodo) {
      const rec = editTodo.recurrence
      setForm({
        ...EMPTY,
        ...editTodo,
        // category 객체 → categoryId로 변환
        categoryId:        editTodo.category?.id ?? null,
        // tags 객체배열 → id배열로 변환
        tagIds:            (editTodo.tags ?? []).map(t => t.id),
        recurrenceType:    rec?.type     ?? null,
        recurrenceDays:    rec?.daysOfWeek ? rec.daysOfWeek.split(',') : [],
        recurrenceEndDate: rec?.endDate  ?? '',
      })
    } else {
      setForm({ ...EMPTY, dueDate: state.selectedDate })
    }
    setIsDirty(false)
  }, [isOpen, editTodo, state.selectedDate])

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setIsDirty(true)
  }, [])

  const toggleTag = useCallback((id) => {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter(t => t !== id) : [...f.tagIds, id],
    }))
    setIsDirty(true)
  }, [])

  const toggleDay = useCallback((dayVal) => {
    setForm(f => ({
      ...f,
      recurrenceDays: f.recurrenceDays.includes(dayVal)
        ? f.recurrenceDays.filter(d => d !== dayVal)
        : [...f.recurrenceDays, dayVal],
    }))
    setIsDirty(true)
  }, [])

  const submit = useCallback(() => {
    if (!form.title.trim()) return
    if (form.recurrenceType === 'weekly' && form.recurrenceDays.length === 0) {
      alert('반복 요일을 하나 이상 선택해주세요.')
      return
    }
    if (form.recurrenceType && form.recurrenceEndDate && form.recurrenceEndDate <= form.dueDate) {
      alert('반복 종료일은 시작 날짜보다 이후여야 합니다.')
      return
    }

    console.log("state.todos",state.todos)
    console.log("editTodo",editTodo)

    const isDuplicate = !editTodo && state.todos.some(
      t => {
          console.log("t:",t.title, form.title)
          
          return !t.recurrence &&
           t.title?.trim() === form.title.trim() &&
           t.dueDate === form.dueDate
          }
    )
    if (isDuplicate) {
      if (!window.confirm(`"${form.title}" 항목이 이미 있습니다.\n그래도 추가하시겠습니까?`)) return
    }

    // 백엔드 전송용 payload
    // 백엔드가 저장 후 조인된 형태로 응답을 돌려주므로
    // 프론트는 id만 보내면 됨
    const recurrencePayload = form.recurrenceType ? {
      type:       form.recurrenceType,
      interval:   1,
      daysOfWeek: form.recurrenceType === 'weekly' ? form.recurrenceDays.join(',') : null,
      endDate:    form.recurrenceEndDate || null,
    } : null

    const payload = {
      title:       form.title.trim(),
      description: form.description,
      priority:    form.priority,
      dueDate:     form.dueDate,
      isDone:      form.isDone,
      categoryId:  form.categoryId,
      tagIds:      form.tagIds,          // 백엔드에 id 배열로 전송
      recurrence:  recurrencePayload,    // 백엔드에 규칙 객체로 전송
    }

    console.log("add todo",payload)

    if (editTodo) {
      // 수정: 백엔드 응답(조인 포함)으로 UPDATE_TODO
      patchTodoField(editTodo.id, payload)
    } else {
      // 추가: 임시 id로 낙관적 추가 (백엔드 응답으로 교체됨)
      addTodo(payload)
    }

    setIsDirty(false)
    onClose()
  }, [form, editTodo, state.todos, dispatch, onClose])

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }, [submit])

  const isSaveDisabled =
    !form.title.trim() ||
    (form.recurrenceType === 'weekly' && form.recurrenceDays.length === 0) ||
    (form.recurrenceType && form.recurrenceEndDate && form.recurrenceEndDate <= form.dueDate)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTodo ? '할 일 수정' : '새 할 일'} isDirty={isDirty}>
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
            <input type="date" className={styles.input} value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>우선순위</label>
            <div className={styles.priorityGroup}>
              {PRIORITIES.map(p => (
                <button key={p.value} type="button"
                  className={`${styles.priorityBtn} ${form.priority === p.value ? styles.priorityActive : ''}`}
                  style={{ '--pc': p.color }}
                  onClick={() => set('priority', p.value)}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label}>카테고리</label>
          <div className={styles.chipGroup}>
            <button type="button"
              className={`${styles.chip} ${form.categoryId === null ? styles.chipActive : ''}`}
              onClick={() => set('categoryId', null)}>없음</button>
            {state.categories.map(c => (
              <button key={c.id} type="button"
                className={`${styles.chip} ${form.categoryId === c.id ? styles.chipActive : ''}`}
                style={{ '--cc': c.color }}
                onClick={() => set('categoryId', c.id)}>
                <span className={styles.chipDot} />{c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.field}>
          <label className={styles.label}>태그</label>
          <div className={styles.chipGroup}>
            {state.tags.map(tag => (
              <button key={tag.id} type="button"
                className={`${styles.chip} ${form.tagIds.includes(tag.id) ? styles.chipActive : ''}`}
                style={{ '--cc': tag.color }}
                onClick={() => toggleTag(tag.id)}>
                <span className={styles.chipDot} />{tag.name}
              </button>
            ))}
          </div>
          {form.tagIds.length > 0 && (
            <div className={styles.selectedTags}>
              {state.tags.filter(t => form.tagIds.includes(t.id)).map(t => (
                <Badge key={t.id} label={t.name} color={t.color} onRemove={() => toggleTag(t.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Recurrence */}
        <div className={styles.field}>
          <label className={styles.label}>반복</label>
          <div className={styles.chipGroup}>
            <button type="button"
              className={`${styles.chip} ${form.recurrenceType === null ? styles.chipActive : ''}`}
              onClick={() => { set('recurrenceType', null); set('recurrenceDays', []) }}>없음</button>
            {RECURRENCE_TYPES.map(r => (
              <button key={r.value} type="button"
                className={`${styles.chip} ${form.recurrenceType === r.value ? styles.chipActive : ''}`}
                onClick={() => {
                  set('recurrenceType', r.value)
                  if (r.value !== 'weekly') set('recurrenceDays', [])
                }}>{r.label}</button>
            ))}
          </div>

          {form.recurrenceType === 'weekly' && (
            <div className={styles.weekdayPicker}>
              <p className={styles.weekdayHint}>반복할 요일을 선택하세요</p>
              <div className={styles.weekdayGrid}>
                {DAYS_OF_WEEK.map(d => (
                  <button key={d.value} type="button"
                    className={`${styles.weekdayBtn} ${form.recurrenceDays.includes(d.value) ? styles.weekdayBtnActive : ''}`}
                    onClick={() => toggleDay(d.value)}>{d.label}</button>
                ))}
              </div>
              {form.recurrenceDays.length > 0
                ? <p className={styles.weekdaySelected}>
                    매주 {form.recurrenceDays.sort().map(d => DAY_NUM_TO_LABEL[d]).join(', ')}요일
                  </p>
                : <p className={styles.weekdayWarn}>요일을 하나 이상 선택해주세요</p>
              }
            </div>
          )}

          {form.recurrenceType && (
            <div className={styles.endDateRow}>
              <div className={styles.endDateLeft}>
                <span className={styles.endDateLabel}>종료일</span>
                <span className={styles.endDateSub}>설정 안 하면 무기한 반복</span>
              </div>
              <div className={styles.endDateRight}>
                <input type="date"
                  className={`${styles.input} ${styles.endDateInput} ${
                    form.recurrenceEndDate && form.recurrenceEndDate <= form.dueDate ? styles.inputError : ''
                  }`}
                  value={form.recurrenceEndDate} min={form.dueDate}
                  onChange={e => set('recurrenceEndDate', e.target.value)} />
                {form.recurrenceEndDate && (
                  <button type="button" className={styles.clearEndDate}
                    onClick={() => set('recurrenceEndDate', '')} title="종료일 제거">✕</button>
                )}
              </div>
              {form.recurrenceEndDate && form.recurrenceEndDate <= form.dueDate && (
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
