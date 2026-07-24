# NAN2026 Web Starter

NAN 2026(NHN Game × AI Hackathon) 본선 대응용 범용 웹게임 스타터.
다른 컴퓨터에서 이어서 작업할 때를 대비해 배경/구조/재개 방법을 자세히 적어둔다.

## 배경 (왜 이 프로젝트가 존재하는가)

- **대회**: NAN 2026 (Next AI Network), 주최 NHN. 게임 프로토타입 + AI 활용 기술을 심사하는 채용연계형 해커톤.
- **일정**: 예선 접수 ~**2026-08-10**(완성 게임+영상+PDF 2종 제출), 서류 통과 시 본선 **2026-09-04~09-06**(NHN 판교 PlayMuseum).
- **제출 형식 제약**: 웹 브라우저 실행(GitHub Pages 등) 또는 Android APK만 허용, **PC .exe는 보안상 제출 불가**.
- **예선 전략**: 기존에 만들어둔 5개 Godot 게임 중 유일하게 Android 빌드가 이미 돼있는 **청기백기(BlueFlagWhiteFlag)**를 예선 제출작으로 사용하기로 함(이 저장소와는 별개 프로젝트).
- **본선 전략**: 본선은 (아마도) 현장에서 주제가 공개되고 제한시간 내 개발하는 방식으로 추정됨(공식 확정 문서 없음, 선정 통보 시 재확인 필요). Godot 4.6 + C#(Mono) 조합은 **웹(HTML5) export를 지원하지 않아서**(2026-07 기준, Godot 공식 미지원) 기존 Godot/C# 자산을 본선에 그대로 못 쓴다 → **이 저장소가 본선 전용 새 스타터**로, Phaser 3(JS 기반, 웹네이티브)로 만듦. 주제가 뭐든 빠르게 얹을 수 있게 뼈대만 미리 준비한 상태.

## 새 컴퓨터에서 이어서 작업하기

```bash
git clone git@github.com:nokelan/NAN2026_WebStarter.git
cd NAN2026_WebStarter
npm install
npm run dev
```
`npm run dev` 실행 후 브라우저에서 `http://localhost:5173` 접속하면 바로 확인 가능.

**GitHub push가 안 되면(Permission denied)**: 그 컴퓨터의 SSH 공개키를 GitHub 계정(nokelan)에 등록 안 한 것.
1. 없으면 키 생성: `ssh-keygen -t ed25519` (엔터만 눌러 기본값 사용)
2. `cat ~/.ssh/id_ed25519.pub` 출력값을 https://github.com/settings/keys 에서 "New SSH key"로 등록
3. `ssh -T git@github.com` 으로 "Hi nokelan!" 뜨면 정상, 이후 `git push` 가능

## 구조

```
src/
├── main.js              Phaser 게임 설정(해상도 960x540, Arcade Physics)
├── scenes/
│   ├── BootScene.js      부팅만 하고 바로 Preload로 전환
│   ├── PreloadScene.js   에셋 로딩(지금은 placeholder, 실제 에셋 로드 여기 추가)
│   ├── MenuScene.js      타이틀 화면
│   └── GameScene.js      실제 게임로직 — 주제 정해지면 이 파일(또는 이 파일이 부르는 하위 모듈)만 갈아끼우면 됨
├── ai/
│   └── AIAgentController.js   게임상태→AI판단 범용 인터페이스. endpoint 미설정 시 자동 mock 응답으로 폴백(백엔드 없어도 게임 데모는 항상 가능)
└── utils/
    └── DebugLogger.js    화면 좌상단 오버레이 로그. 백틱(`) 키로 토글
```

`GameScene.js`에 이미 "3초마다 AI에게 NPC 행동을 물어보는" 최소 예시(`askAgentForNpcAction()`)가 들어있음 — 이 패턴(게임 상태를 만들어서 `agent.decide()`에 넘기고, 결과를 게임에 반영)을 실제 주제에 맞게 확장하면 됨.

## 배포 (GitHub Pages) — 이미 세팅 완료, 확인만 하면 됨

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드+배포한다.
현재 라이브 주소: **https://nokelan.github.io/NAN2026_WebStarter/**

저장소 Settings → Pages → Source가 "GitHub Actions"로 설정돼 있어야 동작(이미 설정 완료, 다른 계정/새 저장소로 옮기면 다시 확인 필요).

## AI 백엔드 연결 시 주의 (CORS) — 아직 미구현

정적 페이지(GitHub Pages)라서 서버가 없다. Anthropic/OpenAI API를 브라우저 JS에서 직접 fetch로 호출하면
대부분 CORS로 막힌다. 아직 실제로 구현은 안 했고, 권장 방향만 정리:

1. **Cloudflare Workers**(무료 티어)로 아주 얇은 프록시 하나 배포 — 브라우저 → Workers → 실제 AI API로 중계, API 키는 Workers 쪽에만 보관
2. `AIAgentController` 생성 시 `endpoint`에 그 Workers URL을 넣으면 끝 (코드 수정 불필요, 이미 그 구조로 짜여있음)
3. 본선 전에 미리 만들어서 최소 1회 테스트 완료해두는 걸 강력 권장 — 당일 CORS 디버깅으로 시간 날리면 안 됨

## 현재 상태 / 다음 할 일

**완료**:
- [x] Phaser+Vite 프로젝트 뼈대, 씬 구조
- [x] AI 에이전트 연동 인터페이스(mock 폴백 포함)
- [x] GitHub 저장소 생성 + GitHub Pages 자동배포 확인(빌드/배포 라이브 테스트 완료)

**미완료**:
- [ ] Cloudflare Workers AI 프록시 실제 구축 및 테스트
- [ ] 실제 게임 에셋 준비(현재 전부 도형 placeholder)
- [ ] 예선 제출물 5종(청기백기 쪽 별도 작업 — 이 저장소와 무관)
- [ ] 신청서 제출(2026-08-10까지)
- [ ] 본선 정확한 룰 확인(예선작과 다른 걸 내도 되는지, 정말 현장에서 48시간 신규개발인지) — 선정 통보 시 NHN에 문의 필요

## 48시간 타임어택 당일 체크리스트
- [ ] Cloudflare Workers 프록시 미리 만들어서 테스트 완료해두기
- [ ] `npm run build` → GitHub Pages 배포 리허설 최소 1회(이미 했지만 새 컴퓨터/브랜치 기준으로 재확인 권장)
- [ ] GameScene을 통째로 갈아끼워도 Boot/Preload/Menu 흐름은 안 건드리게 유지
- [ ] 발표는 자유형식(PPT/데모) 허용 — 미리 발표자료 템플릿 준비해두면 시간 절약
