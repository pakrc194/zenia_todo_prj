import { useState, useEffect } from 'react'
import { useTodo } from '@/context/TodoContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PRIORITIES, RECURRENCE_TYPES } from '@/lib/constants'
import styles from './TodoForm.module.css'

const EMPTY = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: new Date().toISOString().split('T')[0],
  category_id: null,
  recurrence_id: null,
  tags: [],
  is_done: false,
}

export function TodoForm({ isOpen, onClose, editTodo }) {
  const { state, dispatch } = useTodo()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editTodo) {
      setForm({ ...EMPTY, ...editTodo })
    } else {
      setForm({ ...EMPTY, due_date: state.selectedDate })
    }
  }, [editTodo, isOpen, state.selectedDate])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleTag = (id) => {
    set('tags', form.tags.includes(id)
      ? form.tags.filter(t => t !== id)
      : [...form.tags, id]
    )
  }

  const submit = () => {
    if (!form.title.trim()) return
    if (editTodo) {
      dispatch({ type: 'UPDATE_TODO', payload: { ...form, id: editTodo.id } })
    } else {
      dispatch({ type: 'ADD_TODO', payload: { ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } })
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTodo ? '할 일 수정' : '새 할 일'}
    >
      <div className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <label className={styles.label}>제목 *</label>
          <input
            className={styles.input}
            value={form.title}
            onChange={e => set('title', e.target.value)}
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
            <label className={styles.label}>날짜</label>
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
            >
              없음
            </button>
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
            {state.tags.map(tag => {
              const active = form.tags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  style={{ '--cc': tag.color }}
                  onClick={() => toggleTag(tag.id)}
                >
                  <span className={styles.chipDot} />
                  {tag.name}
                </button>
              )
            })}
          </div>
          {form.tags.length > 0 && (
            <div className={styles.selectedTags}>
              {state.tags.filter(t => form.tags.includes(t.id)).map(t => (
                <Badge
                  key={t.id}
                  label={t.name}
                  color={t.color}
                  onRemove={() => toggleTag(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recurrence */}
        <div className={styles.field}>
          <label className={styles.label}>반복</label>
          <div className={styles.chipGroup}>
            <button
              type="button"
              className={`${styles.chip} ${form.recurrence_id === null ? styles.chipActive : ''}`}
              onClick={() => set('recurrence_id', null)}
            >
              없음
            </button>
            {RECURRENCE_TYPES.map(r => (
              <button
                key={r.value}
                type="button"
                className={`${styles.chip} ${form.recurrence_id === r.value ? styles.chipActive : ''}`}
                onClick={() => set('recurrence_id', r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={submit} disabled={!form.title.trim()}>
            {editTodo ? '수정 완료' : '추가하기'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
