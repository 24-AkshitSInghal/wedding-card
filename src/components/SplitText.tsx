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
