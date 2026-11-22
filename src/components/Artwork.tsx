import { useId } from 'react'
import type { Artwork } from '../data/projects'

export function ProjectArtwork({ kind }: { kind: Artwork }) {
  const id = useId()
  const art = {
    agriculture: <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="128" y="49" width="384" height="240" rx="16" fill="#dce4e4"/>
      <path d="M128 81h384M233 81v208m-80-224h5m7 0h5m7 0h5"/>
      <rect x="255" y="101" width="226" height="47" rx="6"/>
      <path d="M274 117h58m-58 12h99m-214-19h48m-48 18h36m-36 18h42m-42 18h29"/>
      <rect x="255" y="163" width="226" height="24" rx="4"/>
      <rect x="255" y="196" width="226" height="24" rx="4"/>
      <rect x="255" y="229" width="226" height="24" rx="4"/>
      <path d="M273 175h102m-102 33h124m-124 33h75m98-68 4 4 10-10m-14 39 4 4 10-10"/>
      <circle cx="507" cy="83" r="31" fill="#ecf0e9"/>
      <path d="m490 83 32-14-7 28-11-10-6 5 3-10 15-8-18 10z"/>
    </g>,
    blueprint: <g fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M102 68h431v197H102zM102 155h170m65 0h196M247 68v86m140-86v86M188 155v110m230-110v110M281 192h53v35h-53z"/>
      <path d="M89 55h457M89 278h457M87 51v231m461-231v231M104 53v8m429-8v8M104 271v8m429-8v8" opacity=".55"/>
      <path d="M148 117h152v91h-77m77-91h189m-189 91h143" strokeDasharray="4 6"/>
      {[[148,117],[300,117],[489,117],[223,208],[443,208]].map(([x,y])=><circle key={x} cx={x} cy={y} r="7" fill="#b0c6d4"/>)}
      <path d="M464 110q25-25 50 0m-42 4q17-17 34 0" opacity=".8"/>
    </g>,
    greenhouse: <g fill="none" stroke="currentColor" strokeWidth="1.35">
      <path d="m102 246 200 72 226-112-203-64z M102 246v-85l90-87 201 61 135 71v-91l-133-70-203 29 M302 318v-88l91-95 M102 161l200 69 226-115 M192 74v87 M395 45v90 M151 114l199 65 M245 65l197 61 M148 216l200 73m-151-97 200 71m-155-95 200 73m-154-97 200 73" />
      <g strokeWidth="2.3">{[[165,220],[220,240],[272,260],[298,181],[350,200],[405,220],[238,205],[327,238]].map(([x,y])=><path key={x} d={`M${x} ${y}v-35m0 17q-15 0-20-13 15-2 20 13m0-8q9-17 21-17-3 16-21 17`}/>)}</g>
      <circle cx="585" cy="77" r="36" strokeDasharray="3 5"/><circle cx="585" cy="77" r="19"/><path d="M585 50v54m-27-27h54M523 155h62v-42"/>
    </g>,
    connect: <g transform="translate(126 43) skewX(-12)" stroke="currentColor" fill="none">
      <rect x="1" y="1" width="415" height="263" rx="23" fill="#d0dce8" strokeWidth="3"/>
      {Array.from({length:35},(_,i)=><circle key={i} cx={36+i%7*57} cy={30+Math.floor(i/7)*51} r="17" strokeWidth="1.25" fill={i>=28 || [24,25,17,20,18,12].includes(i) ? (i%3===0 ? '#6388af' : '#92b3d3') : '#e7eced'}/>)}
      <path d="m93 234 171-153" stroke="#234d7a" strokeWidth="2" strokeDasharray="3 6"/>
    </g>,
    robot: <g stroke="currentColor" fill="none" transform="translate(0 -8)">
      <ellipse cx="318" cy="262" rx="187" ry="48" opacity=".35"/>
      <path d="m222 181 166-37 72 36-161 57z m0 0v59l77 34 161-59v-35m-161 57v37m-41-107v-63l103-26 65 35v42m-168-51 66 34 102-25m-102 25v21m-46-69v-37l43-12 32 16v21"/>
      <ellipse cx="231" cy="230" rx="31" ry="45" transform="rotate(-22 231 230)" fill="#cedde4"/><ellipse cx="231" cy="230" rx="16" ry="27" transform="rotate(-22 231 230)"/>
      <ellipse cx="398" cy="236" rx="34" ry="47" transform="rotate(15 398 236)" fill="#cedde4"/><ellipse cx="398" cy="236" rx="17" ry="26" transform="rotate(15 398 236)"/>
      <circle cx="302" cy="64" r="6"/><path d="M310 64h24M120 155h57l44 41m248-11 64-36h51M355 80l43-41h57" strokeDasharray="4 6"/>
    </g>,
    solar: <g fill="none" stroke="currentColor">
      <g transform="rotate(-19 320 175)">{[60,95,132,177,220,266].map((r)=><ellipse key={r} cx="319" cy="176" rx={r} ry={r*.34} opacity=".65"/>)}<circle cx="319" cy="176" r="29" fill="#b8cfe0"/><circle cx="226" cy="187" r="8" fill="#b1c4dd"/><circle cx="416" cy="207" r="13" fill="#a1bcdc"/><circle cx="557" cy="137" r="18" fill="#819ec5"/><circle cx="166" cy="155" r="11" fill="#bfd0dd"/><circle cx="124" cy="204" r="5" fill="#b1c4dd"/></g>
      <path d="M94 66v20m-10-10h20m434 166v22m-11-11h22m-381 32v14m-7-7h14M434 53v16m-8-8h16"/>
    </g>,
    flappy: <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M35 246c82 0 112-126 208-126 68 0 119 89 173 89 74 0 102-116 191-123" strokeDasharray="5 7"/>
      <path d="M139 288v-65h58v65m-63-65v-15h68v15m150-181v113h54V42m-58 113v16h62v-16m75 133V179h56v109m-62-109v-15h69v15" opacity=".7"/>
      <path d="M242 115h48l22 15-22 12h-48l-20-12zm7 8 10-27h20l11 19" fill="#b1cadd"/><circle cx="286" cy="124" r="3" fill="currentColor"/>
    </g>,
    network: <g stroke="currentColor" fill="none">
      <path d="m108 97 204 68 215-94m-415 158 200-64 218 79m-320 37 102-116 92 112m-197-223 105 111 105-113" strokeDasharray="4 5"/>
      {[[108,97],[527,71],[112,229],[530,244],[210,281],[404,277],[207,54],[417,52]].map(([x,y])=><g key={x}><rect x={x-12} y={y-12} width="24" height="24" rx="5"/><circle cx={x} cy={y} r="3" fill="currentColor"/></g>)}
      <circle cx="312" cy="165" r="28"/><circle cx="312" cy="165" r="42" opacity=".5"/><circle cx="312" cy="165" r="7" fill="currentColor"/>
    </g>,
    unity: <g stroke="currentColor" fill="none"><path d="M76 271h488M121 271l108-156 114 72 78-108 103 192zM121 271l112-44 110-40 73 46 108 38M229 115l4 112 61 44 49-84m78-108-5 154 11 38" strokeWidth="1.4"/><circle cx="314" cy="97" r="48" opacity=".6"/><path d="M188 271l29-35m263 35-45-68" strokeDasharray="4 5"/></g>,
  }
  return (
    <svg className={`project-art art-${kind}`} viewBox="0 0 640 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" stroke="currentColor" opacity=".16" fill="none"/></pattern>
      </defs>
      <rect width="640" height="340" fill={`url(#${id})`}/>
      <g className="art-drawing">{art[kind]}</g>
    </svg>
  )
}
