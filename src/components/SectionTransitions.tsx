import { useId } from 'react'
import gsap from 'gsap'
import { ProjectArtwork } from './Artwork'
import { createSectionDisplacement } from './sectionDisplacement'

const effects = {
  inicio: 'morph',
  proyectos: 'displacement',
  catalogo: 'displacement',
  'sobre-mi': 'image-reveal',
  trayectoria: 'topography',
  contacto: 'morph',
} as const
type Destination = keyof typeof effects

const contour = 'M-64-73C-41-88 8-87 42-60C77-33 101 1 80 37C61 69 10 58-19 74C-49 89-88 62-86 34C-84 10-101-47-64-73Z'
const morphStart = 'M 0 113 C 22 117 34 94 54 99 C 74 104 90 87 100 105 L 100 230 Q 50 230 0 230 Z'
const morphCover = 'M 0 -14 C 21 -5 36 -24 55 -13 C 73 -3 87 -15 100 -11 L 100 117 Q 58 146 0 118 Z'
const morphEnd = 'M 0 -133 C 19 -119 39 -143 57 -129 C 76 -115 91 -128 100 -128 L 100 -35 Q 64 -9 0 -25 Z'

export function SectionTransitions() {
  const id = useId()

  return <div className="section-transition" aria-hidden="true">
    <div className="transition-panel transition-displacement">
      <div className="transition-plate"><ProjectArtwork kind="solar"/></div>
      <div className="transition-plate"><ProjectArtwork kind="greenhouse"/></div>
      <canvas/>
    </div>
    <div className="transition-panel transition-image-reveal">
      <div className="transition-reveal-art"><ProjectArtwork kind="blueprint"/></div>
      <div className="transition-reveal-sheet"/>
    </div>
    <svg className="transition-panel transition-topography" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x2="100%" y2="80%">
          <stop stopColor="#f8f0de"/><stop offset=".48" stopColor="#83a6c9"/><stop offset="1" stopColor="#174478"/>
        </linearGradient>
      </defs>
      <g className="transition-terrain" transform="translate(50 50)">
        {['#102e54', '#2f5b86', '#6690b6', '#bacddb', `url(#${id})`].map((fill, index) => (
          <g key={fill} transform={`rotate(${index * 16})`}>
            <path d={contour} fill={fill} stroke="#f8f0de" strokeOpacity=".22" strokeWidth=".45"/>
          </g>
        ))}
      </g>
    </svg>
    <svg className="transition-panel transition-morph" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={morphStart} fill="#a7bad1"/>
      <path d={morphStart} fill="#174478"/>
    </svg>
  </div>
}

export function observeSectionTransitions(root: HTMLElement, onComplete: () => void) {
  const overlay = root.querySelector<HTMLElement>('.section-transition')
  const displacement = overlay?.querySelector<HTMLElement>('.transition-displacement')
  const canvas = displacement?.querySelector('canvas')
  const [fromPlate, toPlate] = displacement?.querySelectorAll<SVGSVGElement>('.project-art') ?? []
  if (!overlay || !displacement || !canvas || !fromPlate || !toPlate) return

  const renderer = createSectionDisplacement(canvas, [fromPlate, toPlate])
  const header = root.querySelector<HTMLElement>('.site-header')
  const sections = (['contacto', 'trayectoria', 'sobre-mi', 'proyectos', 'inicio'] as const).flatMap(id => {
    const element = document.getElementById(id)
    return element ? [{ id, element }] : []
  })
  const revealArt = overlay.querySelector('.transition-reveal-art')
  const revealSheet = overlay.querySelector('.transition-reveal-sheet')
  const topography = overlay.querySelector('.transition-terrain')
  const terrainLayers = overlay.querySelectorAll('.transition-topography path')
  const morph = overlay.querySelector('.transition-morph')
  const morphLayers = overlay.querySelectorAll('.transition-morph path')
  const animated = [revealArt, revealSheet, morph]
  let playback: gsap.core.Timeline | undefined
  let frame = 0
  let previousY = scrollY
  let linkTravel = false
  let linkTimer = 0
  let disposed = false

  function currentSection() {
    const line = Math.max((header?.offsetHeight ?? 0) + 40, innerHeight * .48)
    const [last] = sections
    if (last && scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) return last.id
    return sections.find(({ element }) => element.getBoundingClientRect().top <= line)?.id ?? 'inicio'
  }

  let current = currentSection()

  const clear = () => {
    overlay.removeAttribute('data-effect')
    gsap.set([overlay, ...animated], { clearProps: 'opacity,visibility,transform,transformOrigin' })
    gsap.set(morphLayers, { attr: { d: morphStart } })
    displacement.style.removeProperty('--sweep-clip')
    displacement.removeAttribute('data-renderer')
  }

  const play = (destination: Destination, direction: number) => {
    playback?.kill()
    clear()
    const effect = effects[destination]
    overlay.dataset.effect = effect
    const timeline = gsap.timeline({ onComplete: () => {
      clear()
      playback = undefined
      onComplete()
    } })
    playback = timeline

    if (effect === 'displacement') {
      const progress = { value: 0 }
      const draw = () => {
        const value = progress.value
        const drawn = renderer?.draw(value, direction)
        displacement.dataset.renderer = drawn ? 'webgl' : 'css'
        if (drawn) return
        const start = direction > 0 ? 0 : 100
        const wave = Math.sin(value * Math.PI) * 10
        const points = Array.from({ length: 13 }, (_, index) => {
          const edge = value * 100 + Math.sin(index * 1.2 + value * 8) * wave
          return `${start + direction * edge}% ${index * 100 / 12}%`
        })
        displacement.style.setProperty('--sweep-clip', `polygon(${start}% 0%, ${points.join(', ')}, ${start}% 100%)`)
      }
      draw()
      timeline.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: .17, ease: 'power2.out' }, 0)
        .to(progress, { value: 1, duration: 1.03, ease: 'power2.inOut', onUpdate: draw }, .08)
        .to(overlay, { opacity: 0, duration: .36, ease: 'power2.inOut' }, 1.11)
    } else if (effect === 'image-reveal') {
      timeline.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: .24 }, 0)
        .fromTo(revealArt, { scale: .23 }, { scale: 1, duration: .87, ease: 'power3.inOut' }, .24)
        .fromTo(revealSheet, { xPercent: -101 * direction }, { xPercent: 0, duration: .43, ease: 'power3.inOut' }, .22)
        .to(revealSheet, { xPercent: 101 * direction, duration: .54, ease: 'power3.inOut' }, .69)
        .to(overlay, { opacity: 0, duration: .33, ease: 'power2.inOut' }, 1.23)
    } else if (effect === 'topography') {
      timeline.fromTo(topography, { attr: { transform: `translate(${50 + 15 * direction} ${50 + 12 * direction})` } }, {
        attr: { transform: `translate(${50 - 7 * direction} ${50 - 4 * direction})` },
        duration: 1.2, ease: 'power2.inOut',
      }, 0)
        .fromTo(terrainLayers, { attr: { transform: 'scale(0)' } }, {
          attr: { transform: (index: number) => `scale(${1.45 - .17 * index})` },
          stagger: .075, duration: .83, ease: 'power3.inOut',
        }, 0)
        .to(overlay, { opacity: 0, duration: .4, ease: 'power2.inOut' }, 1.1)
    } else {
      timeline.set(morph, { scaleY: direction })
        .to(morphLayers, { attr: { d: morphCover }, duration: .58, stagger: .07, ease: 'power3.inOut' }, 0)
        .to(morphLayers, { attr: { d: morphEnd }, duration: .64, stagger: .075, ease: 'power3.inOut' }, .71)
    }
  }

  function endLinkTravel() {
    window.clearTimeout(linkTimer)
    linkTravel = false
  }

  function checkSection() {
    frame = 0
    const next = currentSection()
    const y = scrollY
    if (!linkTravel && next !== current && y !== previousY) play(next, y > previousY ? 1 : -1)
    previousY = y
    current = next
  }

  function onScroll() {
    if (!frame) frame = requestAnimationFrame(checkSection)
    if (linkTravel) {
      window.clearTimeout(linkTimer)
      linkTimer = window.setTimeout(endLinkTravel, 150)
    }
  }

  function onResize() {
    current = currentSection()
    previousY = scrollY
  }

  function onClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || !(event.target instanceof Element)) return
    const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]')
    const id = link?.getAttribute('href')?.slice(1)
    if (!link || !id || !Object.hasOwn(effects, id) || (link.target && link.target !== '_self')) return
    const section = document.getElementById(id)
    if (!section) return
    const distance = section.getBoundingClientRect().top - (header?.offsetHeight ?? 0)
    if ((id === 'inicio' && scrollY < 54) || Math.abs(distance) < 54 || (current === 'contacto' && id === current)) return

    // Native hash navigation still handles scrolling, focus, and browser history.
    linkTravel = true
    window.clearTimeout(linkTimer)
    linkTimer = window.setTimeout(endLinkTravel, 280)
    play(id as Destination, distance > 0 ? 1 : -1)
  }

  // React's event handlers run on the app root before this delegated listener.
  root.addEventListener('click', onClick)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  document.fonts.ready.then(() => { if (!disposed && !playback) onResize() })

  return () => {
    disposed = true
    root.removeEventListener('click', onClick)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(frame)
    endLinkTravel()
    playback?.kill()
    clear()
    renderer?.dispose()
  }
}
