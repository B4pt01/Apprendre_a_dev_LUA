import { MODULES, TRACKS } from './catalog'
import { CHEATSHEETS } from './cheatsheets'
import { GLOSSARY } from './glossary'
import { luaA } from './lessons/lua-a'
import { luaB } from './lessons/lua-b'
import { luaC } from './lessons/lua-c'
import { robloxLessons } from './lessons/roblox'
import { fivemLessons } from './lessons/fivem'
import type { Lesson, TrackId } from './schema'

export { MODULES, TRACKS, CHEATSHEETS, GLOSSARY }

export const LESSONS: Lesson[] = [
  ...luaA,
  ...luaB,
  ...luaC,
  ...robloxLessons,
  ...fivemLessons,
]

const byId = new Map(LESSONS.map((l) => [l.id, l]))
const bySlug = new Map(LESSONS.map((l) => [l.slug, l]))

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id)
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return bySlug.get(slug)
}

export function lessonsForModule(moduleId: string): Lesson[] {
  const mod = MODULES.find((m) => m.id === moduleId)
  if (!mod) return []
  return mod.lessonIds.map((id) => byId.get(id)).filter((l): l is Lesson => Boolean(l))
}

export function modulesForTrack(track: TrackId) {
  return MODULES.filter((m) => m.track === track)
}

export function orderedLessons(): Lesson[] {
  const out: Lesson[] = []
  for (const mod of MODULES) {
    for (const id of mod.lessonIds) {
      const lesson = byId.get(id)
      if (lesson) out.push(lesson)
    }
  }
  return out
}

export function neighbors(slug: string): { prev?: Lesson; next?: Lesson } {
  const all = orderedLessons()
  const i = all.findIndex((l) => l.slug === slug)
  if (i < 0) return {}
  return { prev: all[i - 1], next: all[i + 1] }
}

export type SearchHit = { title: string; hint: string; href: string }

export function searchCourse(raw: string): SearchHit[] {
  const q = raw.trim().toLowerCase()
  if (!q) return []
  const hits: SearchHit[] = []
  for (const lesson of orderedLessons()) {
    const blob = [
      lesson.title,
      lesson.summary,
      lesson.tags.join(' '),
      ...lesson.blocks.map((b) => {
        if (b.type === 'p' || b.type === 'h2' || b.type === 'h3') return b.text
        if (b.type === 'callout') return b.title + ' ' + b.text
        if (b.type === 'code') return b.code
        return ''
      }),
    ]
      .join(' ')
      .toLowerCase()
    if (blob.includes(q) || lesson.slug.includes(q)) {
      hits.push({
        title: lesson.title,
        hint: lesson.summary,
        href: `/lecon/${lesson.slug}`,
      })
    }
  }
  for (const term of GLOSSARY) {
    if (term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q)) {
      hits.push({
        title: term.term,
        hint: term.definition,
        href: `/glossaire#${term.id}`,
      })
    }
  }
  return hits.slice(0, 20)
}

export function missingLessonIds(): string[] {
  const missing: string[] = []
  for (const mod of MODULES) {
    for (const id of mod.lessonIds) {
      if (!byId.has(id)) missing.push(id)
    }
  }
  return missing
}
