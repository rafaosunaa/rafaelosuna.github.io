export interface Personal {
  name: string
  headline: [string, string]
  role: string
  disciplines: string
  tagline: string
  aboutHeadline: string
  bio: string
  interests: string[]
  location: string
  email?: string
  github?: string
  linkedin?: string
  cv?: string
  photo?: string
}

export const personal: Personal = {
  name: 'Rafael Osuna Ventura',
  headline: ['Rafael', 'Osuna Ventura'],
  role: 'Técnico Superior en ASIR y estudiante de Ingeniería Informática.',
  disciplines: 'Software · Sistemas · Ciberseguridad',
  tagline: 'Construir empieza por entender.',
  aboutHeadline: 'De la infraestructura al código.',
  bio: 'Me muevo entre el desarrollo de software, la administración de sistemas y la ciberseguridad. Me interesa tanto escribir código como entender la infraestructura que lo sostiene y el hardware que lo hace posible.',
  interests: ['Desarrollo web', 'Sistemas y redes', 'Ciberseguridad', 'Hardware y mantenimiento'],
  location: 'Córdoba, España',
  email: 'rafaelosunaventura@gmail.com',
  github: 'https://github.com/rafaosunaa',
  linkedin: 'https://www.linkedin.com/in/rafael-osuna-ventura/',
  cv: '/rafael-osuna-ventura-cv.pdf',
}
