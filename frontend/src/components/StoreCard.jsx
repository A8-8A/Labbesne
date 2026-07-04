import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function StoreCard({ s, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
    >
      <Link to={`/store/${s.id}`} className="card" style={{ display: 'block' }}>
        <div style={{ height: 110, background: 'var(--cedar)', overflow: 'hidden' }}>
          {s.bannerUrl && <img src={s.bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ padding: '0 16px 16px', marginTop: -28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--white)',
            background: 'var(--mist)', overflow: 'hidden'
          }}>
            {s.logoUrl && <img src={s.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <h3 style={{ margin: '8px 0 2px', fontSize: 19 }}>{s.name}</h3>
          <div className="muted" style={{ fontSize: 13.5 }}>{s.categories || s.address}</div>
        </div>
      </Link>
    </motion.div>
  )
}
