import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { MODULES, TRACKS, getLesson, getLessonBySlug, orderedLessons } from '../content'
import { useProgress } from '../lib/progress-hook'
import { SearchPalette } from './SearchPalette'

export function Shell() {
  const [search, setSearch] = useState(false)
  const [menu, setMenu] = useState(false)
  const [openMods, setOpenMods] = useState<Record<string, boolean>>({})
  const loc = useLocation()
  const { state } = useProgress()
  const total = orderedLessons().length
  const done = state.completed.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const currentSlug = loc.pathname.startsWith('/lecon/')
    ? loc.pathname.slice('/lecon/'.length)
    : ''
  const currentModuleId = getLessonBySlug(currentSlug)?.moduleId

  useEffect(() => {
    setMenu(false)
  }, [loc.pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearch(true)
      }
      if (e.key === 'Escape') setSearch(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>
      <header className="site-header">
        <button className="icon-btn menu-btn" type="button" onClick={() => setMenu(true)}>
          Menu
        </button>
        <NavLink to="/" className="brand">
          <span className="brand-mark">Lu</span>
          Atelier Lua
        </NavLink>
        <nav className="nav-links" aria-label="Principal">
          <NavLink to="/parcours">Parcours</NavLink>
          <NavLink to="/glossaire">Glossaire</NavLink>
          <NavLink to="/memos">Mémos</NavLink>
          <NavLink to="/playground">Playground</NavLink>
          <NavLink to="/comparaison">Luau vs FiveM</NavLink>
        </nav>
        <div className="header-spacer" />
        <button className="search-btn" type="button" onClick={() => setSearch(true)}>
          Rechercher <span className="kbd">Ctrl K</span>
        </button>
        <div className="progress-chip" aria-label={`Progression ${pct} pour cent`}>
          {pct}%
        </div>
      </header>
      <div className={`drawer-backdrop${menu ? ' open' : ''}`} onClick={() => setMenu(false)} />
      <div className="layout">
        <aside className={`sidebar${menu ? ' open' : ''}`}>
          <h2>Cours</h2>
          {TRACKS.map((track) => (
            <div key={track.id}>
              <h2>{track.title}</h2>
              {MODULES.filter((m) => m.track === track.id).map((mod) => {
                const opened =
                  openMods[mod.id] ??
                  (currentModuleId ? currentModuleId === mod.id : mod.id === 'lua-start')
                const lessonsDone = mod.lessonIds.filter((id) =>
                  state.completed.includes(id),
                ).length
                return (
                  <div className="mod" key={mod.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMods((prev) => ({ ...prev, [mod.id]: !opened }))
                      }
                    >
                      <span className="mod-title">{mod.title}</span>
                      <span className="mod-meta">
                        {lessonsDone}/{mod.lessonIds.length}
                      </span>
                    </button>
                    {opened
                      ? mod.lessonIds.map((id) => {
                          const lesson = getLesson(id)
                          if (!lesson) return null
                          return (
                            <NavLink
                              key={id}
                              to={`/lecon/${lesson.slug}`}
                              className={({ isActive }) =>
                                `lesson-link${isActive ? ' active' : ''}`
                              }
                            >
                              <span
                                className={`dot${state.completed.includes(id) ? ' done' : ''}`}
                              />
                              {lesson.title}
                            </NavLink>
                          )
                        })
                      : null}
                  </div>
                )
              })}
            </div>
          ))}
        </aside>
        <main className="main" id="contenu">
          <Outlet />
        </main>
      </div>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </>
  )
}
