import gsap from 'gsap'

const cutLines = [
  [[0, 0], [22, 0], [55, 0], [79, 0], [100, 0]],
  [[0, 48], [24, 55], [53, 39], [80, 54], [100, 59]],
  [[0, 100], [26, 100], [50, 100], [76, 100], [100, 100]],
] as const

function makeFragments(artwork: HTMLImageElement) {
  const layer = document.createElement('div')
  layer.className = 'intro-fragments'
  const pieces: { element: HTMLElement; x: number; y: number; turn: number }[] = []
  const size = artwork.getBoundingClientRect()
  const reach = Math.max(94, size.width * .92)

  for (let row = 0; row < cutLines.length - 1; row += 1) {
    for (let column = 0; column < cutLines[row].length - 1; column += 1) {
      const top = cutLines[row]
      const bottom = cutLines[row + 1]
      const triangles = [
        [top[column], top[column + 1], bottom[column + 1]],
        [top[column], bottom[column + 1], bottom[column]],
      ]
      for (const triangle of triangles) {
        const element = document.createElement('div')
        element.className = 'intro-fragment'
        const x = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3
        const y = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
        element.style.clipPath = `polygon(${triangle.map(([left, top]) => `${left}% ${top}%`).join(', ')})`
        element.style.transformOrigin = `${x}% ${y}%`
        element.style.backgroundImage = `url("${artwork.currentSrc}")`
        layer.append(element)
        pieces.push({
          element,
          x: (x - 50) / 50 * reach * 1.45,
          y: (y - 50) / 50 * reach + 20,
          turn: (pieces.length % 2 === 0 ? 1 : -1) * (30 + column * 14 + row * 9),
        })
      }
    }
  }

  return { layer, pieces }
}

export function animatePreloader(root: HTMLElement) {
  const page = document.documentElement
  if (!page.hasAttribute('data-preloading')) return

  const finish = () => document.dispatchEvent(new Event('portfolio:preloaded'))
  const sheet = document.querySelector<HTMLElement>('.intro-sheet')
  const mark = document.querySelector<HTMLElement>('.intro-brand')
  const artwork = mark?.querySelector('img')
  if (!sheet || !mark || !artwork || scrollY > 40) {
    finish()
    return
  }

  let animation: gsap.core.Timeline | undefined
  let fragments: HTMLElement | undefined
  let disposed = false

  const reveal = () => {
    if (disposed || animation || !page.hasAttribute('data-preloading')) return
    window.clearTimeout(loadDeadline)

    const { layer, pieces } = makeFragments(artwork)
    fragments = layer
    mark.append(layer)

    const swollen = { scaleX: 1.39, scaleY: 1.49 }
    const burst = .43
    const end = () => {
      layer.remove()
      finish()
    }
    animation = gsap.timeline({ onComplete: end })
      .to(artwork, { ...swollen, duration: burst, ease: 'power2.in' })
      .set(artwork, { opacity: 0 }, burst)
      .set(layer, { ...swollen, visibility: 'visible' }, burst)
      .to(pieces.map(piece => piece.element), {
        x: index => pieces[index].x,
        y: index => pieces[index].y,
        rotation: index => pieces[index].turn,
        scale: .26, duration: .6, ease: 'power3.out',
      }, burst)
      .to(pieces.map(piece => piece.element), { opacity: 0, duration: .43, ease: 'power2.in' }, burst + .15)
      .from(root.querySelectorAll('.hero-copy, .orbit-panel'), {
        y: 14, opacity: 0, duration: .46, stagger: .07, ease: 'power2.out', clearProps: 'transform,opacity',
      }, burst + .16)

    if (CSS.supports('mask-image', 'radial-gradient(circle, transparent, black)')) {
      animation.set(sheet, { attr: { 'data-burst': '' } }, burst)
        .to(sheet, { '--intro-opening': `${Math.ceil(Math.hypot(innerWidth, innerHeight))}px`, duration: .72, ease: 'power2.out' }, burst)
    } else {
      animation.to(sheet, { yPercent: -100, duration: .72, ease: 'power3.inOut' }, burst)
    }
  }

  const inflation = artwork.getAnimations()[0]?.finished.catch(() => undefined)
  const decoded = artwork.decode().catch(() => undefined)
  const loadDeadline = window.setTimeout(reveal, 1600)
  void Promise.all([inflation, decoded, document.fonts.ready]).then(reveal, reveal)

  return () => {
    disposed = true
    window.clearTimeout(loadDeadline)
    animation?.revert()
    fragments?.remove()
    finish()
  }
}
