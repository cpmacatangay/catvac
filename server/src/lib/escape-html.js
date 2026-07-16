const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

export function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ESCAPE_MAP[c])
}
