# CampusHub Design Guide
> Senior UI Designer's Official Design System v1.0

---

## 1. Design Principles

### 브랜드 포지셔닝
CampusHub는 대학생을 위한 **커뮤니티 허브**다. 신뢰감 있는 학술적 분위기와 활기찬 캠퍼스 에너지를 동시에 전달해야 한다.

### 핵심 원칙
| 원칙 | 의미 | 실천 방법 |
|------|------|-----------|
| **Clarity** | 정보를 즉시 파악 | 강한 위계, 군더더기 없는 레이아웃 |
| **Trust** | 신뢰할 수 있는 플랫폼 | 인디고 계열, 일관된 피드백 |
| **Energy** | 캠퍼스의 활기 | 상태 배지, 진행 표시, 이모지 포인트 |
| **Inclusivity** | 누구나 쉽게 | 명확한 대비, 직관적 인터랙션 |

---

## 2. Color System

### Brand Palette — Caramel Cognac

서비스의 중심 색상. 코냑·캐러멜을 연상시키는 맑고 따뜻한 브라운. H=25°로 일관된 색조.

```
Brand 900    #301808  ████  히어로 그라디언트 시작점
Brand 800    #4E2C16  ████  히어로 그라디언트 중간
Brand 700    #6E4228  ████  Hover 상태
Brand 600    #8B5A38  ████  Primary — 버튼, 로고, 링크, 필터 활성
Brand 500    #A06840  ████  진행 바 (정상 상태)
Brand 400    #BC8660  ████  중간 강조, 아이콘
Brand 300    #D4AC8A  ████  Border hover, 포인트 라인
Brand 200    #E8D0BC  ████  배지 테두리, 카드 hover border
Brand 100    #F4E8DC  ████  타입 배지 배경, 약한 강조
Brand 50     #FAF5F0  ████  섹션 배경, 정보 그리드, 역할 배지 배경
```

### Semantic Colors — 동일 계열 유지

브랜드와 다른 색을 쓰되, **같은 따뜻한 계열(H=12~40°)** 안에서만 움직인다.
차가운 핑크(rose)나 형광 오렌지(amber) 절대 사용 금지.

```
Urgency Text  #9E3A24  ████  마감임박 텍스트  (H=14° 테라코타 — 브라운에서 빨강 쪽)
Urgency BG    #F8EDEA  ████  마감임박 배지 배경
Urgency Bar   #C05540  ████  진행 바 80% 이상

Warning Text  #8F6618  ████  자리부족 텍스트  (H=38° 웜골드 — 브라운에서 노랑 쪽)
Warning BG    #F8F2E0  ████  자리부족 배지 배경

Closed Text   Gray 400  ████  마감됨 텍스트
Closed BG     Gray 100  ████  마감됨 배지 배경
```

**왜 이 색인가:**
- Brand H=25° / Urgency H=14° / Warning H=38° → 색상환 ±14° 이내 → 모두 같은 따뜻한 계열로 보임
- 기존 Rose(H=350°)는 브라운과 색상환 정반대 → 이질감 발생

### Neutral Palette

```
Gray 900     #111827  ████  제목, 핵심 텍스트
Gray 700     #374151  ████  본문 텍스트
Gray 500     #6B7280  ████  보조 텍스트, 라벨
Gray 400     #9CA3AF  ████  플레이스홀더, 비활성
#D4C4B8      ████  진행 바 마감 상태 (비활성)
#E0D4C8      ████  인풋 테두리, 버튼 테두리
#E8DDD0      ████  카드 테두리, 헤더 구분선
```

### Background

```
Page BG      #F6F0E6  ████  페이지 전체 배경 (따뜻한 크림)
Card BG      #FDFAF5  ████  카드, 폼, 인풋 배경
Dark Page BG #1C110A  ████  다크모드 페이지 배경
```

### 사용 규칙
- **Primary action**: 항상 `brand-600` 단독. 인디고·퍼플·차가운 계열 절대 금지.
- **Semantic**: CSS 변수(`--color-urgent-*`, `--color-warn-*`)로만 사용. 하드코딩 금지.
- **배경 레이어**: Page BG → Card BG → Brand-50 섹션. 3단계 초과 금지.
- **텍스트 대비**: `brand-600` on `#FDFAF5` ≈ 5.2:1 (WCAG AA 충족).

---

## 3. Typography

### Font Family
- **Primary**: `Geist Sans` — 가독성과 모던함의 균형
- **Mono**: `Geist Mono` — 숫자 데이터, 통계

### Type Scale

| Role | Class | Size | Weight | Use Case |
|------|-------|------|--------|----------|
| Hero Title | `text-3xl font-extrabold` | 30px / 800 | 히어로 섹션 헤딩 |
| Stat Number | `text-5xl font-black` | 48px / 900 | 통계 숫자 |
| Page Title | `text-2xl font-bold` | 24px / 700 | 게시글 상세 제목 |
| Section Heading | `text-lg font-semibold` | 18px / 600 | 섹션 구분 제목 |
| Form Label | `text-sm font-medium` | 14px / 500 | 폼 라벨 |
| Body | `text-sm` | 14px / 400 | 본문, 설명 |
| Caption | `text-xs` | 12px / 400-600 | 배지, 타임스탬프, 도움말 |

### 텍스트 규칙
- **제목 계층**: 한 페이지에 h1은 하나만. h2는 섹션 구분에만.
- **line-height**: 제목 `leading-snug`, 본문 `leading-relaxed`.
- **line-clamp**: 카드 제목 2줄, 설명 2줄 — 카드 높이 일관성 유지.
- **숫자**: 통계, 정원 수는 `font-bold` 이상으로 강조.

---

## 4. Spacing & Layout

### Spacing Scale
```
4px   (1)  — 아이콘-텍스트 간격
6px  (1.5) — 배지 내부 수직 패딩
8px   (2)  — 인라인 요소 간격
12px  (3)  — 컴포넌트 내 섹션 간격
16px  (4)  — 컴포넌트 기본 패딩
20px  (5)  — 카드 내부 패딩
24px  (6)  — 섹션 간격
32px  (8)  — 페이지 주요 섹션 간격
```

### Grid System
```
Container:  max-w-6xl mx-auto px-4
Post Grid:  1 col (mobile) → 2 col (sm) → 3 col (lg)
Gap:        gap-4 (16px)
Form Grid:  2 col (grid-cols-2 gap-4)
Info Grid:  2 col (mobile) → 4 col (md)
```

### 레이아웃 규칙
- **최대 너비**: `max-w-6xl` (1152px) — 이보다 넓으면 스캔이 어려워짐.
- **상세 페이지**: `max-w-3xl` (768px) — 가독성 확보.
- **여백 일관성**: 섹션 간 `mb-6` or `mb-8` 통일. 컴포넌트 내 `p-5` or `p-6`.

---

## 5. Border Radius

```
rounded-lg    8px   인풋, 선택 버튼, 테이블 행
rounded-xl   12px   카드, 검색창, 정보 그리드
rounded-2xl  16px   Post 카드, 폼 컨테이너, 모달
rounded-3xl  24px   히어로 섹션 배너
rounded-full  ∞    배지, 필터 칩, 아바타
```

**규칙**: 컴포넌트의 위계가 높을수록 더 큰 radius를 사용. 배지/칩류는 항상 `rounded-full`.

---

## 6. Shadow System

```
shadow-sm                          — 카드, 폼 컨테이너 (기본 depth)
shadow-xl shadow-brand-50         — 카드 hover 상태
shadow-sm shadow-brand-200        — 활성 필터 칩
```

**규칙**:
- 기본 카드는 테두리(`border border-gray-100`) + `shadow-sm` 조합으로 충분.
- Hover 시 그림자를 키우되 반드시 인디고 색상 그림자로 브랜드 연결.
- Drop shadow 남용 금지. 레이어가 필요한 컴포넌트(모달, 드롭다운)에만 강한 그림자 허용.

---

## 7. Component Patterns

### Badge (배지)

```
Type Badge:      bg-gray-100 text-gray-600     rounded-full px-2.5 py-1 text-xs font-semibold
Urgency (마감):  bg-rose-50 text-rose-500      rounded-full px-2.5 py-1 text-xs font-bold
Urgency (자리):  bg-amber-50 text-amber-600    rounded-full px-2.5 py-1 text-xs
Closed:          bg-gray-100 text-gray-400     rounded-full px-2.5 py-1 text-xs
Detail Type:     bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm font-medium
```

**규칙**:
- 배지는 최대 3개까지. 그 이상은 노이즈.
- 긴급 상태(rose)는 항상 마지막 위치에 두어 시선이 먼저 닿지 않게 할 것.

### Button

```
Primary:   bg-brand-600 text-white rounded-lg px-4 py-2.5 hover:bg-brand-700 transition-colors
Secondary: border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 hover:bg-gray-50
Danger:    text-red-400 hover:text-red-500 hover:bg-red-50 (아이콘 버튼에만)
Disabled:  opacity-50 cursor-not-allowed
```

**규칙**:
- Primary 버튼은 화면당 하나의 핵심 액션에만.
- `transition-colors` 항상 포함. 인터랙션 피드백 필수.
- 버튼 텍스트는 동사형으로: "등록하기", "취소" (명사형 X).

### Input / Select / Textarea

```
base:   border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full
focus:  focus:ring-2 focus:ring-brand-300 focus:border-brand-400 focus:outline-none
error:  border-rose-300 focus:ring-rose-200 focus:border-rose-400
```

**규칙**:
- Focus ring은 항상 2px, 인디고 계열.
- 에러 상태는 rose 계열로 전환.
- `text-sm` 고정 — 폼 내 폰트 크기 통일.

### Filter Chip

```
active:   bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-200
inactive: bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600
all:      px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
```

### Card

```
base:  bg-white border border-gray-100 rounded-2xl p-5 h-full flex flex-col
hover: hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-200
```

**규칙**:
- `h-full flex flex-col` 필수 — 그리드 내 높이 통일.
- 하단 정보 영역은 `mt-auto`로 항상 카드 하단에 고정.

### Progress Bar

```
container: h-1.5 bg-gray-100 rounded-full
fill:
  - 정상:     bg-brand-500
  - 80% 이상: bg-rose-400
  - 100%:     bg-gray-300
```

---

## 8. Iconography

### 이모지 사용 가이드
CampusHub는 아이콘 대신 **이모지를 액센트 포인트**로 사용한다. 이것이 서비스의 캐릭터이자 대학생 타겟에 맞는 친근함이다.

| 역할 | 이모지 | 사용처 |
|------|--------|--------|
| 브랜드 | 🎓 | 로고, 히어로 섹션 |
| 검색 | 🔍 | 검색창 왼쪽 아이콘 |
| 마감 임박 | 🔥 | 마감 임박 필터 칩 |
| 자리 부족 | ⚡ | 자리 부족 필터 칩 |
| 동아리 | 🏫 | 타입 필터 |
| 스터디 | 📚 | 타입 필터 |
| 팀원 | 👥 | 타입 필터 |
| 날짜 | 📅 | 게시글 상세 마감일 |

**규칙**:
- 이모지는 레이블 앞에만. 단독 이모지 버튼은 만들지 말 것.
- 감정적 이모지(😊, 🎉) 사용 금지 — 정보성 이모지만.
- 이모지 크기는 주변 텍스트와 동일. 별도 크기 조정 불필요.

---

## 9. Animation & Transition

```
기본 전환:    transition-all duration-200
색상 전환:    transition-colors
그림자 전환:  transition-all duration-200 (카드 hover)
```

**규칙**:
- 모든 인터랙티브 요소에 `transition` 필수.
- `duration-200` (200ms)가 기본값 — 빠르고 반응적으로.
- Transform (scale, translate) 애니메이션은 현재 미사용. 필요 시 `hover:scale-[1.02]` 정도만 허용.
- Page transition, skeleton loader가 추후 필요한 시점에 도입 권장.

---

## 10. Hero Section

```
container:   bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600
border-radius: rounded-3xl
padding:     px-8 py-10
text:        white / brand-200 (보조)
stat number: text-5xl font-black (Geist Mono 권장)
```

**규칙**:
- 히어로는 페이지당 하나. gradient는 indigo→violet으로 고정.
- 통계 수치 영역은 `font-black`으로 강한 임팩트 유지.
- 히어로 내 CTA 버튼은 `bg-white text-brand-600` (반전 스타일).

---

## 11. Responsive Design

### Breakpoints
```
sm  640px  — 2열 그리드 시작
md  768px  — 폼/상세 레이아웃 변경
lg  1024px — 3열 그리드, 최종 레이아웃
```

### 규칙
- **Mobile First**: 기본 스타일은 모바일. `sm:`, `md:`, `lg:` 접두사로 확장.
- **터치 타겟**: 버튼/링크 최소 높이 44px (`py-2.5` + 텍스트 포함 시 충족).
- **필터 바**: 모바일에서 가로 스크롤 (`overflow-x-auto`) 또는 줄바꿈 허용.

---

## 12. State Design

### 게시글 상태 시스템
```
모집중 (기본)    → 일반 카드 스타일
마감 임박        → rose 배지 + 진행바 rose 전환
자리 부족        → amber 배지
마감됨           → 카드 텍스트 전체 gray-400, 진행바 gray-300
```

### 빈 상태 (Empty State)
- 검색 결과 없음: 중앙 정렬, 이모지 + 설명 텍스트 + 초기화 링크.
- 항상 **사용자 액션 유도**가 있어야 함.

### 로딩 상태
- 현재 미구현. 추후 카드 skeleton UI 도입 권장.
- 색상: `bg-gray-100 animate-pulse rounded-2xl`.

---

## 13. Do / Don't

### DO
- 카드에 `h-full flex flex-col` — 높이 통일
- 인터랙티브 요소마다 `transition` 적용
- 긴급 상태에 rose, 경고 상태에 amber — 색상 시멘틱 준수
- 배지 텍스트는 `font-semibold` 이상
- Focus ring 항상 2px indigo

### DON'T
- 같은 영역에 인디고 배지 + rose 배지를 동시에 크게 노출
- `text-base` 이상 크기를 카드 내부에서 사용
- 카드 테두리 없이 그림자만 사용 (미세 대비 손실)
- 필터가 4개 이상인 행에 이모지 전부 포함 (시각 과부하)
- `rounded-sm` 이하 radius (딱딱한 느낌, 브랜드와 불일치)

---

## 14. 향후 개선 권장사항

### 단기 (즉시 적용 가능)
1. **Dark mode 완성**: CSS 변수 기반으로 전환. 현재 대부분 하드코딩되어 있음.
2. **Skeleton Loader**: 카드 로딩 시 빈 회색 카드 표시.
3. **Toast / Notification**: 게시글 등록 완료 피드백 (현재 없음).

### 중기 (기능 확장 시)
4. **Avatar/Profile**: 작성자 프로필 컴포넌트 정의 (크기 3단계: 24/32/40px).
5. **Modal System**: 삭제 확인, 지원 폼 등을 위한 모달 패턴 정의.
6. **Pagination / Infinite Scroll**: 게시글 수 증가 대비.

### 장기 (서비스 성숙 시)
7. **Design Token 파일화**: Tailwind config에 커스텀 색상 토큰 정의.
8. **Storybook 도입**: 컴포넌트 독립 문서화 및 시각적 회귀 테스트.

---

*CampusHub Design Guide v1.0 — 현재 구현 기준 작성*
