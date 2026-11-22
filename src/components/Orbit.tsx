import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { useLanguage } from '../language'
import orbital from './orbital.svg?raw'

const storageKey = 'portfolio-orbit-motion'

function initialPlayback() {
  try {
    return localStorage.getItem(storageKey) !== 'pause'
  } catch {
    return true
  }
}

export function Orbit() {
  const { t } = useLanguage()
  const [playing, setPlaying] = useState(initialPlayback)

  function toggleAnimation() {
    const next = !playing
    setPlaying(next)
    try {
      localStorage.setItem(storageKey, next ? 'play' : 'pause')
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
