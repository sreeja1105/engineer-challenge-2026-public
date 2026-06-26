import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { JWT_SECRET, authenticate } from './auth'
import { summarizeText } from './llm'

const app = express()
app.use(cors())
app.use(express.json())

const PAGE_SIZE = 10

app.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

app.get('/feedback', authenticate, (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all'
    const page = parseInt((req.query.page as string) || '1', 10)
    const offset = page * PAGE_SIZE

    let where = ''
    if (status !== 'all') {
      where = `WHERE status = '${status}'`
    }

    const rows: any[] = db
      .prepare(
        `SELECT * FROM feedback ${where} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
      )
      .all()

    const items = rows.map((row) => {
      const customer: any = db.prepare('SELECT * FROM customers WHERE id = ?').get(row.customer_id)
      return {
        id: row.id,
        customer_id: row.customer_id,
        customer_name: customer.name,
        customer_email: customer.email,
        channel: row.channel,
        message: row.message,
        status: row.status,
        created_at: row.created_at,
      }
    })

    const total: any = db.prepare('SELECT COUNT(*) as count FROM feedback').get()
    res.json({ items, total: total.count, page })
  } catch (err) {
    console.error(req.headers.authorization, err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/feedback/:id', authenticate, (req: Request, res: Response) => {
  try {
    const row: any = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id)
    if (!row) {
      return res.status(404).json({ error: 'Not found' })
    }
    const customer: any = db.prepare('SELECT * FROM customers WHERE id = ?').get(row.customer_id)
    res.json({
      id: row.id,
      customer_id: row.customer_id,
      customer_name: customer.name,
      customer_email: customer.email,
      channel: row.channel,
      message: row.message,
      status: row.status,
      created_at: row.created_at,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/feedback/:id/resolve', authenticate, (req: Request, res: Response) => {
  try {
    const row: any = db.prepare('SELECT * FROM feedback WHERE id = ?').get(req.params.id)
    if (!row) {
      return res.status(404).json({ error: 'Not found' })
    }
    const nextStatus = row.status === 'open' ? 'resolved' : 'open'
    db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(nextStatus, req.params.id)
    res.json({ ...row, status: nextStatus })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/summarize', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    const row: any = db.prepare('SELECT * FROM feedback WHERE id = ?').get(id)
    const prompt = `Summarize the following customer feedback in one or two short sentences for a support agent.\n\n${row.message}`
    const summary = await summarizeText(prompt)
    res.json({ summary })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Pulse API running on http://localhost:${PORT}`)
})
