const contours = [
  {
    rest: 'M0 0H1200V35C985 15 765 69 599 49C400 23 210 61 0 37Z',
    peak: 'M0 0H1200V58C1020 95 817 47 599 86C390 112 178 29 0 66Z',
  },
  {
    rest: 'M0 0H1200V24C987 7 765 53 599 34C398 9 210 46 0 24Z',
    peak: 'M0 0H1200V46C1020 79 817 35 599 71C390 95 178 14 0 51Z',
  },
  {
    rest: 'M0 0H1200V13C988 0 765 37 599 18C398 0 210 29 0 13Z',
    peak: 'M0 0H1200V30C1020 62 817 17 599 54C390 79 178 0 0 36Z',
  },
]

export function SectionEdge({ layered = false }: { layered?: boolean }) {
  const visible = layered ? contours : contours.slice(-1)
  return (
    <svg className={layered ? "section-edge section-edge--layered" : "section-edge"} viewBox="0 0 1200 110" preserveAspectRatio="none" aria-hidden="true">
      {visible.map(({ rest, peak }) => <path key={rest} d={rest} data-edge-peak={peak}/>)}
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

const curtainShapes = [
  'M0 19C210 56 407 5 610 20C833 36 1020 36 1200 4V110H0Z',
  'M0 27C196 8 402 64 607 37C798 14 1016 76 1200 35V110H0Z',
  'M0 14C205 52 414 15 610 36C815 60 1007 3 1200 24V110H0Z',
]

export function SectionCurtain() {
  return (
    <div className="section-curtain" aria-hidden="true">
      {curtainShapes.map(shape => (
        <svg key={shape} viewBox="0 0 1200 110" preserveAspectRatio="none" className="section-curtain-layer">
          <path d={shape}/>
        </svg>
      ))}
    </div>
  )
}
