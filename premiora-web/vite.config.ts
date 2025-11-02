import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas do React em um chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Separar Supabase em um chunk
          'supabase-vendor': ['@supabase/supabase-js'],

          // Separar HCaptcha em um chunk (carregado apenas quando necessário)
          'hcaptcha-vendor': ['@hcaptcha/react-hcaptcha'],

          // Separar componentes de autenticação
          'auth-components': [
            './src/components/auth/ProtectedRoute',
            './src/components/auth/PublicRoute'
          ],

          // Separar componentes de layout
          'layout-components': [
            './src/components/layout/Header',
            './src/components/layout/Sidebar',
            './src/components/layout/Navbar'
          ],

          // Separar componentes de conteúdo
          'content-components': [
            './src/components/content/Feed',
            './src/components/content/ContentCard',
            './src/components/content/UserSuggestions'
          ],

          // Separar componentes de landing page
          'landing-components': [
            './src/components/landing/Header',
            './src/components/landing/Hero',
            './src/components/landing/SocialProof',
            './src/components/landing/HowItWorks',
            './src/components/landing/Features',
            './src/components/landing/Testimonials',
            './src/components/landing/Pricing',
            './src/components/landing/FAQ',
            './src/components/landing/CTA',
            './src/components/landing/Footer'
          ],

          // Separar modais
          'modal-components': [
            './src/components/modals/CreateCommunityModal',
            './src/components/modals/CreateContentModal',
            './src/components/modals/CreatePostModal',
            './src/components/modals/CreateVideoModal',
            './src/components/modals/PostViewModal',
            './src/components/modals/VideoViewModal'
          ],

          // Separar hooks customizados
          'custom-hooks': [
            './src/hooks/useAuth',
            './src/hooks/useFeed',
            './src/hooks/useSearch',
            './src/hooks/useInfiniteScroll'
          ],

          // Separar serviços
          'services': [
            './src/services/authService'
          ],

          // Separar utilitários
          'utils': [
            './src/utils/communityUtils',
            './src/utils/constants',
            './src/utils/supabaseClient'
          ]
        }
      }
    },
    // Aumentar o limite de aviso para 1000 kB para reduzir avisos desnecessários
    chunkSizeWarningLimit: 1000
  }
})
