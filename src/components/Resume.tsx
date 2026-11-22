import { useLanguage } from '../language'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { experience, volunteering } from '../data/experience'
import type { Milestone } from '../data/experience'
import { education } from '../data/education'
import { certifications } from '../data/certifications'
import { skills } from '../data/skills'

const chapters = [
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'formacion', label: 'Formación' },
  { id: 'habilidades', label: 'Habilidades' },
]

function Timeline({ items }: { items: Milestone[] }) {
  const { t } = useLanguage()
  return <ol className="timeline">{items.map(item => (
    <li key={item.title}>
      {item.date && <p className="eyebrow milestone-date">{t(item.date)}</p>}
      <h4>{t(item.title)}</h4>
      {item.organization && <p className="organization">{t(item.organization)}</p>}
      {item.description && <p>{t(item.description)}</p>}
      {item.responsibilities && <ul>{item.responsibilities.map(responsibility => <li key={responsibility}>{t(responsibility)}</li>)}</ul>}
    </li>
  ))}</ol>
}

export function Resume() {
  const { t } = useLanguage()
  const [active, setActive] = useState(chapters[0].id)
  useEffect(() => {
    const sections = chapters.map(({ id }) => document.getElementById(id)).filter((item): item is HTMLElement => Boolean(item))
    let frame = 0

    function updateChapter() {
      frame = 0
      const boundary = window.innerHeight * .4
      const chapter = sections.reduce((current, section) =>
        section.getBoundingClientRect().top <= boundary ? section.id : current,
      chapters[0].id)
      setActive(chapter)
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateChapter)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  return (
    <section id="trayectoria" className="resume" aria-labelledby="resume-title">
      <div className="shell">
        <p className="eyebrow"><span className="section-mark"/> {t('Currículum')}</p>
        <h2 id="resume-title" data-reveal>{t('Trayectoria')}<span className="accent">.</span></h2>
        <div className="resume-layout">
          <nav className="chapter-nav" aria-label={t('Capítulos del currículum')}>
            {chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined}><span/>{t(chapter.label)}</a>)}
          </nav>
          <div className="resume-content">
            <section id="experiencia" data-reveal>
              <h3>{t('Experiencia')}</h3>
              <Timeline items={[...experience, ...volunteering]}/>
            </section>
            <section id="formacion" data-reveal>
              <h3>{t('Formación')}</h3>
              <Timeline items={education}/>
              {certifications.length > 0 && <details className="accordion">
                <summary>{t("Certificaciones y cursos")} <Plus size={19}/></summary>
                <ul>{certifications.map(item => <li key={item.title}>{t(item.title)}{item.organization && ` · ${t(item.organization)}`}</li>)}</ul>
              </details>}
            </section>
            <section id="habilidades" data-reveal>
              <h3>{t('Habilidades')}</h3>
              <div className="skill-list">
                {skills.filter(skill => skill.items.length).map(skill => <details className="accordion" key={skill.title}>
                  <summary>{t(skill.title)}<Plus size={19}/></summary>
                  <ul className="tags">{skill.items.map(item => <li key={item}>{t(item)}</li>)}</ul>
                </details>)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
