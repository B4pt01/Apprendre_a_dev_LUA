import { useState } from 'react'
import type { QuizQuestion } from '../content/schema'

type Props = {
  questions: QuizQuestion[]
  onScored?: (ratio: number) => void
}

export function Quiz({ questions, onScored }: Props) {
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)

  const correct = questions.filter((q) => picked[q.id] === q.answer).length
  const ratio = questions.length ? correct / questions.length : 0

  function reset() {
    setPicked({})
    setDone(false)
  }

  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <h2 id="quiz-title">Quiz de la leçon</h2>
      <p className="meta-row">Coche une réponse par question, puis valide. 70 % pour valider.</p>
      {questions.map((q, index) => (
        <div key={q.id} style={{ marginTop: 18 }}>
          <p>
            <strong>
              {index + 1}. {q.prompt}
            </strong>
          </p>
          {q.choices.map((choice, i) => {
            let cls = 'choice'
            if (!done && picked[q.id] === i) cls += ' picked'
            if (done) {
              if (i === q.answer) cls += ' ok'
              else if (picked[q.id] === i) cls += ' bad'
            }
            return (
              <button
                key={choice}
                type="button"
                className={cls}
                aria-pressed={picked[q.id] === i}
                onClick={() => setPicked((prev) => ({ ...prev, [q.id]: i }))}
                disabled={done}
              >
                {choice}
              </button>
            )
          })}
          {done ? <p>{q.explain}</p> : null}
        </div>
      ))}
      <div className="hero-actions">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setDone(true)
            onScored?.(ratio)
          }}
          disabled={done || Object.keys(picked).length < questions.length}
        >
          Valider
        </button>
        {done ? (
          <button type="button" className="btn" onClick={reset}>
            Réessayer
          </button>
        ) : null}
        {done ? (
          <p>
            Score : {correct}/{questions.length} ({Math.round(ratio * 100)} %)
            {ratio >= 0.7 ? ' — leçon validée.' : ' — relis la leçon et réessaie.'}
          </p>
        ) : null}
      </div>
    </section>
  )
}
