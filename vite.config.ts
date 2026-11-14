import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { cards } from './src/cards/index.ts'

/*
 * Which card this build shows: a folder in src/cards/. Set CARD (for example in a Vercel
 * project's Environment Variables) to build another card from the same code, e.g.
 * CARD=second npm run build. Defaults to "primary".
 */
const CARD = (process.env.CARD || 'primary').trim()
const cardDir = fileURLToPath(new URL(`./src/cards/${CARD}/`, import.meta.url))
if (!(CARD in cards) || !existsSync(`${cardDir}index.ts`)) {
  throw new Error(`CARD="${CARD}" is not a card. Cards: ${Object.keys(cards).join(', ')} (see src/cards/index.ts).`)
}

/** The few words of the card the page title and link preview use. */
interface CardMeta {
  bride: { name: string }
  groom: { name: string }
  coupleLead: string
  coupleInvite: string
  siteUrl: string
}

const wedding: CardMeta = cards[CARD as keyof typeof cards]

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** The site's public address, for the link-preview image: the card's siteUrl, else Vercel's. */
function siteBase(wedding: CardMeta) {
  const own = wedding.siteUrl.trim()
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || ''
  return (own || (vercel ? `https://${vercel}` : '')).replace(/\/$/, '')
}

/** Fills the page title and the WhatsApp / social link preview from the card's words. */
function invitationMeta(): Plugin {
  return {
    name: 'invitation-meta',
    transformIndexHtml(html) {
      const names = [wedding.bride.name, wedding.groom.name].map((n) => n.trim()).filter(Boolean).join(' & ')
      const title = names ? `${names} - Wedding Invitation` : 'The Royal Wedding - An Invitation'
      const description = names
        ? `${wedding.coupleLead} ${wedding.coupleInvite}.`
        : 'You are warmly invited to a royal wedding celebration.'
      return html
        .replaceAll('%INVITE_TITLE%', escapeHtml(title))
        .replaceAll('%INVITE_DESCRIPTION%', escapeHtml(description))
        .replaceAll('%INVITE_IMAGE%', escapeHtml(`${siteBase(wedding)}/og-image.jpg`))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), invitationMeta()],
  resolve: {
    alias: { '@card': `${cardDir}index.ts` },
  },
  server: {
    host: true, // Exposes the server to the local network (0.0.0.0)
  },
})
