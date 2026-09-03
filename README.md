# Voyage — 공동 여행 플래너 (Frontend)

여러 사람이 함께 여행을 계획하고, 장소를 저장·투표하고, 공동 경비를 기록해 자동 정산까지 하는 협업 웹앱의 **프론트엔드**입니다. 모바일 우선 반응형 웹/PWA를 목표로 합니다.

> 의사결정(후보·투표) · 계획(일정) · 기록(경비)을 하나의 협업 공간에 연결합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 코어 | React 18 · TypeScript · Vite |
| 스타일 | Tailwind CSS v3 · 디자인 토큰(oklch) |
| UI | Radix UI 기반 자체 컴포넌트(shadcn 패턴) · lucide-react |
| 서버 상태 | TanStack Query |
| 전역 UI 상태 | Zustand |
| HTTP | Axios |
| 폼·검증 | React Hook Form · Zod |
| 드래그앤드롭 | dnd-kit |
| 목 API | MSW (Mock Service Worker) |
| 테스트 | Vitest · Testing Library |
| 지도(예정) | MapLibre GL · Geoapify |

### 상태 관리 역할 분리
- **Axios** — HTTP 호출
- **TanStack Query** — 서버가 원본인 데이터(여행·일정·경비 등)의 캐시/재조회/무효화
- **Zustand** — 선택한 여행, 드로어 열림 같은 전역 UI 상태

## 프로젝트 구조

```
src/
├─ app/            # 앱 부트스트랩(세션 복원 등)
├─ components/
│  ├─ ui/          # 디자인 시스템 프리미티브 (Button, Input, Dialog …)
│  └─ layout/      # 앱 셸 (Topbar, Sidebar, MobileTabs …)
├─ features/       # 도메인별 기능 (auth, trips …) — api 훅 + 전용 컴포넌트
├─ pages/          # 라우트 단위 화면
├─ routes/         # 라우팅 가드
├─ stores/         # Zustand 스토어 (auth, ui)
├─ lib/            # api 클라이언트, 유틸
├─ types/          # 도메인 모델 타입
└─ mocks/          # MSW 핸들러 + 시드 데이터
```

## 시작하기

```bash
npm install
npm run dev
```

- 개발 서버: http://localhost:5173
- **목(Mock) 모드**로 동작합니다. 로그인 화면에서 아무 비밀번호나 입력하면 진입됩니다.
- 실제 백엔드(Spring Boot) 연동 시 `.env`의 `VITE_USE_MOCKS=false` 로 전환하고 `VITE_API_BASE_URL` 을 지정합니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | 단위 테스트(Vitest) |

## 개발 방식

- 화면은 **① 마크업 + 기능 → ② API 연결** 순서로 구현합니다.
- MSW 목 API 계층이 이 흐름을 뒷받침합니다: 목 데이터로 화면을 완성하고, 이후 실제 API로 스위치합니다.

## 로드맵

- [x] 0. 기반: 프로젝트 셋업, 디자인 토큰, 앱 셸
- [ ] 1. 여행·멤버: 인증, 여행 CRUD, 초대, 역할
- [ ] 2. 일정: 날짜 타임라인, 드래그 정렬
- [ ] 3. 장소: 검색·저장·지도
- [ ] 4. 경비: 지출·분할·정산
- [ ] 5. 협업: 투표, 알림, 실시간
- [ ] 6. 차별화: 오프라인, AI, 다중 통화, 공유
