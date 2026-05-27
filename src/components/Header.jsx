import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const routes = {
    '/dashboard': { title: 'Dashboard', sub: 'Resumen del negocio' },
    '/inventario': { title: 'Inventario', sub: 'Productos y stock' },
    '/clientes':   { title: 'Clientes',   sub: 'Base de clientes' },
    '/pos':        { title: 'Punto de Venta', sub: 'Registro de ventas' },
}

export default function Header({ onMenuClick }) {
    const location = useLocation()
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()
    const [time, setTime] = useState(new Date())
    const [narrow, setNarrow] = useState(window.innerWidth < 480)
    const info = routes[location.pathname] || { title: 'Panel', sub: '' }

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < 480)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const timeStr = time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
    const dateStr = time.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <header className="app-header">
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                {/* Hamburger — always rendered, shown via CSS on mobile */}
                <button
                    onClick={onMenuClick}
                    id="menu-btn"
                    style={{
                        display: 'none',
                        width: 38, height: 38,
                        borderRadius: 10,
                        border: '1.5px solid rgba(8,12,10,0.1)',
                        background: 'var(--surface)',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--ink-50)',
                        flexShrink: 0, transition: 'all 0.15s'
                    }}
                >
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div style={{ minWidth: 0 }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(16px, 3vw, 19px)',
                        fontWeight: 800, color: 'var(--ink)',
                        letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {info.title}
                    </h1>
                    <p style={{ fontSize: 11, color: 'var(--ink-20)', margin: 0, whiteSpace: 'nowrap' }}>{info.sub}</p>
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

                {/* Clock — hide on very small screens */}
                {!narrow && (
                    <div style={{
                        padding: '5px 12px', borderRadius: 10,
                        background: 'var(--surface)', border: '1px solid rgba(8,12,10,0.08)',
                        textAlign: 'right', flexShrink: 0
                    }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</p>
                        <p style={{ fontSize: 10, color: 'var(--ink-20)', textTransform: 'capitalize' }}>{cap(dateStr)}</p>
                    </div>
                )}

                {/* Status dot */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: narrow ? '8px' : '6px 12px', borderRadius: 10,
                    background: 'rgba(200,245,96,0.12)',
                    border: '1px solid rgba(200,245,96,0.25)',
                }}>
                    <span className="pulse-dot" />
                    {!narrow && <span style={{ fontSize: 12, fontWeight: 700, color: '#4a7020', letterSpacing: '-0.01em' }}>En línea</span>}
                </div>

                {/* Avatar / logout on mobile */}
                <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    style={{
                        width: 36, height: 36, borderRadius: 10,
                        border: '1.5px solid rgba(255,107,107,0.2)',
                        background: 'rgba(255,107,107,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#c53030', flexShrink: 0, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.06)'}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>

            <style>{`@media(max-width:1023px){#menu-btn{display:flex!important;}}`}</style>
        </header>
    )
}
