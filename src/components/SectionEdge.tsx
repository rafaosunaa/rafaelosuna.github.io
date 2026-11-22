const edgeWidth = 1200
const samples = 160

function grain(index: number) {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

const tornEdge = Array.from({ length: samples + 1 }, (_, index) => {
  const progress = index / samples
  const x = progress * edgeWidth + (index > 0 && index < samples ? 5 * (grain(index + samples) - .5) : 0)
  const face = 11 + 28 * progress + 2.9 * Math.sin(progress * 14) + 1.5 * Math.sin(progress * 37)
    + 4.5 * (grain(index) - .5)
  const backing = face + 5 + 3.6 * grain(index + 2 * samples)
  return { x, face, backing }
})

function paperPath(layer: 'face' | 'backing') {
  const points = tornEdge.map(point => `${point.x.toFixed(1)} ${point[layer].toFixed(1)}`)
  return `M0 0 L${points.join(' L')} L${edgeWidth} 0 Z`
}

const face = paperPath('face')
const backing = paperPath('backing')

export function SectionEdge() {
  return (
    <svg className="section-edge" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
      <g className="section-tear" transform="scale(1 1)">
        <path className="section-tear-backing" d={backing}/>
        <path className="section-tear-face" d={face}/>
      </g>
    </svg>
  )
}

export function InkFilter() {
  return <svg className="ink-filter" width="0" height="0" aria-hidden="true">
    <defs>
      <filter id="control-ripple" x="-25%" y="-55%" width="150%" height="210%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".039 .075" numOctaves="2" seed="12" result="grain"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="0" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>
}
