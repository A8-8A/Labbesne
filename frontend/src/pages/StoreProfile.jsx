import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import ReportButton from '../components/ReportButton.jsx'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StoreProfile() {
  const { id } = useParams()
  const [s, setS] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get(`/api/stores/${id}`).then(setS).catch(e => setError(e.message)) }, [id])

  if (error) return <main className="container"><p className="error" style={{ marginTop: 40 }}>{error}</p></main>
  if (!s) return <main className="container"><p className="muted" style={{ marginTop: 40 }}>Loading…</p></main>

  return (
    <main style={{ paddingBottom: 70 }}>
      <div style={{ height: 220, background: 'var(--cedar)', overflow: 'hidden' }}>
        {s.bannerUrl && <img src={s.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div className="container">
        <div className="row" style={{ marginTop: -44, alignItems: 'flex-end' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', border: '4px solid var(--linen)', background: 'var(--mist)', overflow: 'hidden' }}>
            {s.logoUrl && <img src={s.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div>
            <h1 style={{ fontSize: 34 }}>{s.name}</h1>
            <p className="muted">{s.categories}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}><ReportButton targetType="STORE" targetId={s.id} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 28 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 8 }}>About</h3>
            <p>{s.description || 'No description yet.'}</p>
            <hr className="stitch" style={{ margin: '16px 0' }} />
            <p className="muted" style={{ fontSize: 14.5 }}>{s.address}</p>
            <div className="row" style={{ marginTop: 12 }}>
              {s.whatsapp && <a className="btn sm thread" href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              {s.phone && <a className="btn ghost sm" href={`tel:${s.phone}`}>Call</a>}
              {s.instagram && <a className="btn ghost sm" href={s.instagram.startsWith('http') ? s.instagram : `https://instagram.com/${s.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">Instagram</a>}
              {s.website && <a className="btn ghost sm" href={s.website} target="_blank" rel="noreferrer">Website</a>}
            </div>
          </div>
          {s.hours?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 8 }}>Opening hours</h3>
              {s.hours.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--mist)', fontSize: 14.5 }}>
                  <span>{DAYS[h.dayOfWeek] ?? h.dayOfWeek}</span>
                  <span className="muted">{h.closed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="section-title"><span className="stitch-under">Products</span></h2>
        <div className="grid products" style={{ marginTop: 20 }}>
          {s.products?.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          {!s.products?.length && <p className="muted">This store hasn't listed products yet.</p>}
        </div>
      </div>
    </main>
  )
}
