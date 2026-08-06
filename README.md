dlwp # 명지전문대 실시간 개인비서 (MJC Campus Assistant)

명지전문대 학생을 위한 실시간 버스 도착정보, 주변 맛집 핀맵, 강의 일정, 과제 D-Day, 밥 매칭, 익명 커뮤니티, 실시간 채팅을 한 곳에 모은 캠퍼스 어시스턴트입니다.

## 사용 언어 / 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 언어 | TypeScript, JavaScript (크롤러 스크립트), HTML, CSS |
| 프론트엔드 프레임워크 | React 19 + Vite 6 |
| 스타일링 | Tailwind CSS 4 |
| 아이콘 | lucide-react |
| 실시간 백엔드 | Firebase (Firestore + Authentication) |
| 크롤링 | Node.js + cheerio (HTML 파싱) |
| 자동화 | GitHub Actions (cron 스케줄러) |

## 연동된 외부 API / 서비스

1. **Firebase Firestore + Authentication (익명 로그인)** — 실시간 1:1 채팅 및 밥매칭 그룹채팅.
   프로젝트: `mjc-campus-assistant` / 리전: `asia-northeast3 (Seoul)`.
2. **공공데이터포털(data.go.kr) — 서울특별시_버스도착정보조회 서비스** — 버스 실시간 도착정보 (`src/data/liveBus.ts`).
   ⚠️ 승인은 완료됐지만 실제 서비스 서버 반영 대기 중이라, 현재는 노선별 시뮬레이션 값으로 폴백 중.
3. **명지전문대학교 공지사항 게시판 크롤링** (`https://www.mjc.ac.kr/bbs/data/list.do?menu_idx=66`) — 공식 API가 아닌 자체 HTML 크롤러(`scripts/crawlNotices.ts`)로 수집, GitHub Actions가 매일 KST 09:00에 자동 실행하여 `public/notices.json`에 반영.

### 프로젝트에 있지만 실제로는 연결되지 않은 것
- `@google/genai` (Gemini API), `motion` — package.json에는 남아있지만 소스 코드에서 실제로 import/사용되지 않습니다 (AI Studio 템플릿에서 생성 당시 기본 포함된 잔여 의존성).

## 로컬 실행

**사전 준비:** Node.js 18+

1. 의존성 설치
   ```bash
   npm install
   ```
2. `.env.example`을 참고해 `.env.local`을 만들고 값을 채웁니다.
   - `VITE_SEOUL_BUS_SERVICE_KEY`: data.go.kr 서울특별시 버스도착정보 인증키 (선택 — 없으면 시뮬레이션 값 사용)
   - `VITE_FIREBASE_*`: Firebase 프로젝트 설정 (선택 — 없으면 실시간 채팅 비활성화)
3. 개발 서버 실행
   ```bash
   npm run dev
   ```
4. (선택) 공지사항 크롤러를 수동 실행
   ```bash
   npm run crawl:notices
   ```

## 배포 참고

Firestore 보안 규칙은 `firestore.rules`에 있으며, Firebase 콘솔의 Firestore > 규칙 탭에 붙여넣어 게시해야 합니다.
