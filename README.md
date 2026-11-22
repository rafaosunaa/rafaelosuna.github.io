# Rafael Osuna Ventura · Portfolio

Portfolio profesional y currículum interactivo en español. React, TypeScript y Vite generan un sitio estático. Tailwind aporta la base de estilos, Lucide los iconos y GSAP con ScrollTrigger coordina la entrada, los revelados y el paralaje.

## Ejecutar en local

Con Node.js 24 y npm, desde la raíz del proyecto:

```sh
npm ci
npm run dev
```

Abre la URL que muestre Vite. `npm run typecheck` comprueba los tipos. `npm run build` comprueba los tipos y genera `dist/`. `npm run preview` sirve esa compilación localmente.

## Dirección visual

- **Dennis Snellenberg.** Su tipografía protagonista, pantalla de saludo, transiciones enmascaradas y previsualización al pasar por los proyectos marcaron la jerarquía. Aquí se traducen en una composición asimétrica marfil y verde bosque, un contador breve con salida enmascarada y un catálogo visual de acceso directo. [Portfolio](https://dennissnellenberg.com/)
- **Bruno Simon.** El espacio 3D de conducción convierte el descubrimiento de contenido en una interacción física. Esta versión usa una esfera original de líneas proyectadas con desplazamiento sutil al mover el puntero. El efecto funciona con SVG y CSS. [Portfolio](https://bruno-simon.com/)
- **Robby Leonardi.** Los niveles ilustrados conectan el desplazamiento con los bloques del currículum. Aquí esa progresión se convierte en capítulos con indicador activo, líneas temporales y categorías desplegables. [Currículum interactivo](https://www.rleonardi.com/interactive-resume/)

La interfaz usa scroll nativo y respeta `prefers-reduced-motion`. Los efectos dependientes del puntero se limitan a ratón y pantallas compatibles. Las fichas usan el diálogo nativo, con cierre por Escape y retorno del foco a la tarjeta.

## Editar contenido

| Archivo | Contenido |
| --- | --- |
| `src/data/personal.ts` | Presentación, ubicación, intereses, redes, correo y rutas del CV y foto |
| `src/data/projects.ts` | Destacados, otros proyectos, categorías, tecnologías, imágenes, vídeos y enlaces |
| `src/data/studyProjects.ts` | Prácticas de ASIR y de la universidad |
| `src/data/experience.ts` | Experiencia y voluntariado |
| `src/data/education.ts` | Formación académica y complementaria |
| `src/data/certifications.ts` | Certificaciones y cursos |
| `src/data/skills.ts` | Habilidades agrupadas por categoría |

Guarda los archivos locales en `public/` y usa una ruta que empiece por `/`. Para añadir una fotografía, asigna la ruta a `photo` en `personal.ts`. El CV incluido es una copia del PDF facilitado con el teléfono eliminado. Si lo sustituyes, revisa los datos de contacto de la nueva copia antes de añadirla a `public/`.

Puedes asignar `image: { src, alt }` al proyecto, `video` a un vídeo reproducible por el navegador y `github` o `demo` a enlaces verificados. Mientras falte una imagen, la tarjeta muestra su ilustración conceptual. El catálogo se genera a partir de ambos archivos. Marca `featured: true` para destacar un proyecto al principio de la sección. Las categorías disponibles están en `categories` y los identificadores deben ser únicos.

Los componentes de proyectos y currículum están en `src/components/`. Los hooks de animación están en `src/components/Motion.tsx`. Añade `data-reveal` a un bloque para reutilizar la entrada al hacer scroll y `data-magnetic` a un control para aplicar el desplazamiento de puntero. Los estilos están en `src/styles/main.css`.

## GitHub Pages

1. Crea el repositorio `rafaelosuna.github.io` en la cuenta `rafaosunaa` y sube estos archivos a `main`.
2. En **Settings → Pages → Build and deployment**, selecciona **GitHub Actions** como origen.
3. Ejecuta **Publicar en GitHub Pages** desde **Actions** o sube un cambio a `main`. El workflow compila con Node.js 24 y publica `dist/`.
4. Abre `https://rafaosunaa.github.io/rafaelosuna.github.io/` tras completarse el despliegue.

Vite usa `base: '/rafaelosuna.github.io/'` porque el portfolio se publica como sitio de proyecto. El workflow está en `.github/workflows/pages.yml`.
