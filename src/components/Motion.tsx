import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  for (const path of root.querySelectorAll<SVGPathElement>('.section-edge path')) {
    const rest = path.getAttribute('d')
    const peak = path.dataset.edgePeak
    if (!rest || !peak) continue

    gsap.timeline({
      scrollTrigger: { trigger: path.ownerSVGElement, start: 'top bottom', end: 'top 32%', scrub: .4 },
    })
      .to(path, { attr: { d: peak }, duration: .5, ease: 'sine.inOut' })
      .to(path, { attr: { d: rest }, duration: .5, ease: 'sine.inOut' })
  }

  const reveals = new Map<Element, gsap.core.Tween>()
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const sheet = entry.target
      if (!entry.isIntersecting) {
        reveals.get(sheet)?.kill()
        reveals.delete(sheet)
        gsap.set(sheet, { clearProps: 'clipPath,visibility' })
        continue
      }
      if (entry.intersectionRatio < .18 || reveals.has(sheet)) continue

      gsap.set(sheet, { visibility: 'visible', clipPath: 'inset(0 0 0 0)' })
      reveals.set(sheet, gsap.to(sheet, {
        clipPath: 'inset(0 0 0 100%)', duration: .93, ease: 'power3.inOut', clearProps: 'clipPath,visibility',
      }))
    }
  }, { threshold: [0, .18] })

  const sheets = root.querySelectorAll('.project-reveal')
  sheets.forEach(sheet => observer.observe(sheet))
  return () => {
    observer.disconnect()
    reveals.forEach(reveal => reveal.kill())
    gsap.set(sheets, { clearProps: 'clipPath,visibility' })
  }
}

export function usePortfolioMotion(scope: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    const initialSection = document.getElementById(location.hash.slice(1))
    if (initialSection && scrollY === 0) initialSection.scrollIntoView({ behavior: 'instant' })

    let introPlaying = false
    const title = observeHeroTitle(root, () => introPlaying)

    function finishIntro() {
      if (!introPlaying) return
      introPlaying = false
      // Let GSAP leave the intro context before it starts the title tween.
      queueMicrotask(() => title?.playIfVisible())
    }

    const motion = gsap.context(() => {
      const disposeEdges = animateSectionEdges(root)
      const intro = root.querySelector('.intro')
      const counter = root.querySelector('.intro-count')
      const progress = { value: 0 }
      const timeline = gsap.timeline()
      if (intro && counter && !location.hash && scrollY < 40) {
        introPlaying = true
        timeline.set(intro, { visibility: 'visible' })
          .to(progress, {
            value: 100, duration: .44, ease: 'power2.out',
            onUpdate: () => { counter.textContent = `${Math.round(progress.value)}%` },
          })
          .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: .55, ease: 'power3.inOut' })
          .set(intro, { visibility: 'hidden' })
          .call(finishIntro)
      }
      timeline.from(root.querySelectorAll('.hero-copy, .orbit-panel'), {
        y: 16, opacity: 0, duration: .55, ease: 'power2.out', stagger: .08, clearProps: 'transform,opacity',
      }, '+=.76')

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
      return disposeEdges
    }, root)
    return () => {
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
    const ripple = root.querySelector('#control-ripple feDisplacementMap')
    let rippleAnimation: gsap.core.Timeline | undefined
    let ripplingControl: HTMLElement | null = null

    function clearRipple() {
      ripplingControl?.removeAttribute('data-rippling')
      ripple?.setAttribute('scale', '0')
      ripplingControl = null
    }

    function rippleControl(event: PointerEvent | FocusEvent) {
      if (!ripple || !(event.target instanceof Element)) return
      const control = event.target.closest<HTMLElement>('.project-trigger, .catalog-entry') ??
        event.target.closest<HTMLElement>('.ink-control')
      if (!control) return

      if (event.type === 'pointerover' && (
        !(event instanceof PointerEvent) || event.pointerType === 'touch' ||
        (event.relatedTarget instanceof Node && control.contains(event.relatedTarget))
      )) return
      if (event.type === 'focusin' && !control.matches(':focus-visible')) return

      rippleAnimation?.kill()
      clearRipple()
      ripplingControl = control
      control.setAttribute('data-rippling', '')
      rippleAnimation = gsap.timeline({ onComplete: clearRipple })
        .to(ripple, { attr: { scale: 29 }, duration: .2, ease: 'power2.out' })
        .to(ripple, { attr: { scale: 0 }, duration: .65, ease: 'power2.out' })
    }

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
    root.addEventListener('pointerover', rippleControl)
    root.addEventListener('pointerdown', rippleControl)
    root.addEventListener('focusin', rippleControl)
    root.addEventListener('pointerleave', reset)
    root.addEventListener('click', reset)
    pointer.addEventListener('change', reset)
    return () => {
      rippleAnimation?.kill()
      clearRipple()
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerover', rippleControl)
      root.removeEventListener('pointerdown', rippleControl)
      root.removeEventListener('focusin', rippleControl)
      root.removeEventListener('pointerleave', reset)
      root.removeEventListener('click', reset)
      pointer.removeEventListener('change', reset)
      reset()
    }
  }, [scope])
}
