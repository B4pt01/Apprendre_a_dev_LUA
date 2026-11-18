import type { Block, Lesson, QuizQuestion } from './schema'

export function p(text: string): Block {
  return { type: 'p', text }
}
export function h2(text: string): Block {
  return { type: 'h2', text }
}
export function h3(text: string): Block {
  return { type: 'h3', text }
}
export function ul(items: string[]): Block {
  return { type: 'ul', items }
}
export function ol(items: string[]): Block {
  return { type: 'ol', items }
}
export function lua(code: string, runnable = true, filename?: string): Block {
  return { type: 'code', lang: 'lua', code: trimCode(code), runnable, filename }
}
export function luau(code: string, filename?: string): Block {
  return { type: 'code', lang: 'luau', code: trimCode(code), filename }
}
export function js(code: string, filename?: string): Block {
  return { type: 'code', lang: 'js', code: trimCode(code), filename }
}
export function html(code: string, filename?: string): Block {
  return { type: 'code', lang: 'html', code: trimCode(code), filename }
}
export function json(code: string, filename?: string): Block {
  return { type: 'code', lang: 'json', code: trimCode(code), filename }
}
export function callout(
  kind: 'info' | 'tip' | 'warn' | 'diff' | 'game',
  title: string,
  text: string,
): Block {
  return { type: 'callout', kind, title, text }
}
export function compare(
  title: string,
  note: string,
  rows: { label: string; lua: string; luau: string; fivem: string }[],
): Block {
  return { type: 'compare', title, note, rows }
}

export function q(
  id: string,
  prompt: string,
  choices: string[],
  answer: number,
  explain: string,
): QuizQuestion {
  return { id, prompt, choices, answer, explain }
}

export function lesson(data: Lesson): Lesson {
  return data
}

function trimCode(code: string): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n')
  while (lines.length && lines[0].trim() === '') lines.shift()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  const indents = lines
    .filter((l) => l.trim().length)
    .map((l) => l.match(/^ */)?.[0].length ?? 0)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join('\n')
}
