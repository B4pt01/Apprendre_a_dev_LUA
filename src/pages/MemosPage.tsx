import { Link, useParams } from 'react-router-dom'
import { CHEATSHEETS } from '../content'

export default function MemosPage() {
  const { id } = useParams()
  const sheets = id ? CHEATSHEETS.filter((s) => s.id === id) : CHEATSHEETS

  return (
    <div>
      <div className="kicker">Référence</div>
      <h1 style={{ fontFamily: 'var(--font-display)' }}>Mémos</h1>
      <div className="hero-actions">
        {CHEATSHEETS.map((s) => (
          <Link key={s.id} className="btn" to={`/memos/${s.id}`}>
            {s.title}
          </Link>
        ))}
        <Link className="btn ghost" to="/memos">
          Tous
        </Link>
      </div>
      {sheets.map((sheet) => (
        <section key={sheet.id} className={`card track-${sheet.track} cheatsheet`} style={{ marginTop: 18 }}>
          <h2 style={{ fontFamily: 'var(--font-display)' }}>{sheet.title}</h2>
          {sheet.groups.map((g) => (
            <div className="group" key={g.title}>
              <h3>{g.title}</h3>
              {g.rows.map((row) => (
                <div className="row" key={row.k}>
                  <code>{row.k}</code>
                  <span>{row.v}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
