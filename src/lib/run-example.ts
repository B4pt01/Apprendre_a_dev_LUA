import type { LuaRunResult } from './lua-runner'

export async function runExample(source: string, timeoutMs = 2500): Promise<LuaRunResult> {
  if (typeof Worker === 'undefined') {
    const { runLua } = await import('./lua-runner')
    return runLua(source)
  }
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./lua.worker.ts', import.meta.url), { type: 'module' })
    const timer = window.setTimeout(() => {
      worker.terminate()
      resolve({
        ok: false,
        output: '',
        error:
          'Exécution interrompue (délai dépassé). Vérifie qu’il n’y a pas de boucle infinie.',
      })
    }, timeoutMs)
    worker.onmessage = (event: MessageEvent<LuaRunResult>) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = (event) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve({
        ok: false,
        output: '',
        error: event.message || 'Le worker Lua a échoué.',
      })
    }
    worker.postMessage(source)
  })
}
