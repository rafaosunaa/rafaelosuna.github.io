export interface Milestone {
  title: string
  organization?: string
  date?: string
  description?: string
  responsibilities?: string[]
}

export const experience: Milestone[] = [
  {
    title: 'Técnico de reparación y mantenimiento informático',
    organization: 'Profesional autónomo',
    date: '2019 – Actualidad',
    responsibilities: [
      'Diagnóstico, reparación y mantenimiento de hardware y software para particulares.',
      'Instalación y configuración de Windows, Linux y controladores. Limpieza, optimización y actualización de equipos.',
      'Gestión y seguimiento de incidencias con los clientes hasta su resolución.',
    ],
  },
  {
    title: 'Desarrollador Web Full Stack',
    organization: 'APPSUR',
    date: '2018 – 2019',
    responsibilities: [
      'Gestión de proyectos web en WordPress desde la toma de requisitos hasta el lanzamiento.',
      'Desarrollo con HTML, CSS y JavaScript en el frontend, y PHP, plugins y MySQL en el backend.',
      'Mantenimiento y soporte técnico después del lanzamiento.',
    ],
  },
]

export const volunteering: Milestone[] = [
  { title: 'Tutor · Buddy Program', organization: 'Universidad de Jaén', date: '2021 – 2025', description: 'Apoyo y orientación a estudiantes internacionales.' },
]
