import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    // Only enable code-inspector in development
    mode === 'development' ? codeInspectorPlugin({
      bundler: 'vite',
      launchType: 'open'
    }) : null,
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
