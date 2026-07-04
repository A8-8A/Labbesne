import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client.js'
import { uploadImage } from '../../api/firebase.js'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const emptyHours = DAYS.map((_, i) => ({ dayOfWeek: i, openTime: '10:00', closeTime: '20:00', closed: i === 0 }))

export default function StoreForm() {
  const nav = useNavigate()
  const [store, setStore] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', address: '', latitude: null, longitude: null,
    phone: '', whatsapp: '', instagram: '', website: '', googlePlaceId: '',
    logoUrl: null, bannerUrl: null, categories: '', hours: emptyHours,
  })
  const [mapsLink, setMapsLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/owner/store').then(res => {
      if (res.exists) {
        setStore(res.store)
        setForm({ ...res.store, hours: res.store.hours?.length ? res.store.hours : emptyHours })
      }
    }).catch(e => setError(e.message))
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  /* Parse what we safely can from a Google Maps share link client-side:
     coordinates + place name from the URL itself. Full details (phone, hours,
     Place ID) need the Google Places API — wire a key in later and swap this. */
  function importFromMaps() {
    try {
      const decoded = decodeURIComponent(mapsLink)
      const coordMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
      const nameMatch = decoded.match(/\/place\/([^/@]+)/)
      const next = { ...form }
      if (coordMatch) { next.latitude = parseFloat(coordMatch[1]); next.longitude = parseFloat(coordMatch[2]) }
      if (nameMatch && !form.name) next.name = nameMatch[1].replace(/\+/g, ' ')
      setForm(next)
      if (!coordMatch && !nameMatch) setError('Could not read that link — paste a full Google Maps place URL.')
      else setError('')
    } catch { setError('Could not read that link.') }
  }

  async function handleUpload(e, key) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const url = await uploadImage(file, `stores/${store?.id ?? 'new'}`)
      setForm(f => ({ ...f, [key]: url }))
    } catch (err) { setError('Upload failed: ' + err.message) } finally { setBusy(false) }
  }

  function setHour(i, key, value) {
    const hours = form.hours.map((h, idx) => idx === i ? { ...h, [key]: value } : h)
    setForm({ ...form, hours })
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (store) await api.put(`/api/owner/store/${store.id}`, form)
      else await api.post('/api/owner/store', form)
      nav('/owner/dashboard')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <main className="container" style={{ maxWidth: 720, paddingBottom: 70 }}>
      <h1 className="section-title">{store ? 'Edit store' : 'Store setup'}</h1>
      <hr className="stitch" />

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="field">
          <label>Import from Google Maps (optional)</label>
          <div className="row">
            <input style={{ flex: 1 }} value={mapsLink} onChange={e => setMapsLink(e.target.value)}
                   placeholder="Paste your store's Google Maps link" />
            <button type="button" className="btn ghost sm" onClick={importFromMaps}>Import</button>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Fills name and map location. Review everything before saving.</p>
        </div>
      </div>

      <form onSubmit={save}>
        <div className="field"><label>Store name</label><input required value={form.name} onChange={set('name')} /></div>
        <div className="field"><label>Description</label><textarea rows={3} value={form.description || ''} onChange={set('description')} /></div>
        <div className="field"><label>Address</label><input value={form.address || ''} onChange={set('address')} /></div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Phone</label><input value={form.phone || ''} onChange={set('phone')} /></div>
          <div className="field" style={{ flex: 1 }}><label>WhatsApp</label><input value={form.whatsapp || ''} onChange={set('whatsapp')} /></div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}><label>Instagram</label><input value={form.instagram || ''} onChange={set('instagram')} placeholder="@yourstore" /></div>
          <div className="field" style={{ flex: 1 }}><label>Website</label><input value={form.website || ''} onChange={set('website')} /></div>
        </div>
        <div className="field"><label>Categories (comma separated)</label>
          <input value={form.categories || ''} onChange={set('categories')} placeholder="Streetwear, Hoodies, Sneakers" /></div>

        <div className="row" style={{ margin: '10px 0 20px' }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Logo {form.logoUrl && '✓'}</label>
            <input type="file" accept="image/*" onChange={e => handleUpload(e, 'logoUrl')} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Banner {form.bannerUrl && '✓'}</label>
            <input type="file" accept="image/*" onChange={e => handleUpload(e, 'bannerUrl')} />
          </div>
        </div>

        <h3 style={{ margin: '10px 0' }}>Opening hours</h3>
        {form.hours.map((h, i) => (
          <div key={i} className="row" style={{ marginBottom: 8 }}>
            <span style={{ width: 100, fontWeight: 600, fontSize: 14 }}>{DAYS[h.dayOfWeek]}</span>
            <label style={{ fontSize: 14 }}>
              <input type="checkbox" checked={h.closed} onChange={e => setHour(i, 'closed', e.target.checked)} /> Closed
            </label>
            {!h.closed && <>
              <input type="time" value={h.openTime || ''} onChange={e => setHour(i, 'openTime', e.target.value)} />
              <span>–</span>
              <input type="time" value={h.closeTime || ''} onChange={e => setHour(i, 'closeTime', e.target.value)} />
            </>}
          </div>
        ))}

        <button className="btn thread" disabled={busy} style={{ marginTop: 20 }}>
          {busy ? 'Saving…' : store ? 'Save changes' : 'Submit for approval'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </main>
  )
}
