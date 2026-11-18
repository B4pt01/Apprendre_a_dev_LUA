import { LuaFactory } from 'wasmoon'

export type LuaRunResult = {
  ok: boolean
  output: string
  error?: string
}

let factory: LuaFactory | null = null

async function getFactory(): Promise<LuaFactory> {
  if (!factory) {
    factory = new LuaFactory('/lua.wasm')
  }
  return factory
}

export async function runLua(source: string): Promise<LuaRunResult> {
  const fac = await getFactory()
  const engine = await fac.createEngine()
  const lines: string[] = []
  try {
    engine.global.set('print', (...args: unknown[]) => {
      lines.push(args.map((v) => formatLuaValue(v)).join('\t'))
    })
    await engine.doString(source)
    const output = lines.join('\n')
    return {
      ok: true,
      output: output.length ? output : '(aucune sortie — utilise print)',
    }
  } catch (err) {
    return {
      ok: false,
      output: lines.join('\n'),
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    engine.global.close()
  }
}

function formatLuaValue(v: unknown): string {
  if (v === null || v === undefined) return 'nil'
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v)
  }
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}
