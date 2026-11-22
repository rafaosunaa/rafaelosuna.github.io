import { LanguageSelector, useLanguage } from './language'
import { Orbit } from './components/Orbit'
import { SectionEdge } from './components/SectionEdge'
import { assetUrl } from './assets'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Check, Copy, Download, CodeXml, BriefcaseBusiness, Menu, X } from 'lucide-react'
import { personal } from './data/personal'
import { Projects } from './components/Projects'
import { Resume } from './components/Resume'
import { usePointerEffects, usePortfolioMotion } from './components/Motion'

const navigation = [
  ['Proyectos', '#proyectos'], ['Sobre mí', '#sobre-mi'], ['Trayectoria', '#trayectoria'], ['Contacto', '#contacto'],
]

const sectionIds = navigation.map(([, href]) => href.slice(1))

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = ''
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= innerHeight * .4) current = id
      }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1]
      setActive(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    schedule()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
    }
  }, [ids])
  return active
}

function Header() {
  const { t } = useLanguage()
  const active = useActiveSection(sectionIds)
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement>(null)
  return <header className="site-header" onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      opener.current?.focus()
    }
  }}>
    <div className="shell header-inner">
      <a className="brand" href="#inicio" aria-label={`Rafael Osuna Ventura · ${t("Inicio")}`}>
        <img src={assetUrl('logo-inflated.webp')} width="600" height="290" alt="ro."/>
      </a>
      <div className="header-controls">
        <button className="menu-toggle paper-control" ref={opener} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="navigation">
          {open ? <X size={20}/> : <Menu size={20}/>}<span>{t(open ? 'Cerrar' : 'Menú')}</span>
        </button>
        <nav id="navigation" className={`main-nav ${open ? 'is-open' : ''}`} aria-label={t('Navegación principal')}>
          {navigation.map(([label, href]) => <a key={href} href={href} className="paper-control" aria-current={active === href.slice(1) ? 'location' : undefined} onClick={() => setOpen(false)}>{t(label)}</a>)}
        </nav>
        <LanguageSelector/>
      </div>
    </div>
  </header>
}

function Hero() {
  const { t } = useLanguage()
  return <section className="hero" id="inicio" aria-labelledby="hero-title">
    <div className="shell">
      <div className="hero-title">
        <p className="eyebrow hero-kicker"><span className="section-mark"/>{t(personal.disciplines)}</p>
        <h1 id="hero-title" aria-label={personal.name}>
          {['base', 'fill'].map(layer => (
            <span key={layer} className={`hero-name hero-name--${layer}`} aria-hidden="true">
              {personal.headline.map(line => <span className="hero-line" key={line}><span>{line}</span></span>)}
            </span>
          ))}
        </h1>
      </div>
      <div className="hero-main">
        <div className="hero-copy">
          <p className="hero-role">{t(personal.role)}</p>
          <p className="hero-tagline">{t(personal.tagline)}</p>
          <div className="hero-actions">
            <a className="scroll-link paper-control" href="#proyectos">
              {t('Explorar proyectos')}
              <ArrowDown className="scroll-icon" size={16} aria-hidden="true"/>
            </a>
            <DownloadCV/>
          </div>
        </div>
        <Orbit location={t(personal.location)}/>
      </div>
      <nav className="hero-index" aria-label={t('Índice de secciones')}>
        {navigation.map(([label, href], index) => (
          <a key={href} href={href}><span><i className="idx" aria-hidden="true">{String(index + 1).padStart(2, '0')}</i>{t(label)}</span></a>
        ))}
      </nav>
    </div>
  </section>
}

function DownloadCV() {
  const { t } = useLanguage()
  return personal.cv && <a className="pill paper-control" href={assetUrl(personal.cv)} download><Download size={17}/> {t('Descargar CV')}</a>
}

function About() {
  const { t } = useLanguage()
  return <section id="sobre-mi" className="about" aria-labelledby="about-title">
    <SectionEdge/>
    <div className="shell">
      <p className="eyebrow"><span className="section-mark"/> {t('Sobre mí')}</p>
      <div className="about-grid" data-reveal>
        <h2 id="about-title">{t(personal.aboutHeadline)}</h2>
        <div className="about-copy">
          {personal.photo && <img className="portrait" src={assetUrl(personal.photo)} alt={personal.name} loading="lazy" />}
          <p>{t(personal.bio)}</p>
          <ul className="tags">{personal.interests.map(interest => <li key={interest}>{t(interest)}</li>)}</ul>
          <div className="link-row"><DownloadCV/></div>
        </div>
      </div>
    </div>
  </section>
}

function Contact() {
  const { t } = useLanguage()
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
    <SectionEdge/>
    <div className="shell">
      <p className="eyebrow"><span className="section-mark"/> {t('Contacto')}</p>
      <h2 data-reveal>{t('Hablemos')}<span className="accent">.</span></h2>
      {personal.email && <div className="email-line">
        <a className="email" href={`mailto:${personal.email}`}>{personal.email}</a>
        <button type="button" className="copy-button paper-control" onClick={copyEmail} aria-label={t('Copiar correo')} title={t('Copiar correo')}>{copyStatus === 'Correo copiado.' ? <Check size={19}/> : <Copy size={19}/>}</button>
      </div>}
      <p className="copy-status" role="status">{t(copyStatus)}</p>
      <div className="link-row">
        {personal.github && <a className="pill paper-control" href={personal.github}><CodeXml size={17}/> GitHub</a>}
        {personal.linkedin && <a className="pill paper-control" href={personal.linkedin}><BriefcaseBusiness size={17}/> LinkedIn</a>}
        <DownloadCV/>
      </div>
      <div className="footer-bar">
        <span>© {new Date().getFullYear()} {personal.name}</span>
        {import.meta.env.VITE_SOURCE_ARCHIVE && <a href={import.meta.env.VITE_SOURCE_ARCHIVE} download>{t('Descargar código fuente')}</a>}
        <a href="#inicio">{t('Volver arriba')}</a>
      </div>
    </div>
  </footer>
}

export default function App() {
  const { t } = useLanguage()
  const scope = useRef<HTMLDivElement>(null)
  usePortfolioMotion(scope)
  usePointerEffects(scope)
  return <div ref={scope}>
    <a className="skip-link" href="#contenido">{t('Saltar al contenido')}</a>
    <Header/>
    <main id="contenido">
      <Hero/>
      <Projects/>
      <About/>
      <Resume/>
    </main>
    <Contact/>
  </div>
}
