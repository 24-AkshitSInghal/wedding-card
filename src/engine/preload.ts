/**
 * Later scenes ship with `data-src` so the first impression is not competing for
 * bandwidth. Scenes are filled in just ahead of the guest, and the rest trickle in
 * while the page is idle.
 */
export function createPreloader(root: HTMLElement) {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('.scene'))
  const done = new Set<number>()

  const load = (i: number) => {
    if (done.has(i) || !scenes[i]) return
    done.add(i)
    for (const img of scenes[i].querySelectorAll<HTMLImageElement>('img[data-src]')) {
      img.src = img.dataset.src!
      img.removeAttribute('data-src')
    }
    // Shimmer overlays use the artwork as a CSS mask; it is attached at the same moment.
    for (const el of scenes[i].querySelectorAll<HTMLElement>('[data-mask]')) {
      el.style.setProperty('--mask', `url(${el.dataset.mask})`)
      el.removeAttribute('data-mask')
    }
  }

  let idleQueued = false
  return {
    /** Make sure the scene in view and the next two are loading. */
    around(i: number) {
      for (let k = Math.max(0, i - 1); k <= i + 2; k++) load(k)
    },
    /** Quietly fetch everything else, one scene at a time. */
    idle() {
      if (idleQueued) return
      idleQueued = true
      let i = 0
      const step = () => {
        while (i < scenes.length && done.has(i)) i++
        if (i >= scenes.length) return
        load(i)
        const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
        window.setTimeout(() => ric(step), 450)
      }
      step()
    },
  }
}

/** Resolves once the given images have loaded (or failed), or after `timeout` ms regardless. */
export function whenLoaded(imgs: HTMLImageElement[], timeout: number) {
  const all = Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          }),
    ),
  )
  return Promise.race([all, new Promise((r) => window.setTimeout(r, timeout))])
}

/** Low-power devices get fewer particles and no shimmer overlays. */
export function isLiteDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 3 ||
    !!nav.connection?.saveData
  )
}
