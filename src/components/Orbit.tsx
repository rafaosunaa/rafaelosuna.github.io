import { MapPin } from 'lucide-react'
import orbital from './orbital.svg?raw'

export function Orbit({ location }: { location: string }) {
  return (
    <div className="orbit-panel">
      <div className="orbit-visual" aria-hidden="true">
        <div className="orbits-float">
          <div className="orbit-scene">
            <div className="orbital" dangerouslySetInnerHTML={{ __html: orbital }}/>
            <span className="orbit-cross one">+</span>
            <span className="orbit-cross two">+</span>
          </div>
        </div>
      </div>
      <div className="orbit-location">
        <span className="location"><MapPin size={15} aria-hidden="true"/>{location}</span>
      </div>
    </div>
  )
}
