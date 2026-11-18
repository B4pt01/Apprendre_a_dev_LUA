import { useState } from 'react'
import { highlight } from '../lib/highlight'
import { runExample } from '../lib/run-example'
import type { CodeLang } from '../content/schema'

type Props = {
  code: string
  lang: CodeLang
  runnable?: boolean
  filename?: string
}

export function CodeBlock({ code, lang, runnable, filename }: Props) {
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  async function run() {
    setRunning(true)
    setError(null)
    setOutput(null)
    const result = await runExample(code)
    setRunning(false)
    setOutput(result.output)
    setError(result.error ?? null)
  }

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{lang}</span>
        <span className="filename">{filename ?? (runnable ? 'exemple.lua' : '')}</span>
        {runnable && lang === 'lua' ? (
          <button type="button" onClick={() => void run()} disabled={running}>
            {running ? 'Exécution…' : 'Exécuter'}
          </button>
        ) : null}
        <button type="button" onClick={() => void copy()}>
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
      </pre>
      {output || error ? (
        <div className={error ? 'output err' : 'output'}>
          {error ? error : output}
        </div>
      ) : null}
    </div>
  )
}
