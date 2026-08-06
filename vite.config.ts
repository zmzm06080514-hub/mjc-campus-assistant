import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        // 서울시 버스 도착정보 API(ws.bus.go.kr)는 CORS 헤더를 안 줘서
        // 브라우저에서 직접 fetch가 불가능하다. 개발 서버가 대신 중계해준다.
        // (프로덕션 배포 시에는 이 프록시가 없으므로 별도 서버리스/백엔드 프록시가 필요하다.)
        '/api/seoul-bus': {
          target: 'http://ws.bus.go.kr/api/rest',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/seoul-bus/, ''),
        },
      },
    },
  };
});
