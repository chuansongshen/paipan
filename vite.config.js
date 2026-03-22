import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 通常以仓库子路径托管静态资源，使用相对 base 避免 /assets/* 404。
  base: './',
  plugins: [react()],
});
