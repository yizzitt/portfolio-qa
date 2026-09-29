import '../style.css'

/* =====================================================
   Scroll progress
   ===================================================== */
const progress = document.createElement('div')
progress.className = 'scroll-progress'
progress.setAttribute('aria-hidden', 'true')
document.body.prepend(progress)

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`
}
window.addEventListener('scroll', updateProgress, { passive: true })
updateProgress()

/* =====================================================
   Reveal on scroll
   ===================================================== */
const revealItems = document.querySelectorAll(
  'main section, #proyectos article, #experiencia article, #educacion > div > div'
)

revealItems.forEach((el, index) => {
  el.classList.add('reveal-on-scroll')
  el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`)
})

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      obs.unobserve(entry.target)
    })
  }, { threshold: 0.1 })

  revealItems.forEach(el => observer.observe(el))
} else {
  revealItems.forEach(el => el.classList.add('is-visible'))
}

/* =====================================================
   Active navigation
   The active item follows the section that is actually in view.
   Clicking a nav item marks it immediately; scrolling then updates
   the active item based on the visible section.
   ===================================================== */
const navLinks = [...document.querySelectorAll('nav a[href^="#"]:not(.nav-brand)')]
const sections = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean)

let clickedNavTarget = null
let clickedNavLockUntil = 0

const setActiveLink = sectionId => {
  navLinks.forEach(link => {
    link.classList.toggle('nav-active', link.getAttribute('href') === `#${sectionId}`)
  })
}

const clearActiveLink = () => {
  navLinks.forEach(link => link.classList.remove('nav-active'))
}

const getSectionInView = () => {
  const viewportAnchor = Math.min(window.innerHeight * 0.34, 260)
  let current = null
  let bestDistance = Number.POSITIVE_INFINITY

  sections.forEach(section => {
    const rect = section.getBoundingClientRect()
    const visible = rect.bottom > 0 && rect.top < window.innerHeight
    if (!visible) return

    const distance = Math.abs(rect.top - viewportAnchor)
    if (rect.top <= viewportAnchor && distance < bestDistance) {
      bestDistance = distance
      current = section
    }
  })

  if (!current) {
    const firstVisible = sections.find(section => {
      const rect = section.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < window.innerHeight
    })
    current = firstVisible || null
  }

  return current
}

const syncActiveNav = () => {
  if (clickedNavTarget && Date.now() < clickedNavLockUntil) {
    setActiveLink(clickedNavTarget.id)
    return
  }

  clickedNavTarget = null
  const current = getSectionInView()
  if (current) setActiveLink(current.id)
  else clearActiveLink()
}

let syncScheduled = false
const scheduleActiveNavSync = () => {
  if (syncScheduled) return
  syncScheduled = true
  requestAnimationFrame(() => {
    syncScheduled = false
    syncActiveNav()
  })
}

window.addEventListener('scroll', scheduleActiveNavSync, { passive: true })
window.addEventListener('resize', scheduleActiveNavSync)
scheduleActiveNavSync()

/* =====================================================
   Section focus mode
   Only activates after an explicit click on the top navigation.
   The selected section stays sharp while the rest of the page
   receives a subtle blur/fade treatment.
   ===================================================== */
/* =====================================================
   Section focus mode
   Only activates after an explicit click on the top navigation.
   The selected section stays sharp while the rest of the page
   receives a subtle blur/fade treatment.
   ===================================================== */
const focusTargets = [
  document.querySelector('header'),
  ...document.querySelectorAll('main section'),
  document.querySelector('footer')
].filter(Boolean)

const clearSectionFocus = () => {
  document.body.classList.remove('section-focus-mode')
  focusTargets.forEach(el => {
    el.classList.remove('section-focus-active', 'section-focus-dim')
  })
}

const activateSectionFocus = (section) => {
  document.body.classList.add('section-focus-mode')
  focusTargets.forEach(el => {
    const active = el === section
    el.classList.toggle('section-focus-active', active)
    el.classList.toggle('section-focus-dim', !active)
  })
}

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'))
    if (!target) return

    event.preventDefault()
    clickedNavTarget = target
    clickedNavLockUntil = Date.now() + 900
    setActiveLink(target.id)
    activateSectionFocus(target)
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

const navBrand = document.querySelector('.nav-brand')
navBrand?.addEventListener('click', event => {
  event.preventDefault()
  clearSectionFocus()
  clickedNavTarget = null
  clickedNavLockUntil = 0
  clearActiveLink()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    clearSectionFocus()
    return
  }

  // Manual keyboard scrolling also returns the page to its normal state.
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(event.key)) {
    clearSectionFocus()
  }
})

// Only explicit user scrolling clears the section-focus effect.
// We intentionally do not listen to the generic `scroll` event here,
// so the smooth scroll triggered by clicking a nav item does not
// immediately cancel the focus state.
window.addEventListener('wheel', () => clearSectionFocus(), { passive: true })
window.addEventListener('touchstart', () => clearSectionFocus(), { passive: true })

/* =====================================================
   Complete bilingual text map
   Each key is the original source string in the HTML.
   Every visible string that needs translation has an ES and EN form.
   Technical names, product names, brands and SQL keywords remain intact.
   ===================================================== */
const translations = {
  'QA TESTER JUNIOR': ['QA TESTER JUNIOR', 'QA TESTER JUNIOR'],
  'QA Manual · Pruebas Funcionales · API Testing · SQL · Jira': ['QA Manual · Pruebas Funcionales · API Testing · SQL · Jira', 'Manual QA · Functional Testing · API Testing · SQL · Jira'],
  'QA Tester con experiencia práctica en pruebas funcionales web y móviles, diseño de casos de prueba, análisis de requisitos, API Testing, SQL y documentación de defectos.': ['QA Tester con experiencia práctica en pruebas funcionales web y móviles, diseño de casos de prueba, análisis de requisitos, API Testing, SQL y documentación de defectos.', 'QA Tester with hands-on experience in web and mobile functional testing, test case design, requirements analysis, API testing, SQL, and defect documentation.'],
  'run': ['ejecutar', 'run'],
  'portfolio-tests': ['portfolio-tests', 'portfolio-tests'],
  'Functional testing': ['Pruebas funcionales', 'Functional testing'],
  'API testing': ['Pruebas de API', 'API testing'],
  'SQL validation': ['Validación de SQL', 'SQL validation'],
  'Bug reporting': ['Reporte de defectos', 'Bug reporting'],
  'PASS': ['APROBADO', 'PASS'],
  'READY': ['LISTO', 'READY'],
  'AVAILABLE FOR QA OPPORTUNITIES': ['DISPONIBLE PARA OPORTUNIDADES DE QA', 'AVAILABLE FOR QA OPPORTUNITIES'],
  'ENFOQUE': ['ENFOQUE', 'FOCUS'],
  'Manual Testing': ['Pruebas manuales', 'Manual testing'],
  'API Testing': ['Pruebas de API', 'API testing'],
  'SQL & Data Validation': ['SQL y validación de datos', 'SQL & Data Validation'],
  'Mobile Testing': ['Pruebas móviles', 'Mobile testing'],
  'Test Design': ['Diseño de pruebas', 'Test design'],

  'Sobre mí': ['Sobre mí', 'About me'],
  'Habilidades': ['Habilidades', 'Skills'],
  'Proyectos': ['Proyectos', 'Projects'],
  'Experiencia': ['Experiencia', 'Experience'],
  'Educación': ['Educación', 'Education'],
  'Contacto': ['Contacto', 'Contact'],
  'Oscuro': ['Oscuro', 'Dark'],
  'Idioma': ['Idioma', 'Language'],
  '🧑‍💻 Sobre mí': ['🧑‍💻 Sobre mí', '🧑‍💻 About me'],
  '🛠️ Habilidades': ['🛠️ Habilidades', '🛠️ Skills'],
  '🚀 Proyectos': ['🚀 Proyectos', '🚀 Projects'],
  '💼 Experiencia': ['💼 Experiencia', '💼 Experience'],
  '📜 Educación': ['📜 Educación', '📜 Education'],
  '📩 Contacto': ['📩 Contacto', '📩 Contact'],

  'Soy QA Tester Manual con formación especializada en Quality Assurance y experiencia práctica en pruebas funcionales web y móviles, diseño y ejecución de casos de prueba, análisis de requisitos, API Testing y documentación de defectos en Jira.': ['Soy QA Tester Manual con formación especializada en Quality Assurance y experiencia práctica en pruebas funcionales web y móviles, diseño y ejecución de casos de prueba, análisis de requisitos, API Testing y documentación de defectos en Jira.', 'I am a Manual QA Tester with specialized Quality Assurance training and hands-on experience in web and mobile functional testing, test case design and execution, requirements analysis, API testing, and defect documentation in Jira.'],
  'También cuento con conocimientos en bases de datos y SQL para consulta y validación de información, además de experiencia con Postman, REST, HTTP, JSON, Android Studio, Termius, Cygwin, GitHub y Figma.': ['También cuento con conocimientos en bases de datos y SQL para consulta y validación de información, además de experiencia con Postman, REST, HTTP, JSON, Android Studio, Termius, Cygwin, GitHub y Figma.', 'I also have database and SQL knowledge for querying and validating information, along with experience using Postman, REST, HTTP, JSON, Android Studio, Termius, Cygwin, GitHub, and Figma.'],
  'Actualmente continúo desarrollando mis conocimientos hacia QA Automation y Python.': ['Actualmente continúo desarrollando mis conocimientos hacia QA Automation y Python.', 'I am currently continuing to develop my skills in QA Automation and Python.'],

  'Testing': ['Testing', 'Testing'],
  'Pruebas funcionales': ['Pruebas funcionales', 'Functional testing'],
  'Pruebas no funcionales': ['Pruebas no funcionales', 'Non-functional testing'],
  'Pruebas web': ['Pruebas web', 'Web testing'],
  'Pruebas móviles': ['Pruebas móviles', 'Mobile testing'],
  'API / REST': ['API / REST', 'API / REST'],
  'Pruebas positivas': ['Pruebas positivas', 'Positive testing'],
  'Pruebas negativas': ['Pruebas negativas', 'Negative testing'],
  'Casos de prueba': ['Casos de prueba', 'Test cases'],
  'Bug Reporting': ['Reporte de defectos', 'Bug reporting'],
  'Compatibilidad': ['Compatibilidad', 'Compatibility'],
  'Interrupciones': ['Interrupciones', 'Interruptions'],
  'Orientación': ['Orientación', 'Orientation'],
  'Conectividad': ['Conectividad', 'Connectivity'],
  'Permisos': ['Permisos', 'Permissions'],
  'Diseño de pruebas': ['Diseño de pruebas', 'Test design'],
  'Análisis de requisitos': ['Análisis de requisitos', 'Requirements analysis'],
  'Clases de equivalencia': ['Clases de equivalencia', 'Equivalence classes'],
  'Valores límite': ['Valores límite', 'Boundary values'],
  'Descomposición atómica': ['Descomposición atómica', 'Atomic decomposition'],
  'Escenarios de prueba': ['Escenarios de prueba', 'Test scenarios'],
  'Mapas mentales': ['Mapas mentales', 'Mind maps'],
  'Diagramas de flujo': ['Diagramas de flujo', 'Flowcharts'],
  'Metodologías': ['Metodologías', 'Methodologies'],
  'Priorización': ['Priorización', 'Prioritization'],
  'Bases de datos': ['Bases de datos', 'Databases'],
  'Validación de datos': ['Validación de datos', 'Data validation'],
  'Herramientas': ['Herramientas', 'Tools'],
  'Tecnologías': ['Tecnologías', 'Technologies'],
  'Filtros por fecha': ['Filtros por fecha', 'Date filters'],

  'MOBILE TESTING': ['PRUEBAS MÓVILES', 'MOBILE TESTING'],
  'API TESTING': ['PRUEBAS DE API', 'API TESTING'],
  'FUNCTIONAL TESTING': ['PRUEBAS FUNCIONALES', 'FUNCTIONAL TESTING'],
  'TEST DESIGN': ['DISEÑO DE PRUEBAS', 'TEST DESIGN'],
  'SQL · DATABASE TESTING': ['SQL · PRUEBAS DE BASES DE DATOS', 'SQL · DATABASE TESTING'],
  'Equivalence Classes': ['Clases de equivalencia', 'Equivalence classes'],
  'Boundary Values': ['Valores límite', 'Boundary values'],
  'Requirements': ['Requisitos', 'Requirements'],
  'Atomic Decomposition': ['Descomposición atómica', 'Atomic decomposition'],
  'Flowcharts': ['Diagramas de flujo', 'Flowcharts'],
  'Functional Testing': ['Pruebas funcionales', 'Functional Testing'],
  'Test Cases': ['Casos de prueba', 'Test Cases'],
  'Automated Testing': ['Pruebas automatizadas', 'Automated Testing'],
  'QA Automation': ['Automatización de QA', 'QA Automation'],
  'IN PROGRESS · QA AUTOMATION': ['EN CURSO · AUTOMATIZACIÓN DE QA', 'IN PROGRESS · QA AUTOMATION'],
  'EN CURSO · QA AUTOMATION': ['EN CURSO · QA AUTOMATION', 'IN PROGRESS · QA AUTOMATION'],

  'Urban.Lunch — Pruebas funcionales móviles': ['Urban.Lunch — Pruebas funcionales móviles', 'Urban.Lunch — Mobile functional testing'],
  'Problema:': ['Problema:', 'Problem:'],
  'Validar el flujo completo de una aplicación móvil de pedidos.': ['Validar el flujo completo de una aplicación móvil de pedidos.', 'Validate the complete flow of a mobile food-ordering application.'],
  'Qué hice:': ['Qué hice:', 'What I did:'],
  'Diseñé y ejecuté 86 casos de prueba mediante Android Studio en tres dispositivos Android con diferentes resoluciones. Realicé pruebas de llamadas entrantes, orientación, pérdida de conexión y permisos.': ['Diseñé y ejecuté 86 casos de prueba mediante Android Studio en tres dispositivos Android con diferentes resoluciones. Realicé pruebas de llamadas entrantes, orientación, pérdida de conexión y permisos.', 'Designed and executed 86 test cases using Android Studio on three Android devices with different resolutions. I tested incoming calls, orientation, connection loss, and permissions.'],
  'Resultado:': ['Resultado:', 'Result:'],
  'Identifiqué y documenté 7 defectos relacionados con interfaz, conservación de información, tiempos de entrega, entrega de platillos y permisos.': ['Identifiqué y documenté 7 defectos relacionados con interfaz, conservación de información, tiempos de entrega, entrega de platillos y permisos.', 'Identified and documented 7 defects related to UI, information retention, delivery times, order delivery, and permissions.'],
  'Ver proyecto Urban.Lunch Móvil →': ['Ver proyecto Urban.Lunch Móvil →', 'View Urban.Lunch Mobile project →'],
  'Ver proyecto Urban Routes API REST →': ['Ver proyecto Urban Routes API REST →', 'View Urban Routes REST API project →'],
  'Ver proyecto Urban Routes Web →': ['Ver proyecto Urban Routes Web →', 'View Urban Routes Web project →'],
  'Ver proyecto Urban Routes Diseño de Pruebas →': ['Ver proyecto Urban Routes Diseño de Pruebas →', 'View Urban Routes Test Design project →'],
  'Ver proyecto Urban Routes Mapa →': ['Ver proyecto Urban Routes Mapa →', 'View Urban Routes Map project →'],

  'Urban Routes — Pruebas de API REST': ['Urban Routes — Pruebas de API REST', 'Urban Routes — REST API testing'],
  'Validar el comportamiento de un endpoint REST mediante distintos escenarios de prueba.': ['Validar el comportamiento de un endpoint REST mediante distintos escenarios de prueba.', 'Validate the behavior of a REST endpoint through different test scenarios.'],
  'Diseñé y ejecuté casos para validar solicitudes POST, parámetros, cuerpos JSON, tipos de datos, límites, campos obligatorios y manejo de errores.': ['Diseñé y ejecuté casos para validar solicitudes POST, parámetros, cuerpos JSON, tipos de datos, límites, campos obligatorios y manejo de errores.', 'Designed and executed cases to validate POST requests, parameters, JSON bodies, data types, limits, required fields, and error handling.'],
  'Identifiqué y documenté defectos relacionados con validaciones incorrectas y respuestas inesperadas.': ['Identifiqué y documenté defectos relacionados con validaciones incorrectas y respuestas inesperadas.', 'Identified and documented defects related to incorrect validations and unexpected responses.'],

  'Urban Routes — Pruebas funcionales web': ['Urban Routes — Pruebas funcionales web', 'Urban Routes — Web functional testing'],
  'Validar el flujo de reserva, método de pago, validaciones, precio, temporizador y cancelación.': ['Validar el flujo de reserva, método de pago, validaciones, precio, temporizador y cancelación.', 'Validate the booking flow, payment method, validations, price, timer, and cancellation.'],
  'Ejecuté pruebas funcionales en Chrome y Firefox, comparé la interfaz con Figma y documenté defectos en Jira.': ['Ejecuté pruebas funcionales en Chrome y Firefox, comparé la interfaz con Figma y documenté defectos en Jira.', 'Executed functional tests in Chrome and Firefox, compared the interface with Figma, and documented defects in Jira.'],

  'Urban Routes — Diseño de pruebas': ['Urban Routes — Diseño de pruebas', 'Urban Routes — Test design'],
  'Analizar requisitos y diseñar una estrategia de pruebas para diferentes datos y escenarios.': ['Analizar requisitos y diseñar una estrategia de pruebas para diferentes datos y escenarios.', 'Analyze requirements and design a test strategy for different data and scenarios.'],
  'Trabajé con clases de equivalencia, valores límite, escenarios, descomposición atómica, mapas mentales y diagramas de flujo.': ['Trabajé con clases de equivalencia, valores límite, escenarios, descomposición atómica, mapas mentales y diagramas de flujo.', 'Worked with equivalence classes, boundary values, scenarios, atomic decomposition, mind maps, and flowcharts.'],

  'Urban Routes — Pruebas funcionales del mapa': ['Urban Routes — Pruebas funcionales del mapa', 'Urban Routes — Map functional testing'],
  'Diseñé y ejecuté 24 casos de prueba para validar navegación, zoom, búsqueda de direcciones, marcadores, objetos 3D, modos de visualización y Street View.': ['Diseñé y ejecuté 24 casos de prueba para validar navegación, zoom, búsqueda de direcciones, marcadores, objetos 3D, modos de visualización y Street View.', 'Designed and executed 24 test cases to validate navigation, zoom, address search, markers, 3D objects, viewing modes, and Street View.'],
  'Identifiqué y documenté 9 defectos con resultado esperado, resultado actual y severidad.': ['Identifiqué y documenté 9 defectos con resultado esperado, resultado actual y severidad.', 'Identified and documented 9 defects with expected result, actual result, and severity.'],

  'Chicago Taxi — SQL y análisis de datos': ['Chicago Taxi — SQL y análisis de datos', 'Chicago Taxi — SQL and data analysis'],
  'Consultar y analizar información de una base de datos relacionada con servicios de taxi.': ['Consultar y analizar información de una base de datos relacionada con servicios de taxi.', 'Query and analyze information from a database related to taxi services.'],
  'Realicé consultas utilizando SELECT, COUNT, GROUP BY, HAVING, CASE, filtros por fechas e INNER JOIN para analizar automóviles, compañías, condiciones climáticas y viajes.': ['Realicé consultas utilizando SELECT, COUNT, GROUP BY, HAVING, CASE, filtros por fechas e INNER JOIN para analizar automóviles, compañías, condiciones climáticas y viajes.', 'Performed queries using SELECT, COUNT, GROUP BY, HAVING, CASE, date filters, and INNER JOIN to analyze cars, companies, weather conditions, and trips.'],
  'Validé los resultados de los diferentes ejercicios del proyecto, incluyendo el conteo documentado de 5,529 automóviles.': ['Validé los resultados de los diferentes ejercicios del proyecto, incluyendo el conteo documentado de 5,529 automóviles.', 'Validated the results of the project exercises, including the documented count of 5,529 cars.'],
  'Ver proyecto SQL →': ['Ver proyecto SQL →', 'View SQL project →'],

  'Automatización de pruebas con Python': ['Automatización de pruebas con Python', 'Python test automation'],
  'Proyecto en desarrollo enfocado en aprender y aplicar Python para la automatización de pruebas dentro del área de Quality Assurance.': ['Proyecto en desarrollo enfocado en aprender y aplicar Python para la automatización de pruebas dentro del área de Quality Assurance.', 'A project in progress focused on learning and applying Python for test automation within Quality Assurance.'],
  'Objetivo:': ['Objetivo:', 'Goal:'],
  'Desarrollar conocimientos prácticos de programación y automatización de pruebas para complementar mi experiencia en QA Manual.': ['Desarrollar conocimientos prácticos de programación y automatización de pruebas para complementar mi experiencia en QA Manual.', 'Develop practical programming and test automation skills to complement my Manual QA experience.'],
  '🚧 Proyecto en desarrollo': ['🚧 Proyecto en desarrollo', '🚧 Project in progress'],

  '💼 Experiencia': ['💼 Experiencia', '💼 Experience'],
  'Empresa de diseño y producción de ropa deportiva.': ['Empresa de diseño y producción de ropa deportiva.', 'Sportswear design and production company.'],
  'Jefe de Workflow · 2024–2026:': ['Jefe de Workflow · 2024–2026:', 'Workflow Lead · 2024–2026:'],
  'liderazgo de asignación, priorización y seguimiento de tareas mediante Jira.': ['liderazgo de asignación, priorización y seguimiento de tareas mediante Jira.', 'leadership of task assignment, prioritization, and tracking through Jira.'],
  'Workflow · 2021–2024:': ['Workflow · 2021–2024:', 'Workflow · 2021–2024:'],
  'gestión y distribución de tareas, estados, prioridades y fechas de entrega.': ['gestión y distribución de tareas, estados, prioridades y fechas de entrega.', 'task management and distribution, status tracking, priorities, and delivery dates.'],
  'Diseñador Gráfico · 2019–2021:': ['Diseñador Gráfico · 2019–2021:', 'Graphic Designer · 2019–2021:'],
  'diseño y revisión de gráficos mediante Adobe Illustrator.': ['diseño y revisión de gráficos mediante Adobe Illustrator.', 'graphic design and review using Adobe Illustrator.'],
  'GNP · Agente de Seguros': ['GNP · Agente de Seguros', 'GNP · Insurance Agent'],
  'Atención y seguimiento de clientes, gestión de solicitudes, documentación y comunicación profesional.': ['Atención y seguimiento de clientes, gestión de solicitudes, documentación y comunicación profesional.', 'Client support and follow-up, request management, documentation, and professional communication.'],

  '📜 Educación': ['📜 Educación', '📜 Education'],
  'Bootcamp QA Engineer · 2026 · En curso': ['Bootcamp QA Engineer · 2026 · En curso', 'QA Engineer Bootcamp · 2026 · In progress'],
  'Ingeniería Robótica Computacional': ['Ingeniería Robótica Computacional', 'Computational Robotics Engineering'],
  'Técnico en Programación': ['Técnico en Programación', 'Programming Technician'],
  'Idiomas:': ['Idiomas:', 'Languages:'],
  'Español nativo · Inglés intermedio, con mayor dominio escrito.': ['Español nativo · Inglés intermedio, con mayor dominio escrito.', 'Native Spanish · Intermediate English, with stronger written proficiency.'],

  '📩 Contacto': ['📩 Contacto', '📩 Contact'],
  '📍 Mérida, Yucatán, México': ['📍 Mérida, Yucatán, México', '📍 Mérida, Yucatán, Mexico'],
  'Estoy abierto a nuevas oportunidades laborales en el área de Quality Assurance, especialmente en posiciones de QA Tester, QA Manual y API Testing.': ['Estoy abierto a nuevas oportunidades laborales en el área de Quality Assurance, especialmente en posiciones de QA Tester, QA Manual y API Testing.', 'I am open to new opportunities in Quality Assurance, especially QA Tester, Manual QA, and API Testing positions.'],

  'Email': ['Email', 'Email'],
  'WhatsApp': ['WhatsApp', 'WhatsApp'],
  'Freddy Ramírez Rede · QA Tester': ['Freddy Ramírez Rede · QA Tester', 'Freddy Ramírez Rede · QA Tester'],

  /* Web / portfolio skills */
  'Web / Frontend': ['Web / Frontend', 'Web / Frontend'],
  'HTML': ['HTML', 'HTML'],
  'CSS': ['CSS', 'CSS'],
  'JavaScript': ['JavaScript', 'JavaScript'],
  'Vite': ['Vite', 'Vite'],
  'Responsive Design': ['Diseño responsive', 'Responsive Design'],
  'Dark / Light Mode': ['Modo oscuro / claro', 'Dark / Light Mode'],
  'ES / EN Localization': ['Localización ES / EN', 'ES / EN Localization'],
  'LocalStorage': ['LocalStorage', 'LocalStorage'],
  'SVG Animations': ['Animaciones SVG', 'SVG Animations'],
  'GitHub Pages': ['GitHub Pages', 'GitHub Pages'],
  'GitHub Actions': ['GitHub Actions', 'GitHub Actions'],
  'ES / EN': ['ES / EN', 'ES / EN'],
  'SVG Animation': ['Animación SVG', 'SVG Animation'],

  /* Portfolio website project */
  'WEB / FRONTEND': ['WEB / FRONTEND', 'WEB / FRONT-END'],
  'Portafolio QA Web': ['Portafolio QA Web', 'QA Portfolio Website'],
  'Crear una plataforma personal para mostrar proyectos, habilidades y experiencia de QA de forma profesional y accesible.': ['Crear una plataforma personal para mostrar proyectos, habilidades y experiencia de QA de forma profesional y accesible.', 'Create a personal platform to showcase QA projects, skills, and experience in a professional and accessible way.'],
  'Desarrollé y mejoré el sitio con HTML, CSS, JavaScript y Vite. Implementé diseño responsive, modo oscuro / claro, traducción ES / EN, selector de idioma personalizado, preferencias con LocalStorage, navegación sticky, animaciones de scroll, iconos SVG animados y despliegue con GitHub Pages.': ['Desarrollé y mejoré el sitio con HTML, CSS, JavaScript y Vite. Implementé diseño responsive, modo oscuro / claro, traducción ES / EN, selector de idioma personalizado, preferencias con LocalStorage, navegación sticky, animaciones de scroll, iconos SVG animados y despliegue con GitHub Pages.', 'Built and improved the site with HTML, CSS, JavaScript, and Vite. Implemented responsive design, dark / light mode, ES / EN localization, a custom language selector, LocalStorage preferences, sticky navigation, scroll animations, animated SVG icons, and GitHub Pages deployment.'],
  'Portfolio bilingüe con cambio de tema, navegación adaptable, currículum visualizable y descargable, y microinteracciones para los botones sociales.': ['Portfolio bilingüe con cambio de tema, navegación adaptable, currículum visualizable y descargable, y microinteracciones para los botones sociales.', 'Bilingual portfolio with theme switching, responsive navigation, an embedded and downloadable resume, and microinteractions for social buttons.'],
  'Página actual': ['Página actual', 'Current page'],

  /* Resume */
  'Currículum': ['Currículum', 'Resume'],
  '📄 Currículum': ['📄 Currículum', '📄 Resume'],
  'Currículum profesional': ['Currículum profesional', 'Professional resume'],
  'Versión en español': ['Versión en español', 'Spanish version'],
  'Abrir PDF': ['Abrir PDF', 'Open PDF'],
  'Descargar PDF': ['Descargar PDF', 'Download PDF'],
  'Idiomas:': ['Idiomas:', 'Languages:'],

}

const normalize = value => value.replace(/\s+/g, ' ').trim()

/* Save the exact source text once. This makes ES ⇄ EN deterministic. */
const textNodes = []
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
let node
while ((node = walker.nextNode())) {
  const parent = node.parentElement
  if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) continue
  const normalized = normalize(node.nodeValue)
  if (!normalized) continue
  textNodes.push({ node, source: node.nodeValue })
}

const resumeBase = `${import.meta.env.BASE_URL}cv/`

const resumeFiles = {
  es: {
    src: `${resumeBase}CV_Freddy_Ramirez_Rede_QA_ES.pdf`,
    note: 'Versión en español',
    viewLabel: 'Visualizar CV',
    downloadLabel: 'Descargar CV'
  },
  en: {
    src: `${resumeBase}CV_Freddy_Ramirez_Rede_QA_EN.pdf`,
    note: 'English version',
    viewLabel: 'View resume',
    downloadLabel: 'Download resume'
  }
}

const floatingMenuState = new WeakMap()

const portalFloatingMenu = menu => {
  if (!menu || menu.parentElement === document.body) return
  const placeholder = document.createComment(`floating-menu-${menu.id || 'menu'}`)
  menu.parentNode.insertBefore(placeholder, menu)
  floatingMenuState.set(menu, { parent: placeholder.parentNode, placeholder })
  document.body.appendChild(menu)
  menu.classList.add('is-floating')
  menu.setAttribute('data-mobile-portal', 'true')
}

const restoreFloatingMenu = menu => {
  if (!menu || !menu.classList.contains('is-floating')) return
  const state = floatingMenuState.get(menu)
  if (state?.placeholder?.parentNode) {
    state.placeholder.parentNode.insertBefore(menu, state.placeholder.nextSibling)
    state.placeholder.remove()
  }
  floatingMenuState.delete(menu)
  menu.classList.remove('is-floating')
  menu.removeAttribute('data-mobile-portal')
}

const closeResumeMenus = () => {
  document.querySelectorAll('.resume-menu').forEach(menu => {
    menu.classList.remove('is-open')
    menu.style.top = ''
    menu.style.left = ''
    menu.style.width = ''
    menu.style.removeProperty('position')
    menu.style.removeProperty('display')
    menu.style.removeProperty('visibility')
    menu.style.removeProperty('opacity')
    menu.style.removeProperty('pointer-events')
    menu.style.removeProperty('transform')
    menu.style.removeProperty('max-width')
    restoreFloatingMenu(menu)
  })
  document.querySelectorAll('.resume-menu-group').forEach(group => {
    group.classList.remove('is-open')
    group.querySelector('.resume-button')?.setAttribute('aria-expanded', 'false')
  })
}

const positionOpenResumeMenus = () => {
  if (window.innerWidth > 700) return
  document.querySelectorAll('.resume-menu.is-open').forEach(menu => {
    const button = document.getElementById(menu.id.replace('-menu', '-button'))
    if (button) positionMobileFloatingMenu(button, menu, Math.max(button.getBoundingClientRect().width, 220))
  })
}

const updateResumeLanguage = language => {
  const active = language === 'en' ? 'en' : 'es'
  const data = resumeFiles[active]
  const note = document.getElementById('resume-language-note')
  const viewLabel = document.getElementById('resume-view-label')
  const downloadLabel = document.getElementById('resume-download-label')

  if (note) note.textContent = data.note
  if (viewLabel) viewLabel.textContent = data.viewLabel
  if (downloadLabel) downloadLabel.textContent = data.downloadLabel

  document.querySelectorAll('.resume-menu-option').forEach(link => {
    const linkLang = link.dataset.resumeLang === 'en' ? 'en' : 'es'
    const file = resumeFiles[linkLang]
    link.href = file.src
    if (link.dataset.action === 'download') {
      link.download = linkLang === 'en'
        ? 'CV_Freddy_Ramirez_Rede_QA_EN.pdf'
        : 'CV_Freddy_Ramirez_Rede_QA_ES.pdf'
    } else {
      link.removeAttribute('download')
    }
    link.textContent = language === 'en'
      ? (linkLang === 'en' ? 'English' : 'Spanish')
      : (linkLang === 'en' ? 'English' : 'Español')
  })
}

const setupResumeMenus = () => {
  document.querySelectorAll('.resume-menu-group').forEach(group => {
    const button = group.querySelector('.resume-button')
    const menu = group.querySelector('.resume-menu')
    if (!button || !menu) return

    button.addEventListener('click', event => {
      event.preventDefault()
      event.stopPropagation()
      const shouldOpen = !group.classList.contains('is-open')
      closeResumeMenus()

      if (!shouldOpen) return

      group.classList.add('is-open')
      button.setAttribute('aria-expanded', 'true')
      if (window.innerWidth <= 700) portalFloatingMenu(menu)
      menu.classList.add('is-open')
      requestAnimationFrame(() => positionMobileFloatingMenu(button, menu, Math.max(button.getBoundingClientRect().width, 220)))
    })

    menu.querySelectorAll('.resume-menu-option').forEach(option => {
      option.addEventListener('click', closeResumeMenus)
    })
  })
}

document.addEventListener('click', event => {
  if (!event.target.closest('.resume-menu-group') && !event.target.closest('.resume-menu')) closeResumeMenus()
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeResumeMenus()
})

window.addEventListener('resize', () => {
  if (languageMenu?.classList.contains('is-open')) positionMobileFloatingMenu(languageButton, languageMenu, 220)
  positionOpenResumeMenus()
})
window.addEventListener('scroll', () => {
  if (languageMenu?.classList.contains('is-open')) positionMobileFloatingMenu(languageButton, languageMenu, 220)
  positionOpenResumeMenus()
}, { passive: true })

setupResumeMenus()

const applyLanguage = language => {
  const index = language === 'en' ? 1 : 0

  textNodes.forEach(({ node, source }) => {
    const key = normalize(source)
    const pair = translations[key]
    if (!pair) return

    const leading = source.match(/^\s*/)?.[0] ?? ''
    const trailing = source.match(/\s*$/)?.[0] ?? ''
    node.nodeValue = `${leading}${pair[index]}${trailing}`
  })

  currentLanguage = language
  document.documentElement.lang = language

  const description = document.getElementById('meta-description')
  if (description) {
    description.content = language === 'en'
      ? 'Portfolio of Freddy Ramírez Rede, Junior QA Tester focused on manual testing, functional testing, API testing, and SQL.'
      : 'Portafolio de Freddy Ramírez Rede, QA Tester Junior especializado en pruebas manuales, funcionales, API Testing y SQL.'
  }

  const select = document.getElementById('language-select')
  const languageButton = document.getElementById('language-button')
  const languageLabel = document.querySelector('.language-label')
  const languageCurrent = document.getElementById('language-current')
  const languageMenu = document.getElementById('language-menu')
  if (select) select.setAttribute('aria-label', language === 'en' ? 'Select language' : 'Seleccionar idioma')
  if (languageButton) {
    languageButton.setAttribute('aria-label', language === 'en' ? 'Select language' : 'Seleccionar idioma')
    languageButton.title = language === 'en' ? 'Language' : 'Idioma'
  }
  if (languageLabel) languageLabel.textContent = language === 'en' ? 'Language' : 'Idioma'
  if (languageCurrent) languageCurrent.textContent = language.toUpperCase()
  languageMenu?.querySelectorAll('.language-option').forEach(option => {
    const optionLanguage = option.dataset.lang === 'en' ? 'en' : 'es'
    const active = optionLanguage === language
    option.setAttribute('aria-selected', active ? 'true' : 'false')
    option.classList.toggle('is-selected', active)
    option.textContent = language === 'en'
      ? (optionLanguage === 'en' ? 'English' : 'Spanish')
      : (optionLanguage === 'en' ? 'English' : 'Español')
  })

  updateResumeLanguage(language)
  updateThemeUI()
}

const languageSelect = document.getElementById('language-select')
let currentLanguage = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'es'
if (languageSelect) languageSelect.value = currentLanguage

const languageButton = document.getElementById('language-button')
const languagePicker = document.querySelector('.language-picker')
const languageMenu = document.getElementById('language-menu')

const positionMobileFloatingMenu = (button, menu, width = null) => {
  if (!button || !menu || window.innerWidth > 700) {
    if (menu) {
      menu.style.top = ''
      menu.style.left = ''
      menu.style.width = ''
    }
    return
  }

  const rect = button.getBoundingClientRect()
  const viewport = window.visualViewport
  const viewportWidth = viewport?.width || window.innerWidth
  const viewportHeight = viewport?.height || window.innerHeight
  const viewportOffsetTop = viewport?.offsetTop || 0
  const viewportPadding = 12
  const menuWidth = Math.min(
    width || Math.max(rect.width, 190),
    viewportWidth - viewportPadding * 2
  )

  menu.style.setProperty('position', 'fixed', 'important')
  menu.style.setProperty('display', 'block', 'important')
  menu.style.setProperty('visibility', 'visible', 'important')
  menu.style.setProperty('opacity', '1', 'important')
  menu.style.setProperty('pointer-events', 'auto', 'important')
  menu.style.setProperty('transform', 'none', 'important')
  menu.style.setProperty('width', `${menuWidth}px`, 'important')
  menu.style.setProperty('max-width', `${viewportWidth - viewportPadding * 2}px`, 'important')

  let left = rect.right - menuWidth
  left = Math.max(viewportPadding, Math.min(left, viewportWidth - menuWidth - viewportPadding))

  let top = rect.bottom + 8
  const menuHeight = menu.offsetHeight
  const lowerLimit = viewportOffsetTop + viewportHeight - viewportPadding
  if (top + menuHeight > lowerLimit && rect.top - menuHeight - 8 >= viewportOffsetTop + viewportPadding) {
    top = rect.top - menuHeight - 8
  }

  menu.style.left = `${Math.round(left)}px`
  menu.style.top = `${Math.round(top)}px`
}

const setLanguageMenuOpen = (open) => {
  if (!languageButton || !languageMenu) return

  languageButton.setAttribute('aria-expanded', open ? 'true' : 'false')

  if (open) {
    if (window.innerWidth <= 700) portalFloatingMenu(languageMenu)
    languageMenu.classList.add('is-open')
    requestAnimationFrame(() => positionMobileFloatingMenu(languageButton, languageMenu, 220))
  } else {
    languageMenu.classList.remove('is-open')
    languageMenu.style.top = ''
    languageMenu.style.left = ''
    languageMenu.style.width = ''
    languageMenu.style.removeProperty('position')
    languageMenu.style.removeProperty('display')
    languageMenu.style.removeProperty('visibility')
    languageMenu.style.removeProperty('opacity')
    languageMenu.style.removeProperty('pointer-events')
    languageMenu.style.removeProperty('transform')
    languageMenu.style.removeProperty('max-width')
    restoreFloatingMenu(languageMenu)
  }
}

languageButton?.addEventListener('click', (event) => {
  event.preventDefault()
  event.stopPropagation()
  setLanguageMenuOpen(!languageMenu?.classList.contains('is-open'))
})

languageMenu?.querySelectorAll('.language-option').forEach(option => {
  option.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    const language = option.dataset.lang === 'en' ? 'en' : 'es'
    if (languageSelect) languageSelect.value = language
    localStorage.setItem('portfolio-language', language)
    applyLanguage(language)
    setLanguageMenuOpen(false)
  })
})

document.addEventListener('click', (event) => {
  if (!languagePicker?.contains(event.target) && !languageMenu?.contains(event.target)) setLanguageMenuOpen(false)
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setLanguageMenuOpen(false)
    closeResumeMenus()
  }
})

/* =====================================================
   Theme toggle
   ===================================================== */
const themeToggle = document.getElementById('theme-toggle')
const themeLabel = document.querySelector('.theme-label')
const savedTheme = localStorage.getItem('portfolio-theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const isDark = savedTheme ? savedTheme === 'dark' : Boolean(prefersDark)

const updateThemeUI = () => {
  const dark = document.body.classList.contains('dark')
  const label = dark
    ? (currentLanguage === 'en' ? 'Light' : 'Claro')
    : (currentLanguage === 'en' ? 'Dark' : 'Oscuro')

  if (themeLabel) themeLabel.textContent = label

  themeToggle?.setAttribute(
    'aria-label',
    dark
      ? (currentLanguage === 'en' ? 'Switch to light mode' : 'Cambiar a modo claro')
      : (currentLanguage === 'en' ? 'Switch to dark mode' : 'Activar modo oscuro')
  )

  themeToggle?.setAttribute(
    'title',
    dark
      ? (currentLanguage === 'en' ? 'Light mode' : 'Modo claro')
      : (currentLanguage === 'en' ? 'Dark mode' : 'Modo oscuro')
  )
}

if (isDark) document.body.classList.add('dark')

languageSelect?.addEventListener('change', event => {
  const language = event.target.value === 'en' ? 'en' : 'es'
  localStorage.setItem('portfolio-language', language)
  applyLanguage(language)
})

themeToggle?.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark')
  localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light')
  updateThemeUI()
})


/* =====================================================
   Its Hover-style icon animations
   The original Its Hover components are React + motion/react.
   This project is vanilla Vite, so we reproduce the hover motion
   locally with the Web Animations API while keeping the same SVGs.
   ===================================================== */
const setupSocialIconAnimations = () => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return

  const sequences = {
    github: [
      { transform: 'translateY(0) rotate(0deg) scale(1)' },
      { transform: 'translateY(0) rotate(-5deg) scale(1.1)' },
      { transform: 'translateY(0) rotate(5deg) scale(1.08)' },
      { transform: 'translateY(0) rotate(0deg) scale(1)' }
    ],
    linkedin: [
      { transform: 'translateY(0) rotate(0deg) scale(1)' },
      { transform: 'translateY(-1px) rotate(-5deg) scale(1.08)' },
      { transform: 'translateY(0) rotate(3deg) scale(1.05)' },
      { transform: 'translateY(0) rotate(0deg) scale(1)' }
    ],
    whatsapp: [
      { transform: 'translateY(0) rotate(0deg) scale(1)' },
      { transform: 'translateY(-1px) rotate(4deg) scale(1.08)' },
      { transform: 'translateY(0) rotate(-3deg) scale(1.05)' },
      { transform: 'translateY(0) rotate(0deg) scale(1)' }
    ],
    mail: [
      { transform: 'translateY(0) rotate(0deg) scale(1)' },
      { transform: 'translateY(-2px) rotate(-3deg) scale(1.08)' },
      { transform: 'translateY(0) rotate(2deg) scale(1.04)' },
      { transform: 'translateY(0) rotate(0deg) scale(1)' }
    ]
  }

  document.querySelectorAll('.itshover-social').forEach(button => {
    const icon = button.querySelector('.itshover-icon')
    const sequence = sequences[button.dataset.icon]
    if (!icon || !sequence) return

    let animation
    const start = () => {
      animation?.cancel()
      animation = icon.animate(sequence, {
        duration: 500,
        easing: 'ease-in-out',
        fill: 'both'
      })
    }
    const stop = () => {
      animation?.cancel()
      animation = icon.animate(
        [{ transform: 'translateY(0) rotate(0deg) scale(1)' }],
        { duration: 160, easing: 'ease-out', fill: 'forwards' }
      )
    }

    button.addEventListener('mouseenter', start)
    button.addEventListener('mouseleave', stop)
    button.addEventListener('focus', start)
    button.addEventListener('blur', stop)
  })
}

setupSocialIconAnimations()


/* =====================================================
   Dynamic cursor field
   ===================================================== */
const setupCursorGlow = () => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia?.('(pointer: fine)').matches
  if (reduced || !finePointer) return

  const glow = document.createElement('div')
  glow.className = 'cursor-glow'
  glow.setAttribute('aria-hidden', 'true')
  document.body.appendChild(glow)

  const trail = Array.from({ length: 10 }, (_, index) => {
    const node = document.createElement('span')
    node.className = 'cursor-trail'
    node.setAttribute('aria-hidden', 'true')
    node.style.setProperty('--trail-index', index)
    node.style.width = `${Math.max(3.5, 8 - index * 0.45)}px`
    node.style.height = `${Math.max(3.5, 8 - index * 0.45)}px`
    document.body.appendChild(node)
    return node
  })

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const points = trail.map(() => ({ x: target.x, y: target.y }))
  let raf = 0
  let lastTime = performance.now()
  let lastMove = 0

  const render = now => {
    const dt = Math.min(32, now - lastTime)
    lastTime = now
    const blend = Math.min(1, dt / 16)

    glow.style.left = `${target.x}px`
    glow.style.top = `${target.y}px`

    points.forEach((point, index) => {
      const leader = index === 0 ? target : points[index - 1]
      const easing = Math.max(0.08, 0.19 - index * 0.012)
      point.x += (leader.x - point.x) * easing * blend
      point.y += (leader.y - point.y) * easing * blend
      trail[index].style.left = `${point.x}px`
      trail[index].style.top = `${point.y}px`
      trail[index].style.setProperty('--trail-scale', Math.max(0.34, 1 - index * 0.07).toFixed(2))
      const fade = lastMove ? Math.max(0, 1 - (now - lastMove) / 480) : 0
      const baseOpacity = Math.max(0.018, 0.14 - index * 0.012)
      trail[index].style.setProperty('--trail-opacity', (baseOpacity * fade).toFixed(3))
    })

    raf = requestAnimationFrame(render)
  }

  const move = event => {
    target.x = event.clientX
    target.y = event.clientY
    lastMove = performance.now()
    glow.classList.add('is-active')
    if (!raf) raf = requestAnimationFrame(render)
  }

  document.addEventListener('pointermove', move, { passive: true })

  window.addEventListener('blur', () => {
    glow.classList.remove('is-active')
    trail.forEach(node => { node.style.opacity = '0' })
  })

  window.addEventListener('focus', () => {
    trail.forEach(node => { node.style.opacity = '' })
  })

  raf = requestAnimationFrame(render)
}

setupCursorGlow()

applyLanguage(currentLanguage)

/* =====================================================
   MOBILE POPOVER FALLBACK
   iOS Safari can clip/relocate fixed descendants inside
   sticky/backdrop-filter navigation. On phones we therefore
   use one dedicated body-level popover and never move the
   original menus in the DOM.
   ===================================================== */
(() => {
  const mobileQuery = window.matchMedia('(max-width: 700px)')
  let mobilePopover = null
  let mobilePopoverType = null
  let mobilePopoverButton = null

  const isMobile = () => mobileQuery.matches

  const ensureMobilePopover = () => {
    if (mobilePopover) return mobilePopover
    mobilePopover = document.createElement('div')
    mobilePopover.id = 'mobile-popover'
    mobilePopover.setAttribute('role', 'presentation')
    document.body.appendChild(mobilePopover)
    return mobilePopover
  }

  const closeMobilePopover = () => {
    if (!mobilePopover) return
    mobilePopover.classList.remove('is-open')
    mobilePopover.replaceChildren()
    mobilePopoverType = null
    mobilePopoverButton = null
    document.querySelectorAll('.resume-menu-group.is-open').forEach(group => {
      group.classList.remove('is-open')
      group.querySelector('.resume-button')?.setAttribute('aria-expanded', 'false')
    })
    languageButton?.setAttribute('aria-expanded', 'false')
  }

  const positionMobilePopover = button => {
    if (!mobilePopover || !button) return

    const rect = button.getBoundingClientRect()
    const vv = window.visualViewport
    const viewportWidth = vv?.width || window.innerWidth
    const viewportHeight = vv?.height || window.innerHeight
    const offsetLeft = vv?.offsetLeft || 0
    const offsetTop = vv?.offsetTop || 0
    const padding = 12
    const width = Math.min(220, viewportWidth - padding * 2)

    mobilePopover.style.width = `${Math.round(width)}px`

    // Force layout so Safari gives us the real height before deciding
    // whether the popover fits below or above the trigger.
    const popoverHeight = mobilePopover.offsetHeight
    let left = rect.right - width
    let top = rect.bottom + 8

    left = Math.max(offsetLeft + padding, Math.min(left, offsetLeft + viewportWidth - width - padding))

    const lowerLimit = offsetTop + viewportHeight - padding
    if (top + popoverHeight > lowerLimit && rect.top - popoverHeight - 8 >= offsetTop + padding) {
      top = rect.top - popoverHeight - 8
    }

    mobilePopover.style.left = `${Math.round(left)}px`
    mobilePopover.style.top = `${Math.round(top)}px`
  }

  const openLanguagePopover = button => {
    const popover = ensureMobilePopover()
    closeMobilePopover()
    mobilePopoverType = 'language'
    mobilePopoverButton = button

    const menu = document.getElementById('language-menu')
    if (!menu) return

    const options = [...menu.querySelectorAll('.language-option')]
    options.forEach(source => {
      const option = document.createElement('button')
      option.type = 'button'
      option.className = 'mobile-popover-option'
      option.setAttribute('role', 'option')
      option.dataset.lang = source.dataset.lang || 'es'
      option.textContent = source.textContent.trim()
      option.setAttribute('aria-selected', source.getAttribute('aria-selected') || 'false')
      option.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        const language = option.dataset.lang === 'en' ? 'en' : 'es'
        if (languageSelect) languageSelect.value = language
        localStorage.setItem('portfolio-language', language)
        applyLanguage(language)
        closeMobilePopover()
      })
      popover.appendChild(option)
    })

    popover.className = 'is-open mobile-popover-language'
    button.setAttribute('aria-expanded', 'true')
    requestAnimationFrame(() => positionMobilePopover(button))
  }

  const openResumePopover = button => {
    const group = button.closest('.resume-menu-group')
    const menu = group?.querySelector('.resume-menu')
    if (!group || !menu) return

    const popover = ensureMobilePopover()
    closeMobilePopover()
    mobilePopoverType = 'resume'
    mobilePopoverButton = button
    group.classList.add('is-open')
    button.setAttribute('aria-expanded', 'true')

    menu.querySelectorAll('.resume-menu-option').forEach(source => {
      const option = document.createElement('a')
      option.className = 'mobile-popover-option'
      option.href = source.href
      option.dataset.resumeLang = source.dataset.resumeLang || 'es'
      option.dataset.action = source.dataset.action || 'view'
      option.textContent = source.textContent.trim()
      option.setAttribute('role', 'menuitem')

      if (option.dataset.action === 'download') {
        option.download = source.getAttribute('download') || ''
      } else {
        option.target = '_blank'
        option.rel = 'noopener noreferrer'
      }

      option.addEventListener('click', () => {
        // The click itself is the user's gesture, so keep the native
        // anchor behavior instead of opening the file asynchronously.
        window.setTimeout(closeMobilePopover, 0)
      })

      popover.appendChild(option)
    })

    popover.className = 'is-open mobile-popover-resume'
    requestAnimationFrame(() => positionMobilePopover(button))
  }

  document.addEventListener('click', event => {
    if (!isMobile()) return

    const target = event.target
    const languageTrigger = target instanceof Element ? target.closest('#language-button') : null
    const resumeTrigger = target instanceof Element ? target.closest('.resume-button') : null

    if (languageTrigger) {
      event.preventDefault()
      event.stopPropagation()
      if (mobilePopoverType === 'language' && mobilePopover?.classList.contains('is-open')) {
        closeMobilePopover()
      } else {
        openLanguagePopover(languageTrigger)
      }
      return
    }

    if (resumeTrigger) {
      event.preventDefault()
      event.stopPropagation()
      if (mobilePopoverType === 'resume' && mobilePopoverButton === resumeTrigger && mobilePopover?.classList.contains('is-open')) {
        closeMobilePopover()
      } else {
        openResumePopover(resumeTrigger)
      }
      return
    }

    if (mobilePopover?.contains(target)) return
    closeMobilePopover()
  }, true)

  document.addEventListener('touchstart', event => {
    if (!isMobile() || !mobilePopover?.classList.contains('is-open')) return
    if (!mobilePopover.contains(event.target)) closeMobilePopover()
  }, { capture: true, passive: true })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMobilePopover()
  })

  window.addEventListener('resize', () => {
    if (mobilePopover?.classList.contains('is-open') && mobilePopoverButton) {
      requestAnimationFrame(() => positionMobilePopover(mobilePopoverButton))
    }
  }, { passive: true })

  window.visualViewport?.addEventListener('resize', () => {
    if (mobilePopover?.classList.contains('is-open') && mobilePopoverButton) {
      requestAnimationFrame(() => positionMobilePopover(mobilePopoverButton))
    }
  }, { passive: true })

  window.visualViewport?.addEventListener('scroll', () => {
    if (mobilePopover?.classList.contains('is-open') && mobilePopoverButton) {
      requestAnimationFrame(() => positionMobilePopover(mobilePopoverButton))
    }
  }, { passive: true })

  window.addEventListener('scroll', () => {
    if (mobilePopover?.classList.contains('is-open') && mobilePopoverButton) {
      requestAnimationFrame(() => positionMobilePopover(mobilePopoverButton))
    }
  }, { passive: true })
})()
