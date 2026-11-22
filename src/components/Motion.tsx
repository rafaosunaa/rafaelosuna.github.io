import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animatePreloader } from './preloader'

gsap.registerPlugin(ScrollTrigger)

function observeHeroTitle(root: HTMLElement, isIntroPlaying: () => boolean) {
  const title = root.querySelector<HTMLElement>('#hero-title')
  const fill = title?.querySelector<HTMLElement>('.hero-name--fill')
  if (
    !title || !fill ||
    !CSS.supports('-webkit-text-stroke', '1px currentColor') ||
    !CSS.supports('clip-path', 'inset(0 100% 0 0)')
  ) return

  const minimumVisible = .45
  let visible = false
  let ready = true
  let animation: gsap.core.Tween | undefined

  const clearFill = () => {
    title.removeAttribute('data-filling')
    fill.style.removeProperty('clip-path')
  }

  const playIfVisible = () => {
    if (!visible || !ready || isIntroPlaying()) return

    ready = false
    gsap.set(title, { attr: { 'data-filling': 'true' } })
    gsap.set(fill, { clipPath: 'inset(0 100% 0 0)' })
    animation = gsap.to(fill, {
      clipPath: 'inset(0 0% 0 0)', delay: .18, duration: 1.12, ease: 'power2.inOut',
      onComplete: clearFill,
    })
  }

  const headerHeight = root.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= minimumVisible
    if (!entry.isIntersecting) {
      animation?.kill()
      clearFill()
      ready = true
    }
    playIfVisible()
  }, { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: [0, minimumVisible] })
  observer.observe(title)

  return {
    playIfVisible,
    dispose() {
      observer.disconnect()
      ready = false
      animation?.kill()
      clearFill()
    },
  }
}

function animateSectionEdges(root: HTMLElement) {
  for (const tear of root.querySelectorAll<SVGGElement>('.section-tear')) {
    gsap.timeline({
      scrollTrigger: { trigger: tear.ownerSVGElement, start: 'top bottom', end: 'top 32%', scrub: .4 },
    })
      .to(tear, { attr: { transform: 'scale(1 1.08)' }, duration: .5, ease: 'sine.inOut' })
      .to(tear, { attr: { transform: 'scale(1 1)' }, duration: .5, ease: 'sine.inOut' })
  }
}

export function usePortfolioMotion(scope: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    const initialSection = document.getElementById(location.hash.slice(1))
    if (initialSection && scrollY === 0) initialSection.scrollIntoView({ behavior: 'instant' })

    const title = observeHeroTitle(root, () => document.documentElement.hasAttribute('data-preloading'))
    const playTitle = () => queueMicrotask(() => title?.playIfVisible())
    document.addEventListener('portfolio:preloaded', playTitle, { once: true })
    const disposePreloader = animatePreloader(root)

    const motion = gsap.context(() => {
      animateSectionEdges(root)
      for (const item of root.querySelectorAll('[data-reveal]')) {
        if (item.getBoundingClientRect().top <= innerHeight) continue
        gsap.from(item, {
          y: 12, opacity: .75, duration: .45, ease: 'power2.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: item, start: 'top 93%', once: true },
        })
      }
      gsap.to(root.querySelector('.orbits-float'), {
        y: 22, ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => {
      document.removeEventListener('portfolio:preloaded', playTitle)
      disposePreloader?.()
      title?.dispose()
      motion.revert()
    }
  }, [scope])
}

export function usePointerEffects(scope: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = scope.current
    const pointer = matchMedia('(hover: hover) and (pointer: fine)')
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
      const target = event.target.closest('.orbit-visual')?.closest<HTMLElement>('.orbit-panel') ?? null
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
