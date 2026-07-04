import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Requests() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/api/transactions/mine').then(setItems).catch(e => setError(e.message)) }, [])

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <h1 className="section-title">Your requests</h1>
      <hr className="stitch" />
      {error && <p className="error">{error}</p>}
      {items?.length === 0 && <p className="muted">Nothing yet — reserve or contact a store to see it here.</p>}
      {items?.map(tx => (
        <div key={tx.id} className="card row" style={{ padding: 16, marginBottom: 12, justifyContent: 'space-between' }}>
          <div>
            <Link to={`/product/${tx.productId}`} style={{ fontWeight: 700 }}>{tx.productName}</Link>
            <div className="muted" style={{ fontSize: 14 }}>
              {tx.storeName} · {tx.type.toLowerCase()}
              {tx.variantColor && ` · ${tx.variantColor}`}
              {tx.selectedSize && ` · size ${tx.selectedSize}`}
            </div>
          </div>
          <span className={`badge ${tx.status}`}>{tx.status}</span>
        </div>
      ))}
    </main>
  )
}
