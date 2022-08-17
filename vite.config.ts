/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: { https: true },
  plugins: [mkcert(), VitePWA()]
})
