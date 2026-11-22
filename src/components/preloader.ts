import gsap from 'gsap'
import type { InflatedLogo } from './inflatedLogo'

const WEBGL_DEADLINE = 2.2
const BURST_AT = 5.1
const FINISH_AT = 6.25

interface IntroScene {
  timeline: gsap.core.Timeline
  render?: (seconds: number) => void
  dispose: () => void
}

const cutLines = [
  [[0, 0], [22, 0], [55, 0], [79, 0], [100, 0]],
  [[0, 48], [24, 55], [53, 39], [80, 54], [100, 59]],
  [[0, 100], [26, 100], [50, 100], [76, 100], [100, 100]],
] as const

function makeFragments(artwork: HTMLImageElement) {
  const layer = document.createElement('div')
  layer.className = 'intro-fragments'
  const pieces: { element: HTMLElement; x: number; y: number; turn: number }[] = []
  const reach = Math.max(94, artwork.clientWidth * .92)

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

function makeTimeline(root: HTMLElement, sheet: HTMLElement) {
  const timeline = gsap.timeline({ paused: true }).from(root.querySelectorAll('.hero-copy, .orbit-panel'), {
    y: 14, opacity: 0, duration: .46, stagger: .07, ease: 'power2.out', clearProps: 'transform,opacity',
  }, BURST_AT + .16)

  if (CSS.supports('mask-image', 'radial-gradient(circle, transparent, black)')) {
    timeline.set(sheet, { attr: { 'data-burst': '' } }, BURST_AT)
      .to(sheet, { '--intro-opening': `${Math.ceil(Math.hypot(innerWidth, innerHeight))}px`, duration: .78, ease: 'power2.out' }, BURST_AT)
  } else {
    timeline.to(sheet, { yPercent: -100, duration: .78, ease: 'power3.inOut' }, BURST_AT)
  }
  return timeline
}

function animateFallback(timeline: gsap.core.Timeline, mark: HTMLElement, artwork: HTMLImageElement, started: number): IntroScene {
  const { layer, pieces } = makeFragments(artwork)
  mark.append(layer)

  const swellingTime = BURST_AT - started
  const swollen = { scaleX: 1.39, scaleY: 1.49 }
  const fragments = pieces.map(piece => piece.element)
  timeline
    .fromTo(artwork, { scaleX: .48, scaleY: .36 }, { scaleX: 1, scaleY: 1, duration: swellingTime * .8, ease: 'sine.out' }, started)
    .to(artwork, { ...swollen, duration: swellingTime * .2, ease: 'power2.in' }, started + swellingTime * .8)
    .set(artwork, { opacity: 0 }, BURST_AT)
    .set(layer, { ...swollen, visibility: 'visible' }, BURST_AT)
    .to(fragments, {
      x: index => pieces[index].x,
      y: index => pieces[index].y,
      rotation: index => pieces[index].turn,
      scale: .26, duration: .92, ease: 'power3.out',
    }, BURST_AT)
    .to(fragments, { opacity: 0, duration: .64, ease: 'power2.in' }, BURST_AT + .22)

  return { timeline, dispose: () => layer.remove() }
}

function animateWebGL(timeline: gsap.core.Timeline, logo: InflatedLogo, started: number): IntroScene {
  const swellingTime = BURST_AT - started
  timeline
    .to(logo.state, { pressure: .8, duration: swellingTime * .82, ease: 'sine.out' }, started)
    .to(logo.state, { pressure: 1, duration: swellingTime * .18, ease: 'power2.in' }, started + swellingTime * .82)
    .to(logo.state, { burst: logo.burstEnd, duration: FINISH_AT - BURST_AT, ease: 'none' }, BURST_AT)

  return { timeline, render: seconds => logo.render(Math.max(0, seconds - started)), dispose: () => logo.dispose() }
}

export function animatePreloader(root: HTMLElement) {
  const page = document.documentElement
  if (!page.hasAttribute('data-preloading')) return

  const finish = () => document.dispatchEvent(new Event('portfolio:preloaded'))
  const intro = document.querySelector<HTMLElement>('.intro')
  const sheet = intro?.querySelector<HTMLElement>('.intro-sheet')
  const mark = intro?.querySelector<HTMLElement>('.intro-brand')
  const artwork = mark?.querySelector('img')
  if (!intro || !sheet || !mark || !artwork || scrollY > 40) {
    finish()
    return
  }

  const opened = Number(intro.dataset.started ?? performance.now())
  const elapsed = () => (performance.now() - opened) / 1000
  let waitingForWebGL = true
  let stopped = false
  let scene: IntroScene | undefined
  let frame = 0
  let lastRender = -Infinity

  const clearScene = () => {
    scene?.timeline.revert()
    scene?.dispose()
    scene = undefined
    sheet.removeAttribute('data-burst')
    sheet.style.removeProperty('--intro-opening')
  }

  const frameIntro = (now: number) => {
    const seconds = (now - opened) / 1000
    if (seconds >= FINISH_AT) {
      finish()
      return
    }

    // The opening follows wall time even if a WebGL frame takes longer on a slow GPU.
    scene?.timeline.totalTime(Math.max(0, seconds), true)
    if (scene?.render && now - lastRender >= 1000 / 30 - 2) {
      lastRender = now
      try {
        scene.render(seconds)
      } catch {
        useFallback()
      }
    }
    if (!stopped) frame = requestAnimationFrame(frameIntro)
  }

  const startFrame = () => {
    if (!frame) frame = requestAnimationFrame(frameIntro)
  }

  const useFallback = () => {
    if (stopped || intro.dataset.mode === 'fallback') return
    waitingForWebGL = false
    window.clearTimeout(deadline)
    clearScene()
    const started = Math.max(0, Math.min(elapsed(), BURST_AT - .75))
    scene = animateFallback(makeTimeline(root, sheet), mark, artwork, started)
    intro.dataset.mode = 'fallback'
    scene.timeline.totalTime(Math.max(0, elapsed()), true)
    startFrame()
  }

  const stop = () => {
    stopped = true
    window.clearTimeout(deadline)
    cancelAnimationFrame(frame)
    clearScene()
    delete intro.dataset.mode
  }

  const deadline = window.setTimeout(useFallback, Math.max(0, (WEBGL_DEADLINE - elapsed()) * 1000))
  document.addEventListener('portfolio:preloaded', stop, { once: true })

  if (typeof WebGL2RenderingContext === 'undefined') {
    useFallback()
  } else {
    void Promise.all([import('./inflatedLogo'), artwork.decode()]).then(([{ createInflatedLogo }]) => {
      if (stopped || !waitingForWebGL) return
      if (elapsed() >= WEBGL_DEADLINE) {
        useFallback()
        return
      }
      const logo = createInflatedLogo(artwork, intro, useFallback)
      if (elapsed() >= WEBGL_DEADLINE) {
        logo.dispose()
        useFallback()
        return
      }
      waitingForWebGL = false
      window.clearTimeout(deadline)
      scene = animateWebGL(makeTimeline(root, sheet), logo, Math.min(elapsed(), BURST_AT - .75))
      intro.dataset.mode = 'webgl'
      startFrame()
    }).catch(useFallback)
  }

  return () => {
    document.removeEventListener('portfolio:preloaded', stop)
    if (!stopped) {
      stop()
      finish()
    }
  }
}
