import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { usuario, cargando } = useAuth()

    if (cargando) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#c8f560', width: 32, height: 32, borderWidth: 3 }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 }}>Cargando...</p>
            </div>
        )
    }

    if (!usuario) return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute
