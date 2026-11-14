import type { CSSProperties } from 'react'

interface Props {
  text: string
  className?: string
  /** Index of the first character, for effects that travel along a line (`--i` on each). */
  start?: number
}

const at = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Renders text with each character in its own span so the timeline can reveal it
 * letter by letter. Words never break internally; lines wrap between words.
 */
export function SplitText({ text, className, start = 0 }: Props) {
  const words = text.split(/(\s+)/)
  // Devanagari letters join into conjuncts and take vowel signs, so they cannot be split
  // into separate boxes; reveal whole words instead.
  if (/[\u0900-\u097F]/.test(text)) {
    return (
      <span className={className}>
        {words.map((w, wi) => (
          <span key={wi} className="ch" style={at(start + wi)}>
            {/^\s+$/.test(w) ? ' ' : w}
          </span>
        ))}
      </span>
    )
  }
  let n = start
  return (
    <span className={className}>
      {words.map((w, wi) =>
        /^\s+$/.test(w) ? (
          <span key={wi} className="ch" style={at(n++)}>
            {' '}
          </span>
        ) : (
          <span key={wi} className="word">
            {[...w].map((c, ci) => (
              <span key={ci} className="ch" style={at(n++)}>
                {c}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  )
}
