const LUA_KW = [
  'and',
  'break',
  'do',
  'else',
  'elseif',
  'end',
  'false',
  'for',
  'function',
  'goto',
  'if',
  'in',
  'local',
  'nil',
  'not',
  'or',
  'repeat',
  'return',
  'then',
  'true',
  'until',
  'while',
]

const JS_KW = [
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'class',
  'import',
  'export',
  'from',
  'async',
  'await',
  'new',
  'true',
  'false',
  'null',
  'undefined',
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function wrap(kind: string, value: string): string {
  return `<span class="tok-${kind}">${value}</span>`
}

function highlightCLike(code: string, keywords: string[], lineComment: string): string {
  const kw = new Set(keywords)
  const src = code
  let i = 0
  let out = ''
  const n = src.length

  while (i < n) {
    if (src.startsWith(lineComment, i)) {
      const end = src.indexOf('\n', i)
      const slice = end === -1 ? src.slice(i) : src.slice(i, end)
      out += wrap('cmt', escapeHtml(slice))
      i += slice.length
      continue
    }
    if (src.startsWith('--[[', i)) {
      const end = src.indexOf(']]', i + 4)
      const slice = end === -1 ? src.slice(i) : src.slice(i, end + 2)
      out += wrap('cmt', escapeHtml(slice))
      i += slice.length
      continue
    }
    const ch = src[i]
    if (ch === '"' || ch === "'" || (ch === '[' && src[i + 1] === '[')) {
      if (ch === '[') {
        const end = src.indexOf(']]', i + 2)
        const slice = end === -1 ? src.slice(i) : src.slice(i, end + 2)
        out += wrap('str', escapeHtml(slice))
        i += slice.length
        continue
      }
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === ch) {
          j += 1
          break
        }
        j += 1
      }
      out += wrap('str', escapeHtml(src.slice(i, j)))
      i = j
      continue
    }
    if (/\d/.test(ch) && (i === 0 || !/[\w]/.test(src[i - 1]))) {
      let j = i
      while (j < n && /[\d.xXa-fA-F]/.test(src[j])) j += 1
      out += wrap('num', escapeHtml(src.slice(i, j)))
      i = j
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < n && /[\w]/.test(src[j])) j += 1
      const word = src.slice(i, j)
      out += kw.has(word) ? wrap('kw', word) : wrap('id', word)
      i = j
      continue
    }
    out += escapeHtml(ch)
    i += 1
  }
  return out
}

export function highlight(code: string, lang: string): string {
  if (lang === 'lua' || lang === 'luau') return highlightCLike(code, LUA_KW, '--')
  if (lang === 'js') return highlightCLike(code, JS_KW, '//')
  if (lang === 'html' || lang === 'css' || lang === 'json' || lang === 'txt') {
    return escapeHtml(code)
  }
  return escapeHtml(code)
}
