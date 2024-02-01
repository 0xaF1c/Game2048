import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    VitePWA({
      manifest: {
        name: 'Play2048',
        short_name: '2048',
        description: 'no ads 2048',
        theme_color: '#ECC400',
        icons: [
          {
            src: '/public/favicon.png',
            sizes: '700x700',
            type: 'image/png'
          }
        ]
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}']
      }
    })
  ]
})