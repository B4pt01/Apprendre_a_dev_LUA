export type TrackId = 'lua' | 'roblox' | 'fivem'

export type CalloutKind = 'info' | 'tip' | 'warn' | 'diff' | 'game'

export type CodeLang = 'lua' | 'luau' | 'js' | 'html' | 'css' | 'json' | 'txt'

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | {
      type: 'code'
      lang: CodeLang
      code: string
      runnable?: boolean
      filename?: string
    }
  | { type: 'callout'; kind: CalloutKind; title: string; text: string }
  | {
      type: 'compare'
      title: string
      note: string
      rows: { label: string; lua: string; luau: string; fivem: string }[]
    }

export type QuizQuestion = {
  id: string
  prompt: string
  choices: string[]
  answer: number
  explain: string
}

export type Lesson = {
  id: string
  slug: string
  title: string
  summary: string
  minutes: number
  track: TrackId
  moduleId: string
  tags: string[]
  blocks: Block[]
  quiz?: QuizQuestion[]
}

export type CourseModule = {
  id: string
  track: TrackId
  title: string
  summary: string
  lessonIds: string[]
}

export type Track = {
  id: TrackId
  title: string
  kicker: string
  summary: string
  color: string
}

export type GlossaryTerm = {
  id: string
  term: string
  track: TrackId | 'all'
  definition: string
  related?: string[]
}

export type CheatSheet = {
  id: string
  title: string
  track: TrackId
  groups: { title: string; rows: { k: string; v: string }[] }[]
}
