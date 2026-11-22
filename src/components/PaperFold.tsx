import { useEffect, useRef } from 'react'

export function PaperFold() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const panel = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !panel || !context) return

    const target = { x: 0, y: 0, pressure: 0 }
    const fold = { x: 0, y: 0, pressure: 0 }
    let width = 0
    let height = 0
    let previousFrame = 0
    let lastMove = 0
    let frame = 0

    const resize = () => {
      const rect = panel.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const pixelRatio = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.ceil(width * pixelRatio)
      canvas.height = Math.ceil(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const draw = (now: number) => {
      frame = 0
      const step = 1 - Math.exp(-Math.min(now - previousFrame, 48) / 82)
      previousFrame = now
      if (now - lastMove > 120) target.pressure = 0
      fold.x += (target.x - fold.x) * step
      fold.y += (target.y - fold.y) * step
      fold.pressure += (target.pressure - fold.pressure) * step
      context.clearRect(0, 0, width, height)
      if (fold.pressure < .006 && target.pressure === 0) return

      const length = Math.min(width, height) * .67
      const depth = 25 * fold.pressure
      context.save()
      context.translate(fold.x, fold.y)
      context.rotate(-.66 + ((fold.x / width) - .5) * .58)
      context.globalAlpha = fold.pressure

      const light = context.createLinearGradient(0, -depth, 0, depth * 1.3)
      light.addColorStop(0, 'rgba(255, 251, 235, 0)')
      light.addColorStop(.37, 'rgba(255, 251, 235, .68)')
      light.addColorStop(.51, 'rgba(252, 247, 225, .42)')
      light.addColorStop(.57, 'rgba(41, 54, 77, .26)')
      light.addColorStop(1, 'rgba(41, 54, 77, 0)')
      context.fillStyle = light
      context.beginPath()
      context.moveTo(-length, depth * .5)
      context.bezierCurveTo(-length * .44, -depth * 1.1, length * .34, -depth * 1.48, length, -depth * .46)
      context.bezierCurveTo(length * .42, depth * .22, -length * .36, depth * 1.52, -length, depth * .5)
      context.fill()
      context.restore()

      frame = requestAnimationFrame(draw)
    }

    const move = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect()
      target.x = event.clientX - rect.left
      target.y = event.clientY - rect.top
      target.pressure = 1
      lastMove = performance.now()
      if (!frame) {
        fold.x = target.x
        fold.y = target.y
        previousFrame = lastMove
        frame = requestAnimationFrame(draw)
      }
    }

    const relax = () => {
      target.pressure = 0
    }

    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') relax()
    }

    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      target.pressure = 0
      fold.pressure = 0
      context.clearRect(0, 0, width, height)
    }

    const layout = new ResizeObserver(resize)
    layout.observe(panel)
    resize()
    panel.addEventListener('pointermove', move, { passive: true })
    panel.addEventListener('pointerdown', move, { passive: true })
    panel.addEventListener('pointerleave', leave)
    panel.addEventListener('pointercancel', relax)
    return () => {
      layout.disconnect()
      reset()
      panel.removeEventListener('pointermove', move)
      panel.removeEventListener('pointerdown', move)
      panel.removeEventListener('pointerleave', leave)
      panel.removeEventListener('pointercancel', relax)
    }
  }, [])

  return <canvas ref={canvasRef} className="paper-fold" aria-hidden="true"/>
}
