import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Bot, Sparkles, RotateCcw } from 'lucide-react'
import { useTodo } from '@/context/TodoContext'
import api from '@/lib/axios'
import styles from './ChatBot.module.css'

const QUICK_ACTIONS = [
  { label: '오늘 할 일 요약', prompt: '오늘 할 일을 요약해줘' },
  { label: '미완료 목록',     prompt: '아직 완료 안 된 할 일 보여줘' },
  { label: '우선순위 높은 것', prompt: '우선순위 높은 할 일이 뭐야?' },
]

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '안녕하세요! 할 일 관리를 도와드리는 DoDay AI입니다 ✦\n오늘 할 일이나 일정에 대해 질문해보세요.',
}

/**
 * 현재 todo 상태를 AI 시스템 프롬프트용 텍스트로 직렬화합니다.
 * 민감한 개인정보를 포함할 수 있으므로 클라이언트→서버 구간은
 * HTTPS + 인증 헤더로 보호됩니다.
 */
function buildContext(state) {
  const today      = state.selectedDate
  const todayTodos = state.todos.filter(t => t.due_date === today)
  const allPending = state.todos.filter(t => !t.is_done)

  const fmt = (t) => {
    const cat  = state.categories.find(c => c.id === t.category_id)
    // todo_tags 조인 테이블에서 태그 조회
    const tagIds = state.todoTags.filter(tt => tt.todo_id === t.id).map(tt => tt.tag_id)
    const tags   = state.tags.filter(tg => tagIds.includes(tg.id)).map(tg => tg.name)
    const priorityLabel = { high: '높음', medium: '중간', low: '낮음' }[t.priority] ?? t.priority
    return (
      `- [${t.is_done ? '완료' : '미완료'}] ${t.title}` +
      (t.description ? ` (${t.description})` : '') +
      ` | 우선순위: ${priorityLabel}` +
      (cat  ? ` | 카테고리: ${cat.name}` : '') +
      (tags.length ? ` | 태그: ${tags.join(', ')}` : '') +
      (t.due_date ? ` | 날짜: ${t.due_date}` : '')
    )
  }

  return (
    `당신은 Todo 앱의 도우미 AI입니다. 사용자의 할 일 데이터를 기반으로 친절하게 답변해주세요.\n` +
    `한국어로 답변하고, 간결하게 핵심만 전달하세요.\n\n` +
    `=== 현재 선택된 날짜: ${today} ===\n` +
    `오늘의 할 일 (${todayTodos.length}개):\n` +
    (todayTodos.length ? todayTodos.map(fmt).join('\n') : '없음') + '\n\n' +
    `=== 전체 미완료 할 일 (${allPending.length}개) ===\n` +
    allPending.slice(0, 10).map(fmt).join('\n') +
    (allPending.length > 10 ? `\n... 외 ${allPending.length - 10}개` : '') + '\n\n' +
    `=== 카테고리 목록 ===\n${state.categories.map(c => c.name).join(', ')}\n\n` +
    `=== 태그 목록 ===\n${state.tags.map(t => t.name).join(', ')}`
  )
}

export function ChatBot({ isOpen, onClose }) {
  const { state } = useTodo()
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // 모달 애니메이션 후 포커스
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = useCallback(async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setInput('')
    const userMsg = { role: 'user', content: msg }

    // messages state를 함수형 업데이트로 참조 → stale closure 방지
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      /**
       * Anthropic API 키는 절대 프론트엔드에 노출하지 않습니다.
       * 백엔드의 /chat/completions 엔드포인트가 프록시 역할을 하며:
       *   1. API 키를 서버에서 주입
       *   2. 요청 rate-limit / 인증 처리
       *   3. 필요 시 응답 필터링
       *
       * 백엔드 예시 (Express):
       *   POST /ai/groq
       *   body: { system: string, messages: { role, content }[] }
       *   → Anthropic SDK로 호출 후 { content: string } 반환
       */
      const { data } = await api.get('/ai/groq', {
        param : {
            message : new Date()
        }
      })

      setMessages(prev => [...prev, { role: 'assistant', content: data }])
    } catch (e) {
      const errMsg = e?.status === 429
        ? '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        : e?.message ?? '오류가 발생했어요. 잠시 후 다시 시도해주세요.'

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errMsg },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, state])

  const reset = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: '대화가 초기화됐어요. 새로운 질문을 입력해보세요 ✦',
    }])
    setInput('')
  }, [])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }, [send])

  if (!isOpen) return null

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <Sparkles size={14} />
          </div>
          <div>
            <p className={styles.title}>DoDay AI</p>
            <p className={styles.subtitle}>할 일 도우미</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={reset} title="대화 초기화">
            <RotateCcw size={14} />
          </button>
          <button className={styles.iconBtn} onClick={onClose} title="닫기">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((m, i) => {
          // 줄바꿈 처리를 렌더 시점에 한 번만 수행
          const lines = m.content.split('\n')
          return (
            <div key={i} className={`${styles.bubble} ${styles[m.role]}`}>
              {m.role === 'assistant' && (
                <div className={styles.botIcon}><Bot size={12} /></div>
              )}
              <div className={styles.bubbleText}>
                {lines.map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < lines.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className={`${styles.bubble} ${styles.assistant}`}>
            <div className={styles.botIcon}><Bot size={12} /></div>
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 초기 빠른 질문 — 대화가 시작되기 전에만 표시 */}
      {messages.length <= 2 && (
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q.label}
              className={styles.quickBtn}
              onClick={() => send(q.prompt)}
              disabled={loading}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="메시지를 입력하세요..."
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={() => send()}
          disabled={!input.trim() || loading}
          aria-label="전송"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
