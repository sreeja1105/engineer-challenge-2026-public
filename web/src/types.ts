export type FeedbackItem = {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  channel: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

export type User = {
  id: number
  email: string
  name: string
}
