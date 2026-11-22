import gsap from 'gsap'

export function animatePreloader(root: HTMLElement) {
  const page = document.documentElement
  if (!page.hasAttribute('data-preloading')) return

  const finish = () => document.dispatchEvent(new Event('portfolio:preloaded'))
  const sheet = document.querySelector<HTMLElement>('.intro-sheet')
  const mark = document.querySelector<HTMLElement>('.intro-brand')
  const ring = document.querySelector<SVGSVGElement>('.intro-ring')
  const progress = ring?.querySelector<SVGCircleElement>('.intro-progress')
  const headerMark = root.querySelector<HTMLElement>('.site-header .brand')
  if (!sheet || !mark || !ring || !progress || !headerMark || scrollY > 40) {
    finish()
    return
  }

  let animation: gsap.core.Timeline | undefined
  let disposed = false

  const reveal = () => {
    if (disposed || animation || !page.hasAttribute('data-preloading')) return
    window.clearTimeout(fontDeadline)

    const offset = getComputedStyle(progress).strokeDashoffset
    progress.style.animation = 'none'
    progress.style.strokeDashoffset = offset

    const start = mark.getBoundingClientRect()
    const end = headerMark.getBoundingClientRect()
    const glide = { duration: .8, ease: 'power3.inOut' }
    animation = gsap.timeline({ onComplete: finish })
      .to(progress, { strokeDashoffset: 0, duration: .26, ease: 'power2.out' })
      .to(ring, { y: -26, scale: .45, opacity: 0, duration: .34, ease: 'power2.in' }, .28)
      .to(sheet, { yPercent: -100, ...glide }, .38)
      .to(mark, {
        x: end.left + end.width / 2 - start.left - start.width / 2,
        y: end.top + end.height / 2 - start.top - start.height / 2,
        scale: end.width / start.width,
        ...glide,
      }, .38)
      .from(root.querySelectorAll('.hero-copy, .orbit-panel'), {
        y: 18, opacity: 0, duration: .55, ease: 'power2.out', stagger: .08, clearProps: 'transform,opacity',
      }, .67)
  }

  // Give the hero fonts time to settle while the ring traces its first arc.
  const trace = progress.getAnimations()[0]?.finished.catch(() => undefined)
  const fontDeadline = window.setTimeout(reveal, 1600)
  void Promise.all([trace, document.fonts.ready]).then(reveal, reveal)

  return () => {
    disposed = true
    window.clearTimeout(fontDeadline)
    animation?.revert()
    finish()
  }
}
