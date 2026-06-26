import { useEffect, useState } from 'react'
import { fetchInbox, toggleResolve } from '../api'
import { FeedbackItem } from '../types'
import ItemDetail from './ItemDetail'

const PAGE_SIZE = 10

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = async () => {
    const data = await fetchInbox(page, filter, token)
    setItems(data.items)
    setTotal(data.total)
  }

  useEffect(() => {
    load()
  }, [page, filter])

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchInbox(page, filter, token)
      const merged = data.items.map((incoming) => {
        const local = items.find((it) => it.id === incoming.id)
        return local ? { ...incoming, status: local.status } : incoming
      })
      setItems(merged)
    }, 45000)
    return () => clearInterval(interval)
  }, [])

  const onResolve = async (item: FeedbackItem) => {
    const nextStatus = item.status === 'open' ? 'resolved' : 'open'
    setItems(items.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it)))
    await toggleResolve(item.id, token)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (selectedId !== null) {
    return (
      <ItemDetail
        id={selectedId}
        token={token}
        onBack={() => {
          setSelectedId(null)
          load()
        }}
      />
    )
  }

  return (
    <div className="inbox">
      <div className="toolbar">
        <div className="filters">
          {['all', 'open', 'resolved'].map((f) => (
            <button
              key={f}
              className={'chip' + (filter === f ? ' active' : '')}
              onClick={() => {
                setFilter(f)
                setPage(1)
              }}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Channel</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="row" onClick={() => setSelectedId(item.id)}>
              <td>{item.customer_name}</td>
              <td>
                <span className="channel">{item.channel}</span>
              </td>
              <td className="preview">
                {item.message.slice(0, 70)}
                {item.message.length > 70 ? '…' : ''}
              </td>
              <td>
                <span className={'badge ' + item.status}>{item.status}</span>
              </td>
              <td>{new Date(item.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className="link-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResolve(item)
                  }}
                >
                  {item.status === 'open' ? 'Resolve' : 'Reopen'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
