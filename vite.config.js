import { defineConfig } from 'vite';

// base '/nan2026-web-starter/' 부분은 실제 저장소명에 맞춰 수정 (GitHub Pages 서브경로 대응)
export default defineConfig({
  base: './',
  server: {
    port: 5173
  }
});
