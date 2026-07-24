// 48시간 해커톤용 디버그 로거 — 화면 오버레이 + 콘솔 동시 출력
// 사용법: import { log } from '../utils/DebugLogger.js'; log('AI', '응답 파싱 완료', data);

const LOG_LIMIT = 12;
let overlayEl = null;
const lines = [];

function ensureOverlay() {
  if (overlayEl) return overlayEl;
  overlayEl = document.createElement('div');
  overlayEl.id = 'debug-overlay';
  overlayEl.style.cssText = [
    'position:fixed', 'left:4px', 'top:4px', 'max-width:40%',
    'font:11px/1.4 monospace', 'color:#0f0', 'background:rgba(0,0,0,0.6)',
    'padding:6px 8px', 'z-index:9999', 'pointer-events:none',
    'white-space:pre-wrap', 'display:none'
  ].join(';');
  document.body.appendChild(overlayEl);
  return overlayEl;
}

export function setDebugVisible(visible) {
  ensureOverlay().style.display = visible ? 'block' : 'none';
}

export function log(tag, message, data) {
  const time = new Date().toISOString().slice(11, 19);
  const text = `[${time}][${tag}] ${message}` + (data !== undefined ? ' ' + JSON.stringify(data) : '');
  console.log(text);
  lines.push(text);
  if (lines.length > LOG_LIMIT) lines.shift();
  ensureOverlay().textContent = lines.join('\n');
}

// 백틱(`) 키로 오버레이 토글 — 발표/데모 중엔 숨기고 개발 중엔 켜서 씀
window.addEventListener('keydown', (e) => {
  if (e.key === '`') {
    const el = ensureOverlay();
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
});
