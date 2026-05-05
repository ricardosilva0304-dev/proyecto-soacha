import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const routes = {
    '/dashboard': { title: 'Dashboard', sub: 'Resumen del negocio' },
    '/inventario': { title: 'Inventario', sub: 'Productos y stock' },
    '/clientes': { title: 'Clientes', sub: 'Base de clientes' },
    '/pos': { title: 'Punto de Venta', sub: 'Registro de ventas' },
}

export default function Header({ onMenuClick }) {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={onMenuClick} id="menu-btn" style={{
                    display: 'none', width: 34, height: 34, borderRadius: 9, border: '1.5px solid rgba(8,12,10,0.1)',
                    background: 'var(--surface)', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--ink-50)'
                }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
                        {info.title}
                    </h1>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-20)', margin: 0 }}>{info.sub}</p>
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                {/* Clock */}
                <div style={{
                    padding: '6px 13px', borderRadius: 10,
                    background: 'var(--surface)', border: '1px solid rgba(8,12,10,0.08)',
                    textAlign: 'right'
                }}>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
                    <p style={{ fontSize: 10.5, color: 'var(--ink-20)', textTransform: 'capitalize' }}>{cap(dateStr)}</p>
                </div>

                {/* Status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 10,
                    background: 'rgba(200,245,96,0.12)',
                    border: '1px solid rgba(200,245,96,0.25)',
                }}>
                    <span className="pulse-dot" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4a7020', letterSpacing: '-0.01em' }}>En línea</span>
                </div>

                {/* Notifications */}
                <button style={{
                    width: 34, height: 34, borderRadius: 9,
                    border: '1.5px solid rgba(8,12,10,0.09)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', color: 'var(--ink-40)',
                    transition: 'all 0.15s'
                }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', border: '1.5px solid #fff' }} />
                </button>
            </div>

            <style>{`@media(max-width:1024px){#menu-btn{display:flex!important;}}`}</style>
        </header>
    )
}