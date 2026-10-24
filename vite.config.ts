import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Use /nexus-spectacle/ base for GitHub Pages deployment, / for everything else
const isGithubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGithubPages ? '/nexus-spectacle/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Phase 7: Bundle optimization with manual code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js bundle (separate chunk for heavy 3D library)
          three: ['three'],
          // React Three Fiber
          r3f: ['@react-three/fiber', '@react-three/drei'],
          // Vendor libraries (React, Radix UI, etc.)
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI components
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
    // Increase chunk size warning limit to avoid noise from optimized splits
    chunkSizeWarningLimit: 1000,
  },
})