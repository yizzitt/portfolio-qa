/*
 * Its Hover icon integration for the vanilla Vite portfolio.
 * Source registry entries requested by the project:
 * https://itshover.com/r/linkedin-icon.json
 * https://itshover.com/r/whatsapp-icon.json
 * https://itshover.com/r/github-icon.json
 * https://itshover.com/r/mail-filled-icon.json
 *
 * The original Its Hover components are React + motion/react components.
 * This portfolio is intentionally kept as a vanilla Vite site, so the
 * SVG artwork is embedded locally and the same interaction is reproduced
 * with CSS instead of forcing a React migration just for four icons.
 */

const paths = {
  linkedin: '<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM3.54 20.45H7.1V8.99H3.54v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"/>',
  github: '<path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.11.79-.25.79-.56v-2.18c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.69 1.26 3.35.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.75 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.17 1.19a10.95 10.95 0 0 1 5.76 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.47-2.71 5.45-5.29 5.74.41.35.78 1.04.78 2.1v3.12c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"/>',
  whatsapp: '<path fill="currentColor" d="M12 2a9.9 9.9 0 0 0-8.56 14.87L2 22l5.27-1.38A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.07-1.11l-.29-.17-3.13.82.84-3.05-.19-.31A8 8 0 1 1 12 20Zm4.39-5.98c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.8-.19-.47-.39-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.57 4.07 3.6.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.47-.07 1.42-.58 1.62-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z"/>',
  mail: '<path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/>',
}

export function itshoverIcon(name, className = 'social-icon') {
  const safeName = paths[name] ? name : 'mail'
  return `<svg class="${className} itshover-icon-${safeName}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-itshover-icon="${safeName}">${paths[safeName]}</svg>`
}

export function mountItsHoverIcons(root = document) {
  root.querySelectorAll('[data-itshover-icon]').forEach((placeholder) => {
    const name = placeholder.getAttribute('data-itshover-icon') || 'mail'
    const svg = itshoverIcon(name, 'social-icon')
    placeholder.outerHTML = svg
  })
}
