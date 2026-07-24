# NAN2026 Web Starter

NAN 2026 본선(48시간 빌드) 대응용 범용 웹게임 스타터. Phaser 3 + Vite.
주제가 뭐가 나오든 `src/scenes/GameScene.js`만 갈아끼우면 되도록 구조를 잡아뒀다.

## 구조
- `src/scenes/` — Boot → Preload → Menu → Game 씬 흐름. GameScene이 실제 게임로직 자리.
- `src/ai/AIAgentController.js` — 게임 상태를 넘기면 AI 결정을 받아오는 범용 인터페이스. endpoint 없으면 자동 mock 폴백.
- `src/utils/DebugLogger.js` — 화면 좌상단 오버레이 로그. `` ` `` 키로 토글.

## 로컬 실행
```
npm install
npm run dev
```

## 배포 (GitHub Pages)
1. GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 설정
2. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동 빌드+배포

## AI 백엔드 연결 시 주의 (CORS)
정적 페이지라 Anthropic/OpenAI API를 브라우저에서 직접 호출하면 CORS로 막힐 가능성이 높다.
Cloudflare Workers(무료 티어)로 얇은 프록시를 만들어서 `AIAgentController`의 `endpoint`에
그 프록시 주소를 넣는 걸 권장. 프록시 쪽에서 실제 API 키를 보관하고 요청을 중계한다.

## 48시간 타임어택 체크리스트
- [ ] Cloudflare Workers 프록시 미리 만들어서 테스트 완료해두기
- [ ] `npm run build` → GitHub Pages 배포 리허설 최소 1회
- [ ] GameScene을 통째로 갈아끼워도 Boot/Preload/Menu 흐름은 안 건드리게 유지
