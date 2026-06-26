import { useEffect, useState } from 'react'
import { fetchItem, toggleResolve, summarize } from '../api'
import { FeedbackItem } from '../types'

export default function ItemDetail({
  id,
  token,
  onBack,
}: {
  id: number
  token: string
  onBack: () => void
}) {
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [summary, setSummary] = useState('')

  useEffect(() => {
    fetchItem(id, token).then(setItem)
  }, [id])

  const onResolve = async () => {
    if (!item) return
    const updated = await toggleResolve(item.id, token)
    setItem({ ...item, status: updated.status })
  }

  const onSummarize = async () => {
    try {
      const data = await summarize(id, token)
      setSummary(data.summary)
    } catch (e) {}
  }

  if (!item) {
    return (
      <div className="detail">
        <button className="link-button" onClick={onBack}>
          ← Back to inbox
        </button>
      </div>
    )
  }

  return (
    <div className="detail">
      <button className="link-button" onClick={onBack}>
        ← Back to inbox
      </button>
      <div className="detail-card">
        <div className="detail-head">
          <div>
            <h2>{item.customer_name}</h2>
            <div className="muted">{item.customer_email}</div>
          </div>
          <span className={'badge ' + item.status}>{item.status}</span>
        </div>
        <div className="detail-meta">
          <span className="channel">{item.channel}</span>
          <span className="muted">{new Date(item.created_at).toLocaleString()}</span>
        </div>
        <div className="message" dangerouslySetInnerHTML={{ __html: item.message }} />
        <div className="detail-actions">
          <button onClick={onResolve}>
            {item.status === 'open' ? 'Mark resolved' : 'Reopen'}
          </button>
          <button className="secondary" onClick={onSummarize}>
            Summarize
          </button>
        </div>
        {summary && (
          <div className="summary">
            <h3>Summary</h3>
            <div dangerouslySetInnerHTML={{ __html: summary }} />
          </div>
        )}
      </div>
    </div>
  )
}
