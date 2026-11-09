interface Props {
  text: string
  className?: string
}

/**
 * Renders text with each character in its own span so the timeline can reveal it
 * letter by letter. Words never break internally; lines wrap between words.
 */
export function SplitText({ text, className }: Props) {
  const words = text.split(/(\s+)/)
  // Devanagari letters join into conjuncts and take vowel signs, so they cannot be split
  // into separate boxes; reveal whole words instead.
  if (/[\u0900-\u097F]/.test(text)) {
    return (
      <span className={className}>
        {words.map((w, wi) => (
          <span key={wi} className="ch">
            {/^\s+$/.test(w) ? ' ' : w}
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className={className}>
      {words.map((w, wi) =>
        /^\s+$/.test(w) ? (
          <span key={wi} className="ch">
            {' '}
          </span>
        ) : (
          <span key={wi} className="word">
            {[...w].map((c, ci) => (
              <span key={ci} className="ch">
                {c}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  )
}
