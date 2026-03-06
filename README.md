# GrowTechStack Frontend

기술 블로그 RSS 피드 큐레이션 서비스의 React 프론트엔드입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript 5.9 |
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Routing | React Router v7 |
| HTTP | Axios |

## 주요 기능

- 기술 블로그 피드 목록 조회 (태그 필터, 사이트 필터, 검색)
- 콘텐츠 상세 페이지 (AI 요약 표시)
- 관리자 페이지 (RSS 출처 관리, 수집 로그)
- 읽음 상태 관리 (localStorage)

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | API 서버 기본 URL | `https://growtechstack.com/api` |

> 로컬 개발 시 `/api` 요청은 `vite.config.ts` 프록시 설정에 의해 `localhost:8080` (Gateway)으로 전달됩니다.

## 프로젝트 구조

```
src/
├── api/          # API 호출 함수 (axios.ts, contents.ts, rss.ts)
├── components/   # 공통 컴포넌트 (Navbar, ContentCard, SourceSidebar)
├── pages/        # 페이지 컴포넌트 (FeedPage, ContentDetailPage, AdminPage)
├── store/        # Zustand 스토어
└── types/        # TypeScript 타입 정의
```

## 배포

`main` 브랜치 push → GitHub Actions → Vercel 자동 배포
