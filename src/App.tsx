import { assetUrl } from './assets'
import { useRef, useState } from 'react'
import { ArrowDown, Check, Copy, Download, CodeXml, BriefcaseBusiness, MapPin, Menu, X } from 'lucide-react'
import { personal } from './data/personal'
import { Projects } from './components/Projects'
import { Resume } from './components/Resume'
import { usePointerEffects, usePortfolioMotion } from './components/Motion'

const navigation = [
  ['Proyectos', '#proyectos'], ['Sobre mí', '#sobre-mi'], ['Trayectoria', '#trayectoria'], ['Contacto', '#contacto'],
]

function Header() {
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement>(null)
  return <header className="site-header" onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      opener.current?.focus()
    }
  }}>
    <div className="shell header-inner">
      <a className="brand" href="#inicio" aria-label="Rafael Osuna Ventura · Inicio">ro<span>.</span></a>
      <button className="menu-toggle" ref={opener} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="navigation">
        {open ? <X size={20}/> : <Menu size={20}/>}<span>{open ? 'Cerrar' : 'Menú'}</span>
      </button>
      <nav id="navigation" className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Navegación principal">
        {navigation.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
    </div>
  </header>
}

function Hero() {
  return <section className="hero shell" id="inicio" aria-labelledby="hero-title">
    <div className="hero-main">
      <div className="hero-copy">
        <p className="eyebrow hero-kicker"><span className="section-mark"/>{personal.disciplines}</p>
        <h1 id="hero-title">{personal.headline.map(line => <span className="hero-line" key={line}><span>{line}</span></span>)}</h1>
        <p className="hero-role">{personal.role}</p>
        <p className="hero-tagline">{personal.tagline}</p>
      </div>
      <div className="orbit-panel" aria-hidden="true">
        <div className="orbits-float"><img className="orbital" src={assetUrl("/orbital.svg")} width="500" height="475" alt="" fetchPriority="high"/></div>
        <span className="orbit-cross one">+</span><span className="orbit-cross two">+</span>
      </div>
    </div>
    <div className="hero-bottom">
      <a className="scroll-link" href="#proyectos" data-magnetic><span className="scroll-icon"><ArrowDown size={17}/></span> Explorar proyectos</a>
      <span className="location"><MapPin size={15}/>{personal.location}</span>
    </div>
  </section>
}

function DownloadCV() {
  return personal.cv && <a className="pill" href={assetUrl(personal.cv)} download data-magnetic><Download size={17}/> Descargar CV</a>
}

function About() {
  return <section id="sobre-mi" className="about shell" aria-labelledby="about-title">
    <p className="eyebrow"><span className="section-mark"/> Sobre mí</p>
    <div className="about-grid" data-reveal>
      <h2 id="about-title">{personal.aboutHeadline}</h2>
      <div className="about-copy">
        {personal.photo && <img className="portrait" src={assetUrl(personal.photo)} alt={personal.name} loading="lazy" />}
        <p>{personal.bio}</p>
        <ul className="tags">{personal.interests.map(interest => <li key={interest}>{interest}</li>)}</ul>
        <div className="link-row"><DownloadCV/></div>
      </div>
    </div>
  </section>
}

function Contact() {
  const [copyStatus, setCopyStatus] = useState('')
  async function copyEmail() {
    if (!personal.email) return
    try {
      await navigator.clipboard.writeText(personal.email)
      setCopyStatus('Correo copiado.')
    } catch {
      setCopyStatus('Puedes seleccionar y copiar la dirección de correo.')
    }
  }
  return <footer id="contacto" className="contact dark-section">
    <div className="shell">
      <p className="eyebrow"><span className="section-mark"/> Contacto</p>
      <h2 data-reveal>Hablemos<span className="accent">.</span></h2>
      {personal.email && <div className="email-line">
        <a className="email" href={`mailto:${personal.email}`}>{personal.email}</a>
        <button type="button" className="copy-button" onClick={copyEmail} aria-label="Copiar correo" title="Copiar correo" data-magnetic>{copyStatus === 'Correo copiado.' ? <Check size={19}/> : <Copy size={19}/>}</button>
      </div>}
      <p className="copy-status" role="status">{copyStatus}</p>
      <div className="link-row">
        {personal.github && <a className="pill" href={personal.github}><CodeXml size={17}/> GitHub</a>}
        {personal.linkedin && <a className="pill" href={personal.linkedin}><BriefcaseBusiness size={17}/> LinkedIn</a>}
        <DownloadCV/>
      </div>
      <div className="footer-bar">
        <span>© {new Date().getFullYear()} {personal.name}</span>
        {import.meta.env.VITE_SOURCE_ARCHIVE && <a href={import.meta.env.VITE_SOURCE_ARCHIVE} download>Descargar código fuente</a>}
        <a href="#inicio">Volver arriba</a>
      </div>
    </div>
  </footer>
}

export default function App() {
  const scope = useRef<HTMLDivElement>(null)
  usePortfolioMotion(scope)
  usePointerEffects(scope)
  return <div ref={scope}>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <div className="intro" aria-hidden="true">
      <span className="brand">ro<span>.</span></span>
      <span className="intro-count">0%</span>
    </div>
    <Header/>
    <main id="contenido">
      <Hero/>
      <Projects/>
      <About/>
      <Resume/>
    </main>
    <Contact/>
    <div className="cursor-ring" aria-hidden="true"/>
  </div>
}
