import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { usuario, cargando } = useAuth()

    if (cargando) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando...</p>
                </div>
            </div>
        )
    }

    if (!usuario) return <Navigate to="/login" replace />
    return children
}

export default ProtectedRoute