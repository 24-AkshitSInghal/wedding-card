/*
 * Every card this code can build. Add a line here when you add a folder in src/cards/.
 * The build reads the English words from here for the page title and link preview;
 * the card itself is picked with the CARD setting (see vite.config.ts).
 */
import { wedding as primary } from './primary/en.ts'
import { wedding as second } from './second/en.ts'
import { wedding as third } from './third/en.ts'

export const cards = { primary, second, third }
