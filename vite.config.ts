import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { wedding } from './src/config/wedding.ts'

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** Fills the page title and the WhatsApp / social link preview from src/config/wedding.ts. */
function invitationMeta(): Plugin {
  return {
    name: 'invitation-meta',
    transformIndexHtml(html) {
      const names = [wedding.bride.name, wedding.groom.name].map((n) => n.trim()).filter(Boolean).join(' & ')
      const title = names ? `${names} - Wedding Invitation` : 'The Royal Wedding - An Invitation'
      const description = names
        ? `${wedding.coupleLead} ${wedding.coupleInvite}.`
        : 'You are warmly invited to a royal wedding celebration.'
      const base = wedding.siteUrl.trim().replace(/\/$/, '')
      return html
        .replaceAll('%INVITE_TITLE%', escapeHtml(title))
        .replaceAll('%INVITE_DESCRIPTION%', escapeHtml(description))
        .replaceAll('%INVITE_IMAGE%', escapeHtml(`${base}/og-image.jpg`))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), invitationMeta()],
  server: {
    host: true, // Exposes the server to the local network (0.0.0.0)
  },
  // Lets a temporary Cloudflare tunnel (https://*.trycloudflare.com) serve the built site.
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
})
