export interface SkillGroup {
  title: string
  items: string[]
}

export const skills: SkillGroup[] = [
  { title: 'Lenguajes de programación', items: ['C', 'C++', 'Java', 'JavaScript', 'PHP', 'Python', 'C#'] },
  { title: 'Desarrollo web', items: ['HTML5', 'CSS3', 'WordPress'] },
  { title: 'Sistemas operativos', items: ['Windows', 'Linux', 'macOS'] },
  { title: 'Redes', items: ['TCP/IP', 'Equipos Cisco', 'Servicios de red'] },
  { title: 'Ciberseguridad', items: ['Firewalls', 'VPN', 'Proxies', 'Virtualización', 'Alta disponibilidad'] },
  { title: 'Bases de datos', items: ['MySQL'] },
  { title: 'Herramientas de desarrollo', items: ['Git', 'GitHub', 'PowerShell', 'Shell Script', 'Unity'] },
  { title: 'Otras tecnologías', items: ['Arduino', 'Raspberry Pi', 'Lego EV3', 'OpenGL', 'Adobe Photoshop', 'Hardware y mantenimiento'] },
]
