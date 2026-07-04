import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client.js'
import { uploadImage } from '../../api/firebase.js'

const CATEGORIES = ['Men', 'Women', 'Shoes', 'Accessories', 'Formal wear', 'Streetwear', 'Sportswear']
const newVariant = () => ({ colorName: '', colorHex: '#191A17', price: '', stockQuantity: 0, availableSizes: 'S,M,L,XL', imageUrls: [] })

export default function ProductEditor() {
  const { productId } = useParams()
  const nav = useNavigate()
  const [storeId, setStoreId] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', category: CATEGORIES[0], gender: 'UNISEX',
    basePrice: '', discountPrice: '', tags: '', fulfillment: 'PICKUP',
    status: 'ACTIVE', variants: [newVariant()],
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/owner/store').then(async res => {
      if (!res.exists) return nav('/owner/store-profile')
      setStoreId(res.store.id)
      if (productId) {
        const list = await api.get(`/api/owner/store/${res.store.id}/products`)
        const p = list.find(x => String(x.id) === String(productId))
        if (p) setForm({
          ...p, discountPrice: p.discountPrice ?? '',
          variants: p.variants.map(v => ({ ...v, imageUrls: v.images || [] })),
        })
      }
    }).catch(e => setError(e.message))
  }, [productId, nav])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setV = (i, k, val) => setForm({ ...form, variants: form.variants.map((v, idx) => idx === i ? { ...v, [k]: val } : v) })

  async function uploadVariantImages(i, files) {
    setBusy(true)
    try {
      const urls = []
      for (const file of files) urls.push(await uploadImage(file, `products/${productId ?? 'new'}`))
      setV(i, 'imageUrls', [...form.variants[i].imageUrls, ...urls])
    } catch (e) { setError('Upload failed: ' + e.message) } finally { setBusy(false) }
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const payload = {
      ...form,
      basePrice: form.basePrice === '' ? null : form.basePrice,
      discountPrice: form.discountPrice === '' ? null : form.discountPrice,
      variants: form.variants.map(v => ({ ...v, price: v.price === '' ? null : v.price })),
    }
    try {
      if (productId) await api.put(`/api/owner/store/${storeId}/products/${productId}`, payload)
      else await api.post(`/api/owner/store/${storeId}/products`, payload)
      nav('/owner/dashboard')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <main className="container" style={{ maxWidth: 760, paddingBottom: 70 }}>
      <h1 className="section-title">{productId ? 'Edit product' : 'New product'}</h1>
      <hr className="stitch" />
      <form onSubmit={save}>
        <div className="field"><label>Name</label><input required value={form.name} onChange={set('name')} /></div>
        <div className="field"><label>Description</label><textarea rows={3} value={form.description || ''} onChange={set('description')} /></div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Category</label>
            <select value={form.category || ''} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>For</label>
            <select value={form.gender || ''} onChange={set('gender')}>
              <option>UNISEX</option><option>MEN</option><option>WOMEN</option><option>KIDS</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Base price ($)</label><input type="number" step="0.01" required value={form.basePrice} onChange={set('basePrice')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Discount price ($)</label><input type="number" step="0.01" value={form.discountPrice} onChange={set('discountPrice')} /></div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Tags</label><input value={form.tags || ''} onChange={set('tags')} placeholder="hoodie, oversized, winter" /></div>
          <div className="field" style={{ flex: 1 }}>
            <label>Fulfillment</label>
            <select value={form.fulfillment || ''} onChange={set('fulfillment')}>
              <option value="PICKUP">Pickup</option><option value="DELIVERY">Delivery</option><option value="BOTH">Both</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="ACTIVE">Publish</option><option value="DRAFT">Draft</option><option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        <h3 style={{ margin: '18px 0 10px' }}>Color variants</h3>
        {form.variants.map((v, i) => (
          <div key={i} className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div className="row">
              <div className="field" style={{ flex: 2 }}><label>Color name</label><input value={v.colorName} onChange={e => setV(i, 'colorName', e.target.value)} placeholder="Black" /></div>
              <div className="field"><label>Swatch</label><input type="color" value={v.colorHex || '#191A17'} onChange={e => setV(i, 'colorHex', e.target.value)} style={{ height: 44, width: 60, padding: 4 }} /></div>
              <div className="field" style={{ flex: 1 }}><label>Price override ($)</label><input type="number" step="0.01" value={v.price ?? ''} onChange={e => setV(i, 'price', e.target.value)} placeholder="Base" /></div>
              <div className="field" style={{ flex: 1 }}><label>Stock</label><input type="number" value={v.stockQuantity ?? 0} onChange={e => setV(i, 'stockQuantity', Number(e.target.value))} /></div>
            </div>
            <div className="field"><label>Sizes (comma separated)</label><input value={v.availableSizes || ''} onChange={e => setV(i, 'availableSizes', e.target.value)} /></div>
            <div className="field">
              <label>Photos ({v.imageUrls.length})</label>
              <input type="file" accept="image/*" multiple onChange={e => uploadVariantImages(i, [...e.target.files])} />
            </div>
            {v.imageUrls.length > 0 && (
              <div className="row">
                {v.imageUrls.map((url, j) => (
                  <div key={j} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    <button type="button" className="btn danger sm" style={{ position: 'absolute', top: -8, right: -8, padding: '2px 8px' }}
                      onClick={() => setV(i, 'imageUrls', v.imageUrls.filter((_, k) => k !== j))}>×</button>
                  </div>
                ))}
              </div>
            )}
            {form.variants.length > 1 && (
              <button type="button" className="btn ghost sm" onClick={() => setForm({ ...form, variants: form.variants.filter((_, k) => k !== i) })}>
                Remove variant
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn ghost sm" onClick={() => setForm({ ...form, variants: [...form.variants, newVariant()] })}>
          + Add color variant
        </button>

        <div style={{ marginTop: 24 }}>
          <button className="btn thread" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </main>
  )
}
