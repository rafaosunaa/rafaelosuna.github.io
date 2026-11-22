const restingEdge = 'M0 0H1200V22C980 30 810 12 598 18C382 25 205 34 0 24Z'
const passingEdge = 'M0 0H1200V26C974 37 813 19 598 26C378 33 198 39 0 28Z'

export function SectionEdge() {
  return (
    <svg className="section-edge" viewBox="0 0 1200 52" preserveAspectRatio="none" aria-hidden="true">
      <path d={restingEdge} data-edge-peak={passingEdge}/>
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
