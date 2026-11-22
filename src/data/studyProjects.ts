import type { Project } from './projects'

const github = 'https://github.com/rafaosunaa/'

export const studyProjects: Project[] = [
  {
    id: 'packet-tracer', title: 'Diseño y simulación de redes Cisco', category: 'Sistemas y redes', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Configuración de switches y simulación de topologías en Cisco Packet Tracer. El repositorio incluye las memorias y los archivos .pkt de las prácticas.',
    technologies: ['Cisco', 'Packet Tracer'], github: github + 'Network-Planning-and-Administration-ASIR',
    resource: { label: 'Ver práctica de switching', url: github + 'Network-Planning-and-Administration-ASIR/blob/main/Practica1Cisco/PracticaCisco1-RafaelOsunaVentura.pdf' },
  },
  {
    id: 'servicios-red', title: 'Servicios de red e Internet', category: 'Sistemas y redes', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Instalación y configuración de servicios de red, desde la asignación de direcciones y la resolución de nombres hasta el acceso remoto.',
    examples: ['DNS con BIND9 y zonas de búsqueda directa e inversa.', 'Prácticas de DHCP, correo, HTTP, SSH y análisis de tráfico con Wireshark.', 'Laboratorios de clúster en Debian y Windows Server.'],
    technologies: ['BIND9', 'DHCP', 'SSH', 'Wireshark'], github: github + 'Network-and-Internet-Services-ASIR',
  },
  {
    id: 'admin-sistemas', title: 'Administración de sistemas y almacenamiento', category: 'Sistemas y redes', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Administración de usuarios, virtualización y almacenamiento compartido en entornos de laboratorio.',
    examples: ['Directorio y gestión de usuarios con Active Directory.', 'Máquinas virtuales con KVM, RAID en Windows y Ubuntu y laboratorios NAS con Raspberry Pi y FreeNAS.'],
    technologies: ['Active Directory', 'KVM', 'RAID', 'Raspberry Pi', 'FreeNAS'], github: github + 'Operating-Systems-Administration-ASIR',
  },
  {
    id: 'implantacion-web', title: 'Implantación de aplicaciones web', category: 'Web', artwork: 'agriculture', context: 'Prácticas ASIR',
    description: 'Prácticas de personalización de WordPress y pequeños ejercicios en PHP que conectan la web con una base de datos para consultar y presentar registros.',
    technologies: ['WordPress', 'PHP', 'Bases de datos'], github: github + 'Deployment-of-web-applications-ASIR',
  },
  {
    id: 'lenguajes-marcas', title: 'Interfaces y lenguajes de marcas', category: 'Web', artwork: 'agriculture', context: 'Prácticas ASIR',
    description: 'Colección de ejercicios de HTML, CSS, XML y JavaScript. Incluye un visor de imágenes y una práctica de tres en raya.',
    technologies: ['HTML', 'CSS', 'XML', 'JavaScript'], github: github + 'Markup-Language-ASIR',
  },
  {
    id: 'gestion-bbdd', title: 'Modelado y consulta de bases de datos', category: 'Sistemas y redes', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Ejercicios de diseño entidad-relación, normalización y consultas SQL.',
    technologies: ['SQL', 'Modelo entidad-relación', 'Normalización'], github: github + 'Database-management-ASIR',
  },
  {
    id: 'admin-bbdd', title: 'Administración de bases de datos', category: 'Sistemas y redes', artwork: 'network', context: 'Prácticas ASIR',
    description: 'Prácticas avanzadas de SQL con procedimientos almacenados y disparadores para automatizar tareas dentro de la base de datos.',
    technologies: ['SQL', 'Procedimientos almacenados', 'Disparadores'], github: github + 'Administration-of-database-management-systems-ASIR',
  },
  {
    id: 'hardware', title: 'Hardware, RAID y presupuesto de un PC', category: 'Sistemas y redes', artwork: 'blueprint', context: 'Prácticas ASIR',
    description: 'Prácticas sobre presupuestos de equipos, servidores de almacenamiento, RAID, puertas lógicas y uso del multímetro.',
    technologies: ['Hardware', 'RAID', 'Almacenamiento'], github: github + 'Hardware-Fundamentals-ASIR',
  },
  {
    id: 'ensamblador', title: 'Arquitectura de computadores con el 8085', category: 'Software', artwork: 'blueprint', context: 'Prácticas universitarias',
    description: 'Ejercicios de programación en ensamblador y simulación para estudiar cómo ejecuta instrucciones un microprocesador Intel 8085.',
    technologies: ['Ensamblador', 'Intel 8085', 'Simulación'], github: github + 'Assembly-language-8085-Computer-Architecture',
  },
  {
    id: 'fundamentos-c', title: 'Fundamentos de programación en C', category: 'Software', artwork: 'connect', context: 'Prácticas universitarias',
    description: 'Colección de ejercicios que recorre estructuras de control, funciones, tipos de datos, punteros, memoria dinámica y recursividad.',
    technologies: ['C', 'Punteros', 'Memoria dinámica', 'Recursividad'], github: github + 'Fundamentals-of-Programming-in-C',
  },
  {
    id: 'emprendimiento', title: 'BOSS · Proyecto de emprendimiento', category: 'Otros', artwork: 'blueprint', context: 'Proyecto ASIR',
    description: 'Propuesta académica de negocio para un local de ocio en Córdoba, con análisis de mercado y una propuesta de organización del espacio.',
    technologies: ['Plan de empresa', 'Análisis de mercado'], github: github + 'Business-and-entrepreneurship-ASIR',
  },
]
