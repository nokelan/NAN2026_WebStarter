// 테마 무관 범용 AI 에이전트 연동 모듈.
// 게임 로직은 이 클래스의 decide()만 호출하면 되고, 실제 프롬프트/파싱/백엔드 교체는 여기서만 관리한다.
//
// 중요(CORS): 정적 GitHub Pages 배포는 서버가 없어서, Anthropic/OpenAI API를 브라우저에서 직접
// fetch하면 CORS로 막히는 경우가 대부분이다. 본선 전에 아래 둘 중 하나를 미리 준비해둘 것:
//   (a) Cloudflare Workers(무료 티어)로 얇은 프록시 하나 배포 → endpoint를 그 프록시 URL로 지정
//   (b) CORS를 허용하는 프로바이더/설정 사용
// endpoint가 비어있거나 요청이 실패하면 자동으로 mock 모드로 폴백해서, AI 백엔드 없이도
// 게임 자체는 항상 데모 가능한 상태를 유지한다.

import { log } from '../utils/DebugLogger.js';

export class AIAgentController {
  /**
   * @param {object} opts
   * @param {string} [opts.endpoint] - 프록시/AI API 엔드포인트. 비어있으면 mock 모드로 동작.
   * @param {string} [opts.apiKey] - 헤더에 실어보낼 키(프록시 쪽에서 실제 키로 치환하는 걸 권장).
   * @param {(context: object) => object} [opts.mockResponder] - endpoint 없을 때 쓸 목업 응답 생성기.
   */
  constructor(opts = {}) {
    this.endpoint = opts.endpoint || '';
    this.apiKey = opts.apiKey || '';
    this.mockResponder = opts.mockResponder || defaultMockResponder;
    this.enabled = true;
  }

  /**
   * 게임 상태를 넘기면 AI가 결정한 액션(JSON)을 돌려준다.
   * @param {object} context - 예: { npcName, playerHp, recentEvents: [...], instruction: '...' }
   * @returns {Promise<object>} 파싱된 액션 객체. 실패 시 mock 응답으로 폴백.
   */
  async decide(context) {
    if (!this.enabled) return this.mockResponder(context);

    if (!this.endpoint) {
      log('AI', 'endpoint 미설정 — mock 응답 사용', context);
      return this.mockResponder(context);
    }

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({ context })
      });
      if (!res.ok) throw new Error(`AI API ${res.status}`);
      const data = await res.json();
      log('AI', '응답 수신', data);
      return data;
    } catch (err) {
      log('AI', 'API 호출 실패 — mock 응답으로 폴백: ' + err.message);
      return this.mockResponder(context);
    }
  }
}

// 주제가 정해지기 전까지는 이 함수만 게임별로 바꿔가며 테스트 가능.
// 실제 게임 로직에서 기대하는 응답 shape을 여기서 미리 흉내내둔다.
function defaultMockResponder(context) {
  return {
    action: 'idle',
    dialogue: '(mock) 아직 AI 백엔드가 연결되지 않았습니다.',
    context
  };
}
