import { useState } from 'react'
import { useTodo } from '@/context/TodoContext'
import { useModal } from '@/hooks/useModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { Trash2, Plus } from 'lucide-react'
import { TAG_COLORS } from '@/lib/constants'
import styles from './TagsPage.module.css'

function TagModal({ isOpen, onClose, type, dispatch, categories }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_COLORS[0].hex)

  const reset = () => { setName(''); setColor(TAG_COLORS[0].hex) }

  const submit = () => {
    if (!name.trim()) return
    dispatch({ type: type === 'tag' ? 'ADD_TAG' : 'ADD_CATEGORY', payload: { name: name.trim(), color, created_at: new Date().toISOString() } })
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose() }} title={type === 'tag' ? '새 태그' : '새 카테고리'} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className={styles.label}>이름</label>
          <input
            className={styles.input}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === 'tag' ? '태그 이름' : '카테고리 이름'}
            autoFocus
          />
        </div>
        <div>
          <label className={styles.label}>색상</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button size="sm" onClick={submit} disabled={!name.trim()}>추가</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function TagsPage() {
  const { state, dispatch } = useTodo()
  const tagModal = useModal()
  const catModal = useModal()
  const [modalType, setModalType] = useState('tag')

  const openTag = () => { setModalType('tag'); tagModal.open() }
  const openCat = () => { setModalType('cat'); catModal.open() }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>태그 & 카테고리</h1>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>카테고리</h2>
          <Button size="sm" onClick={openCat}><Plus size={14} /> 추가</Button>
        </div>
        <div className={styles.grid}>
          {state.categories.map(c => (
            <div key={c.id} className={styles.card}>
              <span className={styles.cardDot} style={{ background: c.color }} />
              <span className={styles.cardName}>{c.name}</span>
              <button
                className={styles.deleteBtn}
                onClick={() => dispatch({ type: 'DELETE_CATEGORY', payload: c.id })}
                aria-label="삭제"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>태그</h2>
          <Button size="sm" onClick={openTag}><Plus size={14} /> 추가</Button>
        </div>
        <div className={styles.badgeWrap}>
          {state.tags.map(t => (
            <div key={t.id} className={styles.tagRow}>
              <Badge label={t.name} color={t.color} />
              <button
                className={styles.deleteBtn}
                onClick={() => dispatch({ type: 'DELETE_TAG', payload: t.id })}
                aria-label="삭제"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <TagModal isOpen={tagModal.isOpen} onClose={tagModal.close} type="tag"  dispatch={dispatch} />
      <TagModal isOpen={catModal.isOpen} onClose={catModal.close} type="cat"  dispatch={dispatch} />
    </div>
  )
}
