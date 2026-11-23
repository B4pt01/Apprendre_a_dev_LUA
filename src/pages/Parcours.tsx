import { Link, useParams } from 'react-router-dom'
import { MODULES, TRACKS, getLesson, modulesForTrack } from '../content'
import type { TrackId } from '../content/schema'
import { useProgress } from '../lib/progress-hook'

export default function Parcours() {
  const { trackId } = useParams()
  const { state, reset } = useProgress()
  const tracks = TRACKS.filter((t) => !trackId || t.id === trackId)

  return (
    <div className="wide">
      <p className="kicker">Parcours</p>
      <h1 className="page-title">La carte du cours</h1>
      <p>
        Fondations d’abord, puis un track jeu. Tu peux ouvrir Roblox et FiveM en
        parallèle : les encadrés violets signalent les divergences.
      </p>
      <div className="hero-actions">
        {TRACKS.map((t) => (
          <Link key={t.id} className="btn" to={`/parcours/${t.id}`}>
            {t.title}
          </Link>
        ))}
        <Link className="btn ghost" to="/parcours">
          Tout voir
        </Link>
        <button type="button" className="btn ghost" onClick={() => reset()}>
          Réinitialiser la progression
        </button>
      </div>
      {tracks.map((track) => (
        <section key={track.id} style={{ marginTop: 28 }}>
          <h2 className="page-title" style={{ fontSize: '1.2rem', marginTop: 8 }}>
            {track.title}
          </h2>
          <p>{track.summary}</p>
          <div className="grid-2">
            {modulesForTrack(track.id as TrackId).map((mod) => {
              const done = mod.lessonIds.filter((id) => state.completed.includes(id)).length
              return (
                <article key={mod.id} className={`card track-${track.id}`}>
                  <strong>
                    {done}/{mod.lessonIds.length} · {mod.title}
                  </strong>
                  <p>{mod.summary}</p>
                  <ol>
                    {mod.lessonIds.map((id) => {
                      const lesson = getLesson(id)
                      if (!lesson) return null
                      return (
                        <li key={id}>
                          <Link to={`/lecon/${lesson.slug}`}>{lesson.title}</Link>
                          {state.completed.includes(id) ? ' ✓' : ''}
                        </li>
                      )
                    })}
                  </ol>
                </article>
              )
            })}
          </div>
        </section>
      ))}
      {trackId && MODULES.every((m) => m.track !== trackId) ? (
        <p>Track inconnu.</p>
      ) : null}
    </div>
  )
}
