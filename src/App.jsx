import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Inventario from './pages/Inventario'
import Clientes from './pages/Clientes'
import POS from './pages/POS'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const touchStartX = useRef(null)
    const touchStartY = useRef(null)

    // Close sidebar on route change (back button)
    useEffect(() => {
        setSidebarOpen(false)
    }, [window.location.pathname])

    // Swipe-right to open sidebar, swipe-left to close
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)

        // Only horizontal swipes (dx > dy * 1.5 = more horizontal than vertical)
        if (Math.abs(dx) > dy * 1.5 && Math.abs(dx) > 50) {
            if (dx > 0 && touchStartX.current < 40 && !sidebarOpen) {
                setSidebarOpen(true)  // swipe right from edge
            } else if (dx < 0 && sidebarOpen) {
                setSidebarOpen(false) // swipe left to close
            }
        }
        touchStartX.current = null
        touchStartY.current = null
    }

    return (
        <div
            className="app-layout"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-content">
                <Header onMenuClick={() => setSidebarOpen(s => !s)} />
                <main className="page-content fade-in">
                    {children}
                </main>
            </div>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/inventario" element={<ProtectedRoute><Layout><Inventario /></Layout></ProtectedRoute>} />
                    <Route path="/clientes" element={<ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>} />
                    <Route path="/pos" element={<ProtectedRoute><Layout><POS /></Layout></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
