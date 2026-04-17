/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	base: '/old', // Crucial for asset paths in the browser
	build: {
    	outDir: '../../public/old', // Drops the built files into your Nginx root
    	emptyOutDir: true
  	},
	plugins: [react()],
    server: {
        // 2. Change the Port! 
        // If the Root/Landing Page is on 9000, this SPA needs its own port (e.g., 5173) 
        // so the Root can proxy TO it.
        port: 5175,
        strictPort: true,
        
        // 3. HMR Fix
        // This ensures Hot Module Replacement works when you view the app through Port 9000
        hmr: {
            clientPort: 9000
        },

        // 4. API Proxying
        // Since you're running the SPA at /jam, requests to /jam/api need to go to your .NET app.
        proxy: {
            '/api': {
                target: 'http://localhost:9001',
                changeOrigin: true,
            },
        },
    },

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@shared": path.resolve(__dirname, "../../packages/shared/src"),
        },
    }//,
    //test: {
    //    environment: 'jsdom', // Standard for React testing
    //},
})
