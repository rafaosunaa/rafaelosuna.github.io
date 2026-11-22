import { useState, useSyncExternalStore } from 'react'
import { Pause, Play } from 'lucide-react'
import { useLanguage } from '../language'
import orbital from './orbital.svg?raw'

const preference = '(prefers-reduced-motion: reduce)'
const storageKey = 'portfolio-orbit-motion'

function subscribe(onChange: () => void) {
  const media = matchMedia(preference)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function readOverride() {
  try {
    const value = localStorage.getItem(storageKey)
    if (value === 'play' || value === 'pause') return value
  } catch {
    // The control also works without storage.
  }
  return null
}

export function Orbit() {
  const { t } = useLanguage()
  const reducedMotion = useSyncExternalStore(subscribe, () => matchMedia(preference).matches)
  const [override, setOverride] = useState(readOverride)
  const playing = override === null ? !reducedMotion : override === 'play'

  function toggleAnimation() {
    const next = playing ? 'pause' : 'play'
    setOverride(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // Keep the selection for the current visit.
    }
  }

  return (
    <div className="orbit-panel" data-playing={playing}>
      <div className="orbits-float" aria-hidden="true">
        <div className="orbit-scene">
          <div className="orbital" dangerouslySetInnerHTML={{ __html: orbital }}/>
          <span className="orbit-cross one">+</span>
          <span className="orbit-cross two">+</span>
        </div>
      </div>
      <button className="orbit-toggle" type="button" onClick={toggleAnimation}>
        {playing ? <Pause size={15} aria-hidden="true"/> : <Play size={15} aria-hidden="true"/>}
        {t(playing ? 'Pausar animación' : 'Activar animación')}
      </button>
    </div>
  )
}
