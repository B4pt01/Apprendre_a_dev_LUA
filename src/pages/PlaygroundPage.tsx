import { useState } from 'react'
import { runExample } from '../lib/run-example'

const SAMPLES: { label: string; code: string }[] = [
  {
    label: 'Hello',
    code: 'print("Atelier Lua")\nprint(_VERSION)',
  },
  {
    label: 'Table + ipairs',
    code: `local inv = { "pain", "eau", "bandage" }
for i, item in ipairs(inv) do
  print(i, item)
end`,
  },
  {
    label: 'Closure',
    code: `local function compteur()
  local n = 0
  return function()
    n = n + 1
    return n
  end
end
local c = compteur()
print(c(), c(), c())`,
  },
  {
    label: 'Metatable Vec',
    code: `local V = { __index = {} }
function V.new(x, y) return setmetatable({ x = x, y = y }, V) end
function V.__add(a, b) return V.new(a.x + b.x, a.y + b.y) end
function V.__tostring(v) return "("..v.x..","..v.y..")" end
print(V.new(1, 2) + V.new(3, 4))`,
  },
  {
    label: 'pcall',
    code: `local ok, err = pcall(function()
  error("boom")
end)
print(ok, err)`,
  },
  {
    label: 'Inventaire',
    code: `local Inv = { __index = {} }
function Inv.new() return setmetatable({ slots = {} }, Inv) end
function Inv:add(id, q)
  self.slots[#self.slots+1] = { id = id, qty = q }
end
function Inv:count(id)
  local n = 0
  for _, s in ipairs(self.slots) do
    if s.id == id then n = n + s.qty end
  end
  return n
end
local bag = Inv.new()
bag:add("bread", 2)
print("bread", bag:count("bread"))`,
  },
  {
    label: 'UTF-8',
    code: `local s = "été"
print("#", #s, "len", utf8.len(s))`,
  },
  {
    label: 'Bits',
    code: `local BIND, TRADE = 1, 2
local flags = BIND | TRADE
print(flags, flags & TRADE ~= 0)`,
  },
]

export default function PlaygroundPage() {
  const [code, setCode] = useState(SAMPLES[0].code)
  const [out, setOut] = useState('Prêt. Ctrl+Entrée pour exécuter.')
  const [err, setErr] = useState(false)
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    const result = await runExample(code)
    setBusy(false)
    setErr(!result.ok)
    setOut(result.error ? result.error : result.output)
  }

  return (
    <div className="wide">
      <p className="kicker">Sandbox</p>
      <h1 className="page-title">Playground Lua</h1>
      <p>
        VM Lua (WebAssembly) dans le navigateur. Pas d’os.execute, pas de natives FiveM,
        pas d’instances Roblox. Coupe les boucles infinies au bout de 2,5 s.
      </p>
      <div className="chips">
        {SAMPLES.map((s) => (
          <button key={s.label} type="button" className="chip" onClick={() => setCode(s.code)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="playground">
        <div>
          <textarea
            className="editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                void run()
              }
            }}
            spellCheck={false}
            aria-label="Éditeur Lua"
          />
          <div className="hero-actions">
            <button type="button" className="btn primary" onClick={() => void run()} disabled={busy}>
              {busy ? 'Exécution…' : 'Exécuter (Ctrl+Entrée)'}
            </button>
          </div>
        </div>
        <pre className={err ? 'output err' : 'output'} style={{ minHeight: 360, borderRadius: 10, border: '1px solid var(--line)' }}>
          {out}
        </pre>
      </div>
    </div>
  )
}
