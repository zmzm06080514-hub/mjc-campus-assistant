# 명지전문대 실시간 개인비서 (MJC Campus Assistant)

명지전문대 학생을 위한 캠퍼스 어시스턴트 웹앱이다. 실시간 버스 도착정보, 주변 맛집 지도, 강의 일정, 과제 D-Day, 밥 매칭, 익명 커뮤니티, 실시간 채팅 기능을 제공한다.

배포 사이트: https://darling-lily-5437fc.netlify.app/

화면설계서 (유저플로우 · 시스템플로우): [docs/MJC_Mate_화면설계서_유저플로우_시스템플로우.pdf](docs/MJC_Mate_화면설계서_유저플로우_시스템플로우.pdf)

## 팀 소개

팀명: ㅈㅇㅇ

| 이름 | 역할 |
|---|---|
| 박상후 | 개발 |
| 오세찬 | 기능명세서 |
| 김은진 | 기획서 |

## 사용 언어

- TypeScript
- JavaScript (크롤러 스크립트)
- HTML
- CSS

## 사용 기술 / 프레임워크

- React 19
- Vite 6
- Tailwind CSS 4
- lucide-react (아이콘)
- Node.js, cheerio (공지사항 크롤러)
- GitHub Actions (크롤러 자동 실행 스케줄러)

## 사용한 스킬

- Git, GitHub을 이용한 버전관리 및 협업
- GitHub Actions로 크롤러 정기 실행 자동화 (cron 스케줄링)
- Firebase Firestore 데이터 모델링 및 보안 규칙(firestore.rules) 작성
- 실시간 데이터 구독(Firestore onSnapshot)을 이용한 채팅 기능 구현
- HTML 파싱 기반 웹 크롤링 (cheerio)
- REST API 연동 (공공데이터포털, 카카오맵)
- Tailwind CSS를 이용한 반응형 UI 퍼블리싱
- TypeScript 타입 설계

## npm으로 설치한 패키지

- react, react-dom: 화면 UI 렌더링
- vite, @vitejs/plugin-react: 개발 서버 및 빌드 도구
- typescript: 타입 체크
- tailwindcss, @tailwindcss/vite, autoprefixer: 스타일링
- lucide-react: 아이콘
- firebase: 실시간 채팅(Firestore, Authentication)
- cheerio: 공지사항 크롤러의 HTML 파싱
- tsx: 크롤러 스크립트 실행
- dotenv: 환경변수 로드
- @types/node: Node.js 타입 정의

## 사용한 API 및 외부 서비스

### Firebase (Firestore, Authentication)
실시간 1:1 채팅과 밥매칭 그룹채팅에 사용한다. 브라우저마다 익명 로그인으로 사용자를 구분하고, 대화방과 메시지는 Firestore에 저장한다.
프로젝트명: mjc-campus-assistant, 리전: asia-northeast3 (Seoul)

### 공공데이터포털 - 서울특별시 버스도착정보조회 서비스
버스 실시간 도착정보 조회에 사용한다. 인증키는 발급받았고 승인도 완료됐으나, 실제 서비스 서버 반영이 아직 안 되어 있어 현재는 노선별 예상 도착시간을 시뮬레이션 값으로 대체해 보여주고 있다.

### 카카오맵 (Kakao Maps JavaScript SDK)
주변 맛집 지도 표시에 사용한다.

### 명지전문대학교 공지사항 게시판 크롤링
공식 API가 아니라 학교 홈페이지(mjc.ac.kr) 공지사항 게시판을 직접 파싱하는 자체 크롤러다. GitHub Actions로 매일 한국시간 오전 9시에 자동 실행되어 새 공지를 앱에 반영한다.

### 프로젝트에 포함되어 있지만 실제로 사용하지 않는 것
@google/genai(Gemini API), motion, express는 AI Studio 템플릿 생성 시 기본 포함된 의존성으로, 실제 코드에서는 사용하지 않는다.

## 로컬 실행 방법

사전 준비: Node.js 18 이상

1. 의존성 설치
```
npm install
```

2. .env.example을 참고해 .env.local 파일을 만들고 값을 채운다
- VITE_SEOUL_BUS_SERVICE_KEY: 공공데이터포털 서울시 버스도착정보 인증키 (없어도 시뮬레이션 값으로 동작)
- VITE_KAKAO_MAP_APP_KEY: 카카오맵 JavaScript 키 (없으면 지도 기능 비활성화)
- VITE_FIREBASE_*: Firebase 프로젝트 설정 (없으면 실시간 채팅 비활성화)

3. 개발 서버 실행
```
npm run dev
```

4. 공지사항 크롤러 수동 실행 (선택)
```
npm run crawl:notices
```

## 배포 참고

Firestore 보안 규칙은 firestore.rules 파일에 있다. Firebase 콘솔의 Firestore > 규칙 탭에 내용을 붙여넣고 게시해야 실제로 적용된다.
