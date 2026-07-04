import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'

export default function OwnerDashboard() {
  const [store, setStore] = useState(undefined) // undefined=loading, null=no store
  const [products, setProducts] = useState([])
  const [txs, setTxs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/owner/store').then(async (res) => {
      if (!res.exists) return setStore(null)
      setStore(res.store)
      const [ps, ts] = await Promise.all([
        api.get(`/api/owner/store/${res.store.id}/products`),
        api.get(`/api/owner/store/${res.store.id}/transactions`),
      ])
      setProducts(ps); setTxs(ts)
    }).catch(e => setError(e.message))
  }, [])

  async function updateTx(id, status) {
    try {
      const updated = await api.patch(`/api/owner/transactions/${id}`, { status })
      setTxs(txs.map(t => t.id === id ? updated : t))
    } catch (e) { setError(e.message) }
  }

  async function removeProduct(id) {
    try {
      await api.del(`/api/owner/store/${store.id}/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch (e) { setError(e.message) }
  }

  if (error) return <main className="container"><p className="error" style={{ marginTop: 40 }}>{error}</p></main>
  if (store === undefined) return <main className="container"><p className="muted" style={{ marginTop: 40 }}>Loading…</p></main>

  if (store === null) return (
    <main className="container" style={{ maxWidth: 560, paddingTop: 60, textAlign: 'center' }}>
      <h1 style={{ fontSize: 34 }}>Set up your store</h1>
      <p className="muted" style={{ margin: '12px 0 24px' }}>
        Build your profile, get approved, and start listing products.
      </p>
      <Link to="/owner/store-profile" className="btn thread">Start store setup</Link>
    </main>
  )

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <div className="row" style={{ marginTop: 34, justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 32 }}>{store.name}</h1>
          <span className={`badge ${store.status}`}>{store.status}</span>
          {store.status === 'PENDING' && <span className="muted" style={{ marginLeft: 10, fontSize: 14 }}>Waiting for admin approval — you can still add products.</span>}
        </div>
        <div className="row">
          <Link to="/owner/store-profile" className="btn ghost sm">Edit store</Link>
          <Link to="/owner/products/new" className="btn sm">Add product</Link>
        </div>
      </div>
      <hr className="stitch" />

      <h2 className="section-title" style={{ marginTop: 24 }}>Products ({products.length})</h2>
      <table style={{ marginTop: 14 }}>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Variants</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.basePrice}{p.discountPrice && <span className="muted"> → ${p.discountPrice}</span>}</td>
              <td>{p.variants?.length ?? 0}</td>
              <td><span className={`badge ${p.status}`}>{p.status}</span></td>
              <td className="row">
                <Link className="btn ghost sm" to={`/owner/products/${p.id}/edit`}>Edit</Link>
                <button className="btn danger sm" onClick={() => removeProduct(p.id)}>Remove</button>
              </td>
            </tr>
          ))}
          {!products.length && <tr><td colSpan={6} className="muted">No products yet. Add your first piece.</td></tr>}
        </tbody>
      </table>

      <h2 className="section-title">Customer requests ({txs.length})</h2>
      <table style={{ marginTop: 14 }}>
        <thead><tr><th>Customer</th><th>Product</th><th>Type</th><th>Details</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {txs.map(t => (
            <tr key={t.id}>
              <td>{t.customerName}</td>
              <td>{t.productName}</td>
              <td>{t.type}</td>
              <td className="muted" style={{ maxWidth: 220 }}>
                {[t.variantColor, t.selectedSize && `size ${t.selectedSize}`, t.message].filter(Boolean).join(' · ')}
              </td>
              <td><span className={`badge ${t.status}`}>{t.status}</span></td>
              <td className="row">
                {t.status === 'PENDING' && <>
                  <button className="btn sm" onClick={() => updateTx(t.id, 'ACCEPTED')}>Accept</button>
                  <button className="btn ghost sm" onClick={() => updateTx(t.id, 'REJECTED')}>Reject</button>
                </>}
                {t.status === 'ACCEPTED' && <button className="btn thread sm" onClick={() => updateTx(t.id, 'COMPLETED')}>Complete</button>}
              </td>
            </tr>
          ))}
          {!txs.length && <tr><td colSpan={6} className="muted">No requests yet.</td></tr>}
        </tbody>
      </table>
    </main>
  )
}
