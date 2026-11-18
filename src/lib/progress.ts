const KEY = 'atelier-lua-v1'

export type ProgressState = {
  completed: string[]
  quizScores: Record<string, number>
  lastSlug: string | null
  bookmarks: string[]
}

const empty: ProgressState = {
  completed: [],
  quizScores: {},
  lastSlug: null,
  bookmarks: [],
}

function read(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty, completed: [], quizScores: {}, bookmarks: [] }
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      completed: parsed.completed ?? [],
      quizScores: parsed.quizScores ?? {},
      lastSlug: parsed.lastSlug ?? null,
      bookmarks: parsed.bookmarks ?? [],
    }
  } catch {
    return { ...empty, completed: [], quizScores: {}, bookmarks: [] }
  }
}

function write(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function getProgress(): ProgressState {
  return read()
}

export function markComplete(lessonId: string) {
  const state = read()
  if (!state.completed.includes(lessonId)) {
    state.completed = [...state.completed, lessonId]
    write(state)
  }
}

export function setLastSlug(slug: string) {
  const state = read()
  state.lastSlug = slug
  write(state)
}

export function saveQuizScore(lessonId: string, score: number) {
  const state = read()
  state.quizScores[lessonId] = score
  if (score >= 0.7 && !state.completed.includes(lessonId)) {
    state.completed = [...state.completed, lessonId]
  }
  write(state)
}

export function toggleBookmark(lessonId: string) {
  const state = read()
  state.bookmarks = state.bookmarks.includes(lessonId)
    ? state.bookmarks.filter((id) => id !== lessonId)
    : [...state.bookmarks, lessonId]
  write(state)
}

export function resetProgress() {
  write({ ...empty, completed: [], quizScores: {}, bookmarks: [] })
}

export function isComplete(lessonId: string): boolean {
  return read().completed.includes(lessonId)
}
