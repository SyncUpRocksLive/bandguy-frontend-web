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
      // 1. Send /jam traffic to the React App dev server (on 5173)
      '/jam': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true // Crucial for WebRTC signals/WebSockets
      },
      
      // 2. Send /profile traffic to the Profile App dev server (on 5174)
      '/profile': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true
      },

      // 3. Send /api traffic to your .NET API (on 9001)
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
