// ============================================================
// MOCK DATA — mirrors the DB schema from the ERD
// Replace with real API calls / Supabase / SQLite as needed
// ============================================================

export const mockCategories = [
  { id: 1, name: '업무',    color: '#4F86F7', created_at: '2024-01-01' },
  { id: 2, name: '개인',    color: '#34C759', created_at: '2024-01-01' },
  { id: 3, name: '쇼핑',    color: '#FF9500', created_at: '2024-01-01' },
  { id: 4, name: '건강',    color: '#FF3B30', created_at: '2024-01-01' },
]

export const mockTags = [
  { id: 1, name: '긴급',    color: '#FF3B30' },
  { id: 2, name: '중요',    color: '#AF52DE' },
  { id: 3, name: '회의',    color: '#007AFF' },
  { id: 4, name: '공부',    color: '#5AC8FA' },
  { id: 5, name: '운동',    color: '#34C759' },
]

export const mockRecurrences = [
  { id: 1, type: 'daily',  interval_val: 1,  days_of_week: null, end_date: null },
  { id: 2, type: 'weekly', interval_val: 1,  days_of_week: 'MON,WED,FRI', end_date: null },
  { id: 3, type: 'monthly',interval_val: 1,  days_of_week: null, end_date: '2024-12-31' },
]

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
    created_at: '2024-07-01',
    updated_at: '2024-07-10',
    tags: [1, 3],
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
    created_at: '2024-07-01',
    updated_at: '2024-07-10',
    tags: [5],
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
    created_at: '2024-07-05',
    updated_at: '2024-07-10',
    tags: [],
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
    created_at: '2024-07-06',
    updated_at: '2024-07-10',
    tags: [2, 4],
  },
]

export const mockTodoTags = [
  { todo_id: 1, tag_id: 1 },
  { todo_id: 1, tag_id: 3 },
  { todo_id: 2, tag_id: 5 },
  { todo_id: 4, tag_id: 2 },
  { todo_id: 4, tag_id: 4 },
]
