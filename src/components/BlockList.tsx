import type { Block } from '../content/schema'
import { CodeBlock } from './CodeBlock'

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`
        switch (block.type) {
          case 'p':
            return <p key={key}>{block.text}</p>
          case 'h2':
            return <h2 key={key}>{block.text}</h2>
          case 'h3':
            return <h3 key={key}>{block.text}</h3>
          case 'ul':
            return (
              <ul key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            )
          case 'code':
            return (
              <CodeBlock
                key={key}
                code={block.code}
                lang={block.lang}
                runnable={block.runnable}
                filename={block.filename}
              />
            )
          case 'callout':
            return (
              <aside key={key} className={`callout ${block.kind}`}>
                <strong>{block.title}</strong>
                {block.text}
              </aside>
            )
          case 'compare':
            return (
              <div key={key} className="compare">
                <table>
                  <caption>
                    {block.title} — {block.note}
                  </caption>
                  <thead>
                    <tr>
                      <th>Sujet</th>
                      <th>Lua 5.x</th>
                      <th>Roblox Luau</th>
                      <th>FiveM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.lua}</td>
                        <td>{row.luau}</td>
                        <td>{row.fivem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
