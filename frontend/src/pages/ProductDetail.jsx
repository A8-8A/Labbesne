import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ReportButton from '../components/ReportButton.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [p, setP] = useState(null)
  const [variantIdx, setVariantIdx] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
  const [size, setSize] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setP(null); setVariantIdx(0); setImgIdx(0); setSize(''); setSent('')
    api.get(`/api/products/${id}`).then(setP).catch(e => setError(e.message))
  }, [id])

  const variant = p?.variants?.[variantIdx]
  const sizes = useMemo(() => (variant?.availableSizes || '').split(',').map(s => s.trim()).filter(Boolean), [variant])
  const images = variant?.images?.length ? variant.images : (p?.image ? [p.image] : [])
  const price = variant?.price ?? p?.discountPrice ?? p?.basePrice

  async function send(type) {
    if (!user) return nav('/login')
    try {
      await api.post('/api/transactions', {
        productId: p.id, variantId: variant?.id, type,
        message: msg, selectedSize: size,
      })
      setSent(type === 'RESERVATION' ? 'Reservation sent — the store will confirm.' : 'Message sent to the store.')
    } catch (e) { setError(e.message) }
  }

  if (error && !p) return <main className="container"><p className="error" style={{ marginTop: 40 }}>{error}</p></main>
  if (!p) return <main className="container"><p className="muted" style={{ marginTop: 40 }}>Loading…</p></main>

  return (
    <main className="container" style={{ paddingBottom: 70 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, marginTop: 36 }}>
        {/* Gallery */}
        <div>
          <div className="card" style={{ aspectRatio: '3/4', position: 'relative', background: 'var(--mist)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variantIdx}-${imgIdx}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', inset: 0 }}
              >
                {images[imgIdx]
                  ? <img src={images[imgIdx]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-soft)' }}>No photo</div>}
              </motion.div>
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="row" style={{ marginTop: 10 }}>
              {images.map((url, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 64, height: 80, borderRadius: 8, overflow: 'hidden', padding: 0,
                           border: i === imgIdx ? '2px solid var(--thread)' : '2px solid var(--mist)' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Link to={`/store/${p.storeId}`} className="muted" style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 13, fontWeight: 700 }}>
            {p.storeName} →
          </Link>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '8px 0' }}>{p.name}</h1>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>
            ${price}
            {p.discountPrice && !variant?.price && <span className="muted" style={{ textDecoration: 'line-through', fontSize: 18, marginLeft: 10 }}>${p.basePrice}</span>}
          </div>
          <hr className="stitch" style={{ margin: '18px 0' }} />
          <p style={{ maxWidth: 480 }}>{p.description}</p>

          {p.variants?.length > 0 && <>
            <p style={{ margin: '22px 0 8px', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Color — {variant?.colorName}
            </p>
            <div className="row">
              {p.variants.map((v, i) => (
                <button key={v.id ?? i} className={`color-circle ${i === variantIdx ? 'active' : ''}`}
                  style={{ background: v.colorHex || '#ccc' }}
                  title={v.colorName}
                  onClick={() => { setVariantIdx(i); setImgIdx(0); setSize('') }} />
              ))}
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
              {variant?.stockQuantity > 0 ? `${variant.stockQuantity} in stock` : 'Out of stock'}
            </p>
          </>}

          {sizes.length > 0 && <>
            <p style={{ margin: '18px 0 8px', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>Size</p>
            <div className="row">
              {sizes.map(s => (
                <button key={s} className={`size-pill ${s === size ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </>}

          <div className="field" style={{ marginTop: 22 }}>
            <label>Message to store (optional)</label>
            <textarea rows={2} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Is this available today?" />
          </div>

          {sent
            ? <span className="badge APPROVED">{sent}</span>
            : <div className="row">
                <button className="btn thread" disabled={variant && variant.stockQuantity === 0} onClick={() => send('RESERVATION')}>Reserve item</button>
                <button className="btn ghost" onClick={() => send('INQUIRY')}>Contact store</button>
              </div>}
          {error && <div className="error">{error}</div>}
          <div style={{ marginTop: 18 }}>
            <ReportButton targetType="PRODUCT" targetId={p.id} />
          </div>
        </div>
      </div>

      {p.similar?.length > 0 && <>
        <h2 className="section-title"><span className="stitch-under">Similar pieces</span></h2>
        <div className="grid products" style={{ marginTop: 20 }}>
          {p.similar.map((sp, i) => <ProductCard key={sp.id} p={sp} index={i} />)}
        </div>
      </>}
    </main>
  )
}
