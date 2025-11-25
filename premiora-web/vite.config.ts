import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Otimizações para desenvolvimento
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    },
    // Prevenir problemas de cache em desenvolvimento
    fs: {
      strict: true
    }
  },
  // Garantir que mudanças sejam refletidas imediatamente
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas do React em um chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Separar Supabase em um chunk
          'supabase-vendor': ['@supabase/supabase-js'],

          // Separar HCaptcha em um chunk (carregado apenas quando necessário)
          'hcaptcha-vendor': ['@hcaptcha/react-hcaptcha']
        }
      }
    },
    // Aumentar o limite de aviso para 1000 kB para reduzir avisos desnecessários
    chunkSizeWarningLimit: 1000
  }
})
