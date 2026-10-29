export const artUrl = (src: string) => `${import.meta.env.BASE_URL}art/${src}.webp`

/** Stacking order follows depth: far layers sit behind the arch, foreground in front. */
export const zForDepth = (d: number) => 10 + Math.round((d + 1) * 10)

/**
 * Living details: a region of an illustration is overlaid with a clipped copy of the same
 * image that turns on its own pivot (a peacock's head, an elephant's ear). `base` cuts that
 * region out of the main image so the original never peeks out from behind the moving copy.
 */
export interface ArtPart {
  clip: string
  base?: string
  origin: string
  motion: 'head' | 'ear'
}

export const ART_PARTS: Record<string, ArtPart> = {
  peacock_standing: {
    clip: 'polygon(50% 0, 92% 0, 92% 20%, 52% 20%)',
    base: 'polygon(0 0, 50% 0, 52% 20%, 92% 20%, 92% 0, 100% 0, 100% 100%, 0 100%)',
    origin: '64% 20%',
    motion: 'head',
  },
  peacock_lookback: {
    clip: 'polygon(12% 0, 50% 0, 50% 14%, 12% 14%)',
    base: 'polygon(0 0, 12% 0, 12% 14%, 50% 14%, 50% 0, 100% 0, 100% 100%, 0 100%)',
    origin: '30% 14%',
    motion: 'head',
  },
  elephant_royal: {
    clip: 'polygon(61.5% 9%, 74% 9%, 74% 47%, 61.5% 47%)',
    origin: '74% 26%',
    motion: 'ear',
  },
}
