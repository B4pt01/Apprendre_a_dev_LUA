import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchCourse } from '../content'

type Props = { open: boolean; onClose: () => void }

export function SearchPalette({ open, onClose }: Props) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const nav = useNavigate()
  const hits = useMemo(() => (q.trim() ? searchCourse(q) : []), [q])

  useEffect(() => {
    if (!open) {
      setQ('')
      setActive(0)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [q])

  if (!open) return null

  function go(href: string) {
    nav(href)
    onClose()
  }

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="search-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Recherche du cours"
      >
        <input
          autoFocus
          placeholder="Rechercher une leçon, un terme, un pattern…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            }
            if (e.key === 'Enter' && hits[active]) go(hits[active].href)
          }}
        />
        {hits.map((hit, i) => (
          <button
            type="button"
            key={hit.href + hit.title}
            className={`search-hit${i === active ? ' active' : ''}`}
            onClick={() => go(hit.href)}
          >
            <strong>{hit.title}</strong>
            <div>{hit.hint}</div>
          </button>
        ))}
        {q && hits.length === 0 ? (
          <div className="search-hit">Aucun résultat.</div>
        ) : null}
      </div>
    </div>
  )
}
