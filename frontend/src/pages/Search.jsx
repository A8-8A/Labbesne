import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import StoreCard from '../components/StoreCard.jsx'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!q) return
    setData(null)
    api.get(`/api/search?q=${encodeURIComponent(q)}`).then(setData).catch(e => setError(e.message))
  }, [q])

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <h1 className="section-title">Results for “{q}”</h1>
      <hr className="stitch" />
      {error && <p className="error">{error}</p>}
      {!data && !error && <p className="muted">Searching…</p>}
      {data && <>
        <h2 style={{ fontSize: 20, margin: '24px 0 14px' }}>Products <span className="muted">({data.productTotal})</span></h2>
        {data.products.length
          ? <div className="grid products">{data.products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
          : <p className="muted">No products matched.</p>}
        <h2 style={{ fontSize: 20, margin: '36px 0 14px' }}>Stores <span className="muted">({data.storeTotal})</span></h2>
        {data.stores.length
          ? <div className="grid stores">{data.stores.map((s, i) => <StoreCard key={s.id} s={s} index={i} />)}</div>
          : <p className="muted">No stores matched.</p>}
      </>}
    </main>
  )
}
