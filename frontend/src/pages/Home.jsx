import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api/client.js'
import ProductCard from '../components/ProductCard.jsx'
import StoreCard from '../components/StoreCard.jsx'

const CATEGORIES = ['Men', 'Women', 'Shoes', 'Accessories', 'Formal wear', 'Streetwear', 'Sportswear']

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/api/home').then(setData).catch(e => setError(e.message)) }, [])

  return (
    <main>
      {/* Hero */}
      <section style={{ background: 'var(--cedar)', color: 'var(--linen)', overflow: 'hidden' }}>
        <div className="container" style={{ padding: '72px 20px 80px' }}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(38px, 6vw, 68px)', maxWidth: 760 }}
          >
            Real stores. Real racks.<br />
            <span style={{ color: 'var(--thread)' }}>Right around the corner.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ marginTop: 16, maxWidth: 520, fontSize: 18, opacity: 0.85 }}
          >
            Labbesne connects you with local clothing stores — browse their pieces,
            check what's in stock, and reserve before you visit.
          </motion.p>
          <motion.div
            className="row" style={{ marginTop: 28 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          >
            {CATEGORIES.map(c => (
              <a key={c} href={`/search?q=${encodeURIComponent(c)}`}
                 className="btn ghost sm" style={{ borderColor: 'rgba(244,242,236,.4)', color: 'var(--linen)' }}>
                {c}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container">
        {error && <p className="error" style={{ marginTop: 30 }}>{error} — is the API running?</p>}

        <h2 className="section-title"><span className="stitch-under">New arrivals</span></h2>
        <div className="grid products" style={{ marginTop: 20 }}>
          {data?.newArrivals?.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          {data && !data.newArrivals?.length && <p className="muted">No products yet — stores are stitching things up.</p>}
        </div>

        {data?.discounted?.length > 0 && <>
          <h2 className="section-title"><span className="stitch-under">On discount</span></h2>
          <div className="grid products" style={{ marginTop: 20 }}>
            {data.discounted.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        </>}

        <h2 className="section-title"><span className="stitch-under">Popular stores</span></h2>
        <div className="grid stores" style={{ margin: '20px 0 60px' }}>
          {data?.popularStores?.map((s, i) => <StoreCard key={s.id} s={s} index={i} />)}
          {data && !data.popularStores?.length && <p className="muted">No approved stores yet.</p>}
        </div>
      </div>
    </main>
  )
}
