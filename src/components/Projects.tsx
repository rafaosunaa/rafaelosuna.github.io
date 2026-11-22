import { assetUrl } from '../assets'
import { useEffect, useRef, useState } from 'react'
import { CirclePlus, CodeXml, FileText, GitFork, Play, Search, X } from 'lucide-react'
import { categories, projects } from '../data/projects'
import type { Category, Project } from '../data/projects'
import { ProjectArtwork } from './Artwork'

const filters = ['Todos', ...categories] as const
const featured = projects.filter(project => project.featured)

function searchable(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function ProjectMeta({ project }: { project: Project }) {
  return <span className="project-meta">{project.category}{project.context && ` · ${project.context}`}</span>
}

function Media({ project }: { project: Project }) {
  if (project.image) {
    return <img className="project-image" loading="lazy" decoding="async" src={assetUrl(project.image.src)} alt={project.image.alt} />
  }
  return <ProjectArtwork kind={project.artwork} />
}

export function Projects() {
  const [category, setCategory] = useState<Category | 'Todos'>('Todos')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const terms = searchable(query.trim()).split(/\s+/).filter(Boolean)
  const visible = projects.filter(project => {
    if (category !== 'Todos' && project.category !== category) return false
    if (!terms.length) return true
    const text = searchable([project.title, project.category, project.context, project.description, ...project.technologies, ...(project.examples ?? [])].join(' '))
    return terms.every(term => text.includes(term))
  })

  function openProject(project: Project, button: HTMLButtonElement) {
    trigger.current = button
    setSelected(project)
  }

  useEffect(() => {
    if (!selected || !dialog.current) return
    dialog.current.showModal()
    document.body.classList.add('dialog-open')
    return () => {
      document.body.classList.remove('dialog-open')
    }
  }, [selected])

  return (
    <section className="work dark-section" id="proyectos" aria-labelledby="work-title">
      <div className="shell">
        <p className="eyebrow"><span className="section-mark"/> Portafolio</p>
        <div className="work-heading">
          <h2 id="work-title">Proyectos<span className="accent">.</span></h2>
          <a href="#catalogo" className="pill" data-magnetic>Ver todos los proyectos</a>
        </div>
        <div className="work-grid" aria-label="Proyectos destacados">
          {featured.map(project => (
            <article key={project.id} className="project">
              <button type="button" className="project-trigger" aria-label={`Ver destacado: ${project.title}`} onClick={event => openProject(project, event.currentTarget)}>
                <div className="art-wrap">
                  <Media project={project} />
                  {!project.image && <span className="art-caption">Ilustración conceptual</span>}
                  <span className="project-open" aria-hidden="true"><CirclePlus size={23} strokeWidth={1.4}/></span>
                </div>
                <ProjectMeta project={project}/>
                <span className="project-name">{project.title}</span>
              </button>
            </article>
          ))}
        </div>
        <section className="catalog" id="catalogo" aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <h3 id="catalog-title">Todos los proyectos</h3>
            <label className="catalog-search">
              <Search size={18} aria-hidden="true"/>
              <input type="search" placeholder="Buscar proyectos" value={query} onChange={event => setQuery(event.currentTarget.value)} />
              <span className="sr-only">Buscar proyectos</span>
            </label>
          </div>
          <div className="filters" role="group" aria-label="Filtrar proyectos">
            {filters.map(filter => <button type="button" key={filter} aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>)}
          </div>
          <p className="catalog-count" role="status">{visible.length} {visible.length === 1 ? 'proyecto' : 'proyectos'}</p>
          {visible.length > 0 ? <ul className="catalog-list">
            {visible.map(project => <li key={project.id}>
              <button type="button" className="catalog-entry" onClick={event => openProject(project, event.currentTarget)}>
                <span>
                  <ProjectMeta project={project}/>
                  <span className="catalog-name">{project.title}</span>
                </span>
                <CirclePlus size={22} strokeWidth={1.4} aria-hidden="true"/>
              </button>
            </li>)}
          </ul> : <div className="catalog-empty">
            <p>No hay proyectos que coincidan con la búsqueda.</p>
            <button type="button" className="pill" onClick={() => { setCategory('Todos'); setQuery('') }}>Restablecer filtros</button>
          </div>}
        </section>
      </div>
      <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} onClose={() => { setSelected(null); trigger.current?.focus() }}>
        {selected && <div className="dialog-content">
          <button type="button" className="dialog-close" aria-label="Cerrar proyecto" autoFocus onClick={() => dialog.current?.close()}><X size={22}/></button>
          <figure className="dialog-art">
            <Media project={selected}/>
            {(!selected.image || selected.image.caption) && <figcaption className="art-caption">{selected.image?.caption ?? 'Ilustración conceptual'}</figcaption>}
          </figure>
          <div className="dialog-body">
            <p className="eyebrow">{selected.category}{selected.context && ` · ${selected.context}`}</p>
            <h3 id="project-dialog-title">{selected.title}</h3>
            <p>{selected.description}</p>
            {selected.examples?.length ? <ul className="project-examples">{selected.examples.map(example => <li key={example}>{example}</li>)}</ul> : null}
            {selected.technologies.length > 0 && <ul className="tags">{selected.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>}
            {selected.video && <video controls preload="none" src={assetUrl(selected.video)}><a href={assetUrl(selected.video)}>Descargar vídeo</a></video>}
            <div className="link-row">
              {selected.github && <a href={selected.github} className="pill"><GitFork size={17}/> Repositorio</a>}
              {selected.resource && <a href={selected.resource.url} className="pill"><FileText size={17}/> {selected.resource.label}</a>}
              {selected.walkthrough && <a href={selected.walkthrough} className="pill"><Play size={17}/> Ver vídeo</a>}
              {selected.demo && <a href={selected.demo} className="pill"><CodeXml size={17}/> Demo</a>}
            </div>
          </div>
        </div>}
      </dialog>
    </section>
  )
}
