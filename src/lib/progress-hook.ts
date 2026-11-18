import { useCallback, useEffect, useState } from 'react'
import {
  getProgress,
  markComplete,
  resetProgress,
  saveQuizScore,
  setLastSlug,
  toggleBookmark,
  type ProgressState,
} from './progress'

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() =>
    typeof localStorage === 'undefined'
      ? { completed: [], quizScores: {}, lastSlug: null, bookmarks: [] }
      : getProgress(),
  )

  const refresh = useCallback(() => setState(getProgress()), [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'atelier-lua-v1') refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  return {
    state,
    refresh,
    complete: (id: string) => {
      markComplete(id)
      refresh()
    },
    score: (id: string, value: number) => {
      saveQuizScore(id, value)
      refresh()
    },
    last: (slug: string) => {
      setLastSlug(slug)
      refresh()
    },
    bookmark: (id: string) => {
      toggleBookmark(id)
      refresh()
    },
    reset: () => {
      resetProgress()
      refresh()
    },
  }
}
