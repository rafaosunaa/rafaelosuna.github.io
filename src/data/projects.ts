import { studyProjects } from './studyProjects'

export type Artwork = 'greenhouse' | 'robot' | 'connect' | 'flappy' | 'solar' | 'network' | 'unity' | 'agriculture' | 'blueprint'
export const categories = ['Software', 'Web', 'Sistemas y redes', 'Seguridad', 'Domótica', 'Robótica', 'Videojuegos', 'Otros'] as const
export type Category = typeof categories[number]

export interface Project {
  id: string
  title: string
  category: Category
  description: string
  technologies: string[]
  artwork: Artwork
  featured?: boolean
  context?: string
  examples?: string[]
  image?: { src: string; alt: string; caption?: string }
  video?: string
  walkthrough?: string
  github?: string
  demo?: string
  resource?: { label: string; url: string }
}

const github = 'https://github.com/rafaosunaa/'

export const projects: Project[] = [
  {
    id: 'gestion-agricola', title: 'Gestión agrícola por Telegram', category: 'Software', artwork: 'agriculture', featured: true, context: 'Proyecto privado',
    description: 'Mini App de Telegram para registrar jornadas de campo y centralizar la gestión de los partes diarios.',
    examples: ['Registro y corrección de partes por parte de los trabajadores.', 'Gestión de altas y permisos, consulta de horas y generación de partes en PDF.', 'Recordatorios por Telegram e integración con Google Drive.'],
    technologies: ['Python', 'Telegram Mini Apps', 'Google Drive', 'PDF'],
  },
  {
    id: 'invernadero', title: 'Domótica de invernadero', category: 'Domótica', artwork: 'greenhouse', featured: true,
    description: 'Sistema automatizado con Arduino para supervisar y controlar la temperatura, la humedad, el riego y la iluminación de un invernadero desde la web y una aplicación móvil.',
    technologies: ['Arduino', 'Sensores', 'Aplicación web', 'Aplicación móvil'], github: github + 'Automated-Greenhouse-Project',
  },
  {
    id: 'lego-ev3', title: 'Robot de reparto LEGO EV3', category: 'Robótica', artwork: 'robot', featured: true, context: 'Proyecto en equipo',
    description: 'Robot autónomo de entrega de paquetes programado en Java, con planificación de rutas mediante búsqueda en anchura y seguimiento de colores.',
    technologies: ['LEGO Mindstorms EV3', 'Java', 'BFS'], github: github + 'LegoEv3-FollowRoute-DeliverPackages', walkthrough: 'https://youtu.be/USjFG8ZzcyE',
  },
  {
    id: 'solar-system', title: 'Solar System Explorer', category: 'Software', artwork: 'solar', featured: true,
    description: 'Simulación 3D del sistema solar con control de cámara, vistas simultáneas, selección de planetas e interacción con un satélite.',
    technologies: ['OpenGL', 'C++'], github: github + 'Solar-System-Explorer-OpenGL', walkthrough: 'https://youtu.be/zb7eA66MRnI',
  },
  {
    id: 'cableado', title: 'Cableado estructurado para un edificio de oficinas', category: 'Sistemas y redes', artwork: 'blueprint', context: 'Proyecto ASIR',
    description: 'Diseño sobre plano de la red de voz, datos y Wi‑Fi de un edificio de oficinas de tres plantas. El dossier traduce los requisitos del edificio en una propuesta de infraestructura con memoria, pliego y presupuesto.',
    examples: ['Ubicación de los recintos de telecomunicaciones y las tomas de usuario.', 'Recorridos de cableado horizontal y troncal y planificación de puntos de acceso Wi‑Fi.', 'Selección de materiales y elaboración del presupuesto.'],
    technologies: ['Cableado estructurado', 'Planos de planta', 'Wi‑Fi', 'Presupuesto'],
    image: { src: '/plano-cableado-asir.webp', alt: 'Plano de la planta baja con los recorridos del cableado, las tomas terminales y los recintos de telecomunicaciones.', caption: 'Plano original del dossier de ASIR' },
    github: github + 'Network-Planning-and-Administration-ASIR',
    resource: { label: 'Ver planos y memoria', url: github + 'Network-Planning-and-Administration-ASIR/blob/main/Structured_Cabling_Projec_Two-Story%20Building.pdf' },
  },
  {
    id: 'domotica-hogar', title: 'Domótica para el hogar', category: 'Domótica', artwork: 'blueprint', context: 'Recursos pendientes',
    description: 'Trabajos de automatización doméstica con Raspberry Pi y Arduino, con distintos sensores y alarmas.',
    technologies: ['Raspberry Pi', 'Arduino', 'Sensores', 'Alarmas'],
  },
  {
    id: 'webs', title: 'Proyectos de desarrollo web', category: 'Web', artwork: 'agriculture', context: 'Enlaces pendientes',
    description: 'Selección de páginas web realizadas. Los detalles y enlaces se incorporarán a medida que estén disponibles.',
    technologies: [],
  },
  {
    id: 'connect-4', title: 'Connect 4 con IA', category: 'Videojuegos', artwork: 'connect',
    description: 'Jugador automático de Conecta 4 en Java. Evalúa las posiciones del tablero y elige la jugada mediante Minimax con poda alfa-beta.',
    technologies: ['Java', 'Minimax', 'Poda alfa-beta'], github: github + 'IA-Player-for-Line-Up-4',
  },
  {
    id: 'flappy-ia', title: 'Flappy Bird con IA', category: 'Videojuegos', artwork: 'flappy',
    description: 'Experimento de neuroevolución en JavaScript que compara variantes de cruce y mutación para aprender a esquivar obstáculos.',
    technologies: ['JavaScript', 'HTML Canvas', 'Algoritmos genéticos'], github: github + 'Flappy-Bird-AI-Genetic-Algorithms',
  },
  {
    id: 'qualityfood', title: 'QualityFood', category: 'Software', artwork: 'connect', context: 'Modelado académico',
    description: 'Diseño de una aplicación móvil sobre alimentación. Las memorias y modelos describen los casos de uso de escaneo de productos, registro nutricional y recetas.',
    technologies: ['Modelado de software', 'Casos de uso'], github: github + 'QualityFood-App-Software-Design-Project',
  },
  {
    id: 'redes', title: 'Seguridad y alta disponibilidad', category: 'Seguridad', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Colección de prácticas sobre protección de sistemas y continuidad del servicio.',
    examples: ['Copias de seguridad y gestión de contraseñas.', 'Virtualización, cortafuegos y arquitectura de alta disponibilidad.'],
    technologies: ['Copias de seguridad', 'Firewalls', 'Virtualización'], github: github + 'Security-and-High-Availability-ASIR',
  },
  ...studyProjects,
  {
    id: 'unity', title: 'Remake de Tomb Raider', category: 'Videojuegos', artwork: 'unity', context: 'Ficha pendiente',
    description: 'Proyecto desarrollado con Unity y C#. Ficha y recursos pendientes de completar.',
    technologies: ['Unity', 'C#'],
  },
  {
    id: 'otro-videojuego', title: 'Videojuego pendiente de publicar', category: 'Videojuegos', artwork: 'unity', context: 'Publicación pendiente',
    description: 'Proyecto de videojuego adicional. El título, los detalles y los recursos se añadirán al preparar su publicación.',
    technologies: [],
  },
]
