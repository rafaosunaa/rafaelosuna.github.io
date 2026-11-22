import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function usePortfolioMotion(scope: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = root.querySelector('.intro')
      const counter = root.querySelector('.intro-count')
      const title = root.querySelector('#hero-title')
      const titleFill = title?.querySelector('.hero-name--fill')
      const progress = { value: 0 }
      const timeline = gsap.timeline()
      if (intro && counter && !location.hash && scrollY < 40) {
        timeline.set(intro, { visibility: 'visible' })
          .to(progress, {
            value: 100, duration: .44, ease: 'power2.out',
            onUpdate: () => { counter.textContent = `${Math.round(progress.value)}%` },
          })
          .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: .55, ease: 'power3.inOut' })
          .set(intro, { visibility: 'hidden' })
      }
      if (title && titleFill && CSS.supports('-webkit-text-stroke', '1px currentColor') && CSS.supports('clip-path', 'inset(0 100% 0 0)')) {
        timeline.set(title, { attr: { 'data-filling': 'true' } }, 0)
          .set(titleFill, { clipPath: 'inset(0 100% 0 0)' }, 0)
          .to(titleFill, { clipPath: 'inset(0 0% 0 0)', duration: 1.08, ease: 'power2.inOut' }, '+=.08')
          .set(title, { attr: { 'data-filling': 'false' } })
          .set(titleFill, { clearProps: 'clipPath' }, '<')
      }
      timeline.from(root.querySelectorAll('.hero-copy, .orbit-panel'), {
        y: 16, opacity: 0, duration: .55, ease: 'power2.out', stagger: .08, clearProps: 'transform,opacity',
      }, '-=.37')

      for (const item of root.querySelectorAll('[data-reveal]')) {
        if (item.getBoundingClientRect().top <= innerHeight) continue
        gsap.from(item, {
          y: 24, opacity: 0, duration: .65, ease: 'power2.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: item, start: 'top 93%', once: true },
        })
      }
      gsap.to(root.querySelector('.orbits-float'), {
        y: 38, ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true },
      })
    })
    return () => motion.revert()
  }, [scope])
}

export function usePointerEffects(scope: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = scope.current
    const pointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!root) return
    const cursor = root.querySelector<HTMLElement>('.cursor-ring')
    let active: HTMLElement | null = null

    function reset() {
      active?.style.removeProperty('--shift-x')
      active?.style.removeProperty('--shift-y')
      active = null
      cursor?.classList.remove('visible')
    }

    function move(event: PointerEvent) {
      if (!pointer.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
      const target = event.target.closest<HTMLElement>('[data-magnetic], .orbit-panel')
      if (target !== active) {
        reset()
        active = target
      }
      if (target) {
        const bounds = target.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / bounds.width - .5
        const y = (event.clientY - bounds.top) / bounds.height - .5
        target.style.setProperty('--shift-x', `${x * 14}px`)
        target.style.setProperty('--shift-y', `${y * 14}px`)
      }
      cursor?.classList.toggle('visible', Boolean(event.target.closest('.art-wrap')))
      if (cursor) cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    }

    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', reset)
    root.addEventListener('click', reset)
    pointer.addEventListener('change', reset)
    return () => {
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', reset)
      root.removeEventListener('click', reset)
      pointer.removeEventListener('change', reset)
      reset()
    }
  }, [scope])
}
