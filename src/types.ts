export interface Label {
  id: number
  name: string
  color: string
  description: string
}

export interface User {
  login: string
  avatar_url: string
  html_url: string
}

export interface Issue {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  labels: Label[]
  user: User
  created_at: string
  updated_at: string
  html_url: string
  comments: number
}
