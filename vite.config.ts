import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Tell Vite the "Source of Truth" for the landing page is the /public folder
  root: 'public',
  
  server: {
	host: true,
    port: 9000,
    strictPort: true,
	allowedHosts: [
      'syncup.local', // local dev, using host file
      'syncup.rocks', // Add your production/staging domain too while you're at it!
      '.local'        // Or use a wildcard for any .local address
    ],
    proxy: {
      '/jam': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true // Crucial for WebRTC signals/WebSockets
      },      
      '/mixingroom': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true
      },
      '/profile': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        ws: true
      },
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true,
        secure: false
      }
    }
  },

  resolve: {
    alias: {
      // Allows your static scripts to reference shared logic if needed
      '@shared': path.resolve(__dirname, './packages/shared/src'),
    }
  }
});
