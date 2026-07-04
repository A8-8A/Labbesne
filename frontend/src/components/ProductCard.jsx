import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProductCard({ p, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
    >
      <Link to={`/product/${p.id}`} className="card pcard">
        <div className="img-wrap">
          {p.image
            ? <img src={p.image} alt={p.name} loading="lazy" />
            : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-soft)' }}>No photo yet</div>}
        </div>
        <div className="body">
          <div className="store">{p.storeName}</div>
          <div className="name">{p.name}</div>
          <div className="price">
            ${p.discountPrice ?? p.basePrice}
            {p.discountPrice && <span className="old">${p.basePrice}</span>}
          </div>
          {p.colors?.length > 0 && (
            <div className="dots">
              {p.colors.slice(0, 5).map((c, i) => <span key={i} className="dot" style={{ background: c }} />)}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
