# DoDay — Todo App Template

React + Vite 기반 Todo 앱 템플릿입니다.

## 실행

```bash
npm install
npm run dev
```

---

## 폴더 구조

```
src/
├── assets/
│   └── styles/
│       └── globals.css         # 디자인 토큰, light/dark 변수, 리셋
│
├── context/
│   ├── ThemeContext.jsx         # light / dark 모드 전역 상태
│   └── TodoContext.jsx          # todos, categories, tags, filters 전역 상태
│
├── hooks/
│   ├── useCalendar.js           # 달력 날짜 계산 훅
│   └── useModal.js              # 모달 open/close 훅
│
├── lib/
│   ├── constants.js             # TAG_COLORS, PRIORITIES, RECURRENCE_TYPES
│   └── mockData.js              # DB 스키마 기반 목업 데이터
│
├── components/
│   ├── ui/                      # 재사용 가능한 기본 UI 컴포넌트
│   │   ├── Button.jsx / .module.css
│   │   ├── Modal.jsx  / .module.css
│   │   ├── Badge.jsx  / .module.css       # 태그/카테고리 뱃지
│   │   └── ColorPicker.jsx / .module.css  # 색상 선택기
│   │
│   ├── layout/
│   │   └── AppHeader.jsx / .module.css    # 상단 헤더 + 검색 + 다크모드 토글
│   │
│   ├── calendar/
│   │   └── CalendarPanel.jsx / .module.css  # 왼쪽 달력 패널
│   │
│   └── todo/
│       ├── TodoList.jsx   / .module.css   # 오른쪽 할 일 목록
│       ├── TodoItem.jsx   / .module.css   # 개별 할 일 행
│       ├── TodoForm.jsx   / .module.css   # 추가/수정 모달 폼
│       └── FilterBar.jsx  / .module.css   # 카테고리·태그·우선순위 필터
│
├── pages/
│   ├── HomePage.jsx / .module.css         # 메인: 캘린더 + 투두리스트
│   └── TagsPage.jsx / .module.css         # 태그 & 카테고리 관리
│
├── App.jsx / App.module.css               # 라우터 + 프로바이더 + 사이드 내비
└── main.jsx                               # 진입점
```

---

## DB 스키마 → 상태 매핑

| DB 테이블       | 상태 위치                          |
|-----------------|------------------------------------|
| `todos`         | `TodoContext` → `state.todos`      |
| `categories`    | `TodoContext` → `state.categories` |
| `tags`          | `TodoContext` → `state.tags`       |
| `recurrences`   | `TodoContext` → `state.recurrences`|
| `todo_tags`     | `todo.tags[]` (tag id 배열)        |

---

## 색상 시스템

### 태그/카테고리 마킹 색상
| 이름    | HEX       |
|---------|-----------|
| Blue    | `#4F86F7` |
| Green   | `#34C759` |
| Orange  | `#FF9500` |
| Red     | `#FF3B30` |
| Purple  | `#AF52DE` |
| Azure   | `#007AFF` |
| Sky     | `#5AC8FA` |

### 우선순위
| 단계   | 색상      |
|--------|-----------|
| 높음   | `#FF3B30` |
| 중간   | `#FF9500` |
| 낮음   | `#34C759` |

---

## 다크모드

`localStorage`에 `theme` 키로 저장됩니다.  
`prefers-color-scheme` 시스템 설정도 자동 반영됩니다.

---

## 실제 DB 연동 시

`src/lib/mockData.js`의 목업 데이터를 실제 API 호출로 교체하고,  
`TodoContext`의 `dispatch` 핸들러에 `fetch` / Supabase / SQLite 호출을 추가하면 됩니다.
