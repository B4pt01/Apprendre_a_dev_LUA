import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BlockList } from '../components/BlockList'
import { Quiz } from '../components/Quiz'
import { MODULES, getLessonBySlug, neighbors } from '../content'
import { setLastSlug } from '../lib/progress'
import { useProgress } from '../lib/progress-hook'

export default function LessonPage() {
  const { slug = '' } = useParams()
  const lesson = getLessonBySlug(slug)
  const { state, complete, score, bookmark } = useProgress()
  const nav = lesson ? neighbors(lesson.slug) : {}

  useEffect(() => {
    if (lesson) setLastSlug(lesson.slug)
  }, [lesson])

  if (!lesson) {
    return (
      <p>
        Leçon introuvable. <Link to="/parcours">Retour au parcours</Link>
      </p>
    )
  }

  const mod = MODULES.find((m) => m.id === lesson.moduleId)
  const done = state.completed.includes(lesson.id)
  const bookmarked = state.bookmarks.includes(lesson.id)

  return (
    <article>
      <div className="lesson-head">
        <div className="crumbs">
          <Link to="/parcours">Parcours</Link>
          <span>/</span>
          <Link to={`/parcours/${lesson.track}`}>{mod?.title ?? lesson.track}</Link>
        </div>
        <span className={`badge ${lesson.track}`}>{lesson.track}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
        <div className="meta-row">
          <span>{lesson.minutes} min</span>
          <span>{lesson.tags.join(' · ')}</span>
          {done ? <span>terminée</span> : null}
        </div>
        <div className="hero-actions">
          <button type="button" className="btn primary" onClick={() => complete(lesson.id)}>
            Marquer comme terminée
          </button>
          <button type="button" className="btn" onClick={() => bookmark(lesson.id)}>
            {bookmarked ? 'Retirer le signet' : 'Signet'}
          </button>
        </div>
      </div>
      <BlockList blocks={lesson.blocks} />
      {lesson.quiz ? (
        <Quiz questions={lesson.quiz} onScored={(ratio) => score(lesson.id, ratio)} />
      ) : null}
      <nav className="pager">
        {nav.prev ? (
          <Link className="btn" to={`/lecon/${nav.prev.slug}`}>
            ← {nav.prev.title}
          </Link>
        ) : (
          <span />
        )}
        {nav.next ? (
          <Link className="btn primary" to={`/lecon/${nav.next.slug}`}>
            {nav.next.title} →
          </Link>
        ) : (
          <Link className="btn primary" to="/parcours">
            Parcours
          </Link>
        )}
      </nav>
    </article>
  )
}
