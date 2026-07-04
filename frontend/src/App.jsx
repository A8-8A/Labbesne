import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import StoreProfile from './pages/StoreProfile.jsx'
import Login from './pages/Login.jsx'
import Requests from './pages/Requests.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'
import StoreForm from './pages/owner/StoreForm.jsx'
import ProductEditor from './pages/owner/ProductEditor.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import { useAuth } from './context/AuthContext.jsx'

function Guard({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/store/:id" element={<StoreProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/requests" element={<Guard><Requests /></Guard>} />
        <Route path="/owner/dashboard" element={<Guard role="OWNER"><OwnerDashboard /></Guard>} />
        <Route path="/owner/store-profile" element={<Guard role="OWNER"><StoreForm /></Guard>} />
        <Route path="/owner/products/new" element={<Guard role="OWNER"><ProductEditor /></Guard>} />
        <Route path="/owner/products/:productId/edit" element={<Guard role="OWNER"><ProductEditor /></Guard>} />
        <Route path="/admin/dashboard" element={<Guard role="ADMIN"><AdminDashboard /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
