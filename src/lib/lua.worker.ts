import { runLua } from './lua-runner'

self.onmessage = async (event: MessageEvent<string>) => {
  const result = await runLua(event.data)
  self.postMessage(result)
}
