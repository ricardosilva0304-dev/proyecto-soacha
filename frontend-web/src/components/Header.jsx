import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const routes = {
    '/dashboard': { title: 'Dashboard', sub: 'Resumen del negocio' },
    '/inventario': { title: 'Inventario', sub: 'Productos y stock' },
    '/clientes': { title: 'Clientes', sub: 'Base de clientes' },
    '/pos': { title: 'Punto de Venta', sub: 'Registro de ventas' },
}

function Header({ onMenuClick }) {
    const location = useLocation()
    const [time, setTime] = useState(new Date())
    const info = routes[location.pathname] || { title: 'Panel', sub: '' }

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const timeStr = time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
    const dateStr = time.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'short' })
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

    return (
        <header className="app-header">

            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Hamburger (mobile) */}
                <button
                    onClick={onMenuClick}
                    className="btn btn-secondary btn-icon"
                    style={{ display: 'none' }}
                    id="menu-btn"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#1e2736', lineHeight: 1.2, margin: 0 }}>
                        {info.title}
                    </h1>
                    <p style={{ fontSize: 12, color: '#8098b8', margin: 0 }}>{info.sub}</p>
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                {/* Date/time */}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    padding: '6px 12px', background: '#f4f6f9', borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e2736', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                        {timeStr}
                    </span>
                    <span style={{ fontSize: 11, color: '#8098b8' }}>{cap(dateStr)}</span>
                </div>

                {/* Status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 10,
                    background: '#f0fdf4', border: '1px solid #bbf7d0'
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
                        animation: 'pulse 2s infinite'
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>En línea</span>
                </div>

                {/* Notifications */}
                <button className="btn btn-secondary btn-icon" style={{ position: 'relative' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span style={{
                        position: 'absolute', top: 7, right: 7,
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#16a34a', border: '1.5px solid #fff'
                    }} />
                </button>

            </div>
        </header>
    )
}

export default Header