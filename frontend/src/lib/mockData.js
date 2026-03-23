// ============================================================
// MOCK DATA — DB 스키마 ERD 기준 정렬
//
// 변경 이력:
//   - recurrences.interval_val → interval (ERD 컬럼명 일치)
//   - todos.tags[] 제거 → todo_tags 조인 테이블로 정규화
//   - mockTodoTags를 실제 태그 조회에 활용하도록 정비
//   - due_date: DATE 형식 통일 ('YYYY-MM-DD')
//   - created_at / updated_at: DATETIME ISO 형식 통일
// ============================================================

// ── categories ──────────────────────────────────────────────
// ERD: id(BIGINT PK), name(VARCHAR), color(VARCHAR), created_at(DATETIME)
export const mockCategories = [
  { id: 1, name: '업무', color: '#4F86F7', created_at: '2026-01-01T00:00:00' },
  { id: 2, name: '개인', color: '#34C759', created_at: '2026-01-01T00:00:00' },
  { id: 3, name: '쇼핑', color: '#FF9500', created_at: '2026-01-01T00:00:00' },
  { id: 4, name: '건강', color: '#FF3B30', created_at: '2026-01-01T00:00:00' },
]

// ── tags ────────────────────────────────────────────────────
// ERD: id(BIGINT PK), name(VARCHAR), color(VARCHAR)
export const mockTags = [
  { id: 1, name: '긴급', color: '#FF3B30' },
  { id: 2, name: '중요', color: '#AF52DE' },
  { id: 3, name: '회의', color: '#007AFF' },
  { id: 4, name: '공부', color: '#5AC8FA' },
  { id: 5, name: '운동', color: '#34C759' },
]

// ── recurrences ─────────────────────────────────────────────
// ERD: id(BIGINT PK), type(ENUM), interval(INT), days_of_week(VARCHAR), end_date(DATE)
// 변경: interval_val → interval  (ERD 컬럼명 일치)
export const mockRecurrences = [
  { id: 1, type: 'daily',   interval: 1, days_of_week: null,          end_date: null        },
  { id: 2, type: 'weekly',  interval: 1, days_of_week: 'MON,WED,FRI', end_date: null        },
  { id: 3, type: 'monthly', interval: 1, days_of_week: null,          end_date: '2026-12-31' },
]

// ── todos ────────────────────────────────────────────────────
// ERD: id(BIGINT PK), title(VARCHAR), description(TEXT), is_done(TINYINT(1)),
//      priority(ENUM), due_date(DATETIME), category_id(BIGINT FK),
//      recurrence_id(BIGINT FK), created_at(DATETIME), updated_at(DATETIME)
//
// 변경: tags[] 필드 제거 → todo_tags 조인 테이블로 정규화
//       due_date를 DATE 문자열 'YYYY-MM-DD'로 통일
export const mockTodos = [
  {
    id: 1,
    title: '주간 보고서 작성',
    description: 'Q3 성과 정리 및 팀 공유',
    is_done: false,
    priority: 'high',
    due_date: new Date().toISOString().split('T')[0],
    category_id: 1,
    recurrence_id: null,
    created_at: '2026-01-01T09:00:00',
    updated_at: '2026-01-10T09:00:00',
  },
  {
    id: 2,
    title: '헬스장 가기',
    description: '유산소 30분 + 하체 운동',
    is_done: false,
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    category_id: 4,
    recurrence_id: 2,
    created_at: '2026-01-01T09:00:00',
    updated_at: '2026-01-10T09:00:00',
  },
  {
    id: 3,
    title: '장보기',
    description: '우유, 계란, 야채',
    is_done: true,
    priority: 'low',
    due_date: new Date().toISOString().split('T')[0],
    category_id: 3,
    recurrence_id: null,
    created_at: '2026-01-05T09:00:00',
    updated_at: '2026-01-10T09:00:00',
  },
  {
    id: 4,
    title: 'React 강의 수강',
    description: 'Hooks 챕터 완료',
    is_done: false,
    priority: 'medium',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category_id: 2,
    recurrence_id: null,
    created_at: '2026-01-06T09:00:00',
    updated_at: '2026-01-10T09:00:00',
  },
]

// ── todo_tags ────────────────────────────────────────────────
// ERD: todo_id(BIGINT FK), tag_id(BIGINT FK)
// todos.tags[] 배열 제거로 이 테이블이 태그 관계의 유일한 출처가 됨
export const mockTodoTags = [
  { todo_id: 1, tag_id: 1 },
  { todo_id: 1, tag_id: 3 },
  { todo_id: 2, tag_id: 5 },
  { todo_id: 4, tag_id: 2 },
  { todo_id: 4, tag_id: 4 },
]

// ── 헬퍼: todo_id로 tag id 배열 조회 ───────────────────────
// 컴포넌트에서 todo.tags 대신 이 함수 사용
export function getTagIdsByTodoId(todoId) {
  return mockTodoTags
    .filter(tt => tt.todo_id === todoId)
    .map(tt => tt.tag_id)
}
