import { useEffect, useMemo, useState } from 'react'
import { GLOSSARY } from '../content'

export default function GlossaryPage() {
  const [q, setQ] = useState('')
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace('#', ''))
    if (!id) return
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'center' })
    })
  }, [])
  const terms = useMemo(() => {
    const n = q.trim().toLowerCase()
    return GLOSSARY.filter(
      (t) =>
        !n ||
        t.term.toLowerCase().includes(n) ||
        t.definition.toLowerCase().includes(n),
    )
  }, [q])

  return (
    <div>
      <p className="kicker">Référence</p>
      <h1 className="page-title">Glossaire</h1>
      <input
        className="editor"
        style={{ minHeight: 0, padding: 12 }}
        placeholder="Filtrer un terme…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filtrer le glossaire"
      />
      {terms.map((t) => (
        <article className="term" key={t.id} id={t.id}>
          <h3>
            {t.term} <span className={`badge ${t.track === 'all' ? 'lua' : t.track}`}>{t.track}</span>
          </h3>
          <p>{t.definition}</p>
        </article>
      ))}
    </div>
  )
}
