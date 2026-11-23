import { Link } from 'react-router-dom'
import { LESSONS, TRACKS, orderedLessons } from '../content'
import { useProgress } from '../lib/progress-hook'

export default function Home() {
  const { state } = useProgress()
  const all = orderedLessons()
  const quizzes = LESSONS.filter((l) => l.quiz && l.quiz.length).length
  const last = all.find((l) => l.slug === state.lastSlug) ?? all[0]
  const done = state.completed.length

  return (
    <div className="wide">
      <section className="hero">
        <p className="kicker">Cours interactif · français</p>
        <h1>Lua, enfin pour de vrai — Roblox et FiveM.</h1>
        <p className="lede">
          Atelier Lua t’emmène des types jusqu’aux remotes et aux natives. Exemples
          exécutables, quiz, glossaire, et deux tracks métiers après les fondations.
        </p>
        <div className="hero-actions">
          <Link className="btn primary" to={last ? `/lecon/${last.slug}` : '/parcours'}>
            {state.lastSlug ? 'Reprendre' : 'Commencer les fondations'}
          </Link>
          <Link className="btn" to="/parcours">
            Voir le parcours
          </Link>
          <Link className="btn ghost" to="/playground">
            Ouvrir le playground
          </Link>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{all.length}</b>
            <span>leçons</span>
          </div>
          <div className="stat">
            <b>{TRACKS.length}</b>
            <span>tracks</span>
          </div>
          <div className="stat">
            <b>{quizzes}</b>
            <span>leçons avec quiz</span>
          </div>
          <div className="stat">
            <b>
              {done}/{all.length}
            </b>
            <span>terminées sur cet appareil</span>
          </div>
        </div>
      </section>

      <h2 className="section-title">Trois rails</h2>
      <div className="grid-3">
        {TRACKS.map((t) => (
          <Link key={t.id} to={`/parcours/${t.id}`} className={`card track-${t.id}`}>
            <span className={`badge ${t.id}`}>{t.kicker}</span>
            <h3>{t.title}</h3>
            <p>{t.summary}</p>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Méthode</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Comment travailler</h3>
          <p>
            Lis une leçon, lance les extraits Lua, copie les snippets Roblox / FiveM dans
            Studio ou ta ressource. Les quiz à 70 % marquent la leçon complète. La
            progression reste dans localStorage.
          </p>
        </div>
        <div className="card">
          <h3>Playground Lua 5.x</h3>
          <p>
            Le navigateur embarque une VM Lua (Wasmoon). Les APIs Roblox et les natives
            FiveM n’y existent pas — elles sont dans les tracks, en copier-coller commenté.
          </p>
        </div>
      </div>
    </div>
  )
}
