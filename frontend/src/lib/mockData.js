// mockData — 백엔드 응답 구조 기준 (조인된 형태)
// 백엔드가 todos 조회 시 category, recurrence, tags를 조인해서 반환

export const mockTodos = [
  {
    id: 1,
    title: '주간 보고서 작성',
    description: 'Q3 성과 정리 및 팀 공유',
    isDone: false,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    category: { id: 1, name: '업무', color: '#4F86F7' },
    recurrence: null,
    tags: [
      { id: 1, name: '긴급', color: '#FF3B30' },
      { id: 3, name: '회의', color: '#007AFF' },
    ],
    createdAt: '2026-01-01T09:00:00',
    updatedAt: '2026-01-10T09:00:00',
  },
  {
    id: 2,
    title: '헬스장 가기',
    description: '유산소 30분 + 하체 운동',
    isDone: false,
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    category: { id: 4, name: '건강', color: '#FF3B30' },
    recurrence: { id: 2, type: 'weekly', interval: 1, daysOfWeek: '1,3,5', endDate: null },
    tags: [
      { id: 5, name: '운동', color: '#34C759' },
    ],
    createdAt: '2026-01-01T09:00:00',
    updatedAt: '2026-01-10T09:00:00',
  },
  {
    id: 3,
    title: '장보기',
    description: '우유, 계란, 야채',
    isDone: true,
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    category: { id: 3, name: '쇼핑', color: '#FF9500' },
    recurrence: null,
    tags: [],
    createdAt: '2026-01-05T09:00:00',
    updatedAt: '2026-01-10T09:00:00',
  },
  {
    id: 4,
    title: 'React 강의 수강',
    description: 'Hooks 챕터 완료',
    isDone: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: { id: 2, name: '개인', color: '#34C759' },
    recurrence: null,
    tags: [
      { id: 2, name: '중요', color: '#AF52DE' },
      { id: 4, name: '공부', color: '#5AC8FA' },
    ],
    createdAt: '2026-01-06T09:00:00',
    updatedAt: '2026-01-10T09:00:00',
  },
]

// categories / tags: 폼 UI(선택 목록) 전용
// todos 안의 category, tags와 별개로 관리
export const mockCategories = [
  { id: 1, name: '업무', color: '#4F86F7' },
  { id: 2, name: '개인', color: '#34C759' },
  { id: 3, name: '쇼핑', color: '#FF9500' },
  { id: 4, name: '건강', color: '#FF3B30' },
]

export const mockTags = [
  { id: 1, name: '긴급', color: '#FF3B30' },
  { id: 2, name: '중요', color: '#AF52DE' },
  { id: 3, name: '회의', color: '#007AFF' },
  { id: 4, name: '공부', color: '#5AC8FA' },
  { id: 5, name: '운동', color: '#34C759' },
]
