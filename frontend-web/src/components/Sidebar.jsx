import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
    {
        path: '/dashboard', label: 'Dashboard', sub: 'Resumen general',
        icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
        path: '/inventario', label: 'Inventario', sub: 'Productos y stock',
        icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    },
    {
        path: '/clientes', label: 'Clientes', sub: 'Base de clientes',
        icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
        path: '/pos', label: 'Punto de Venta', sub: 'Registrar ventas',
        icon: <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
]

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => { logout(); navigate('/login'); onClose?.() }

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* Logo */}
                <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                            background: 'linear-gradient(135deg, #c8f560 0%, #a8d940 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(200,245,96,0.35)'
                        }}>
                            <svg width="19" height="19" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>GestiónSoacha</p>
                            <p style={{ color: 'var(--ink-20)', fontSize: 10.5, letterSpacing: '0.04em', marginTop: 1 }}>PANEL ADMINISTRATIVO</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
                    <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-30)', padding: '0 10px', marginBottom: 8 }}>MENÚ PRINCIPAL</p>

                    {nav.map(({ path, label, sub, icon }) => {
                        const active = location.pathname === path
                        return (
                            <Link key={path} to={path} className={`nav-item ${active ? 'active' : ''}`} onClick={onClose}>
                                <span className="nav-icon">{icon}</span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{label}</span>
                                    <span style={{ display: 'block', fontSize: 10.5, color: active ? 'rgba(200,245,96,0.5)' : 'var(--ink-30)', marginTop: 1 }}>{sub}</span>
                                </span>
                                {active && (
                                    <svg width="11" height="11" fill="none" stroke="var(--lime)" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </Link>
                        )
                    })}

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 10px' }} />
                    <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-30)', padding: '0 10px', marginBottom: 8 }}>SISTEMA</p>

                    <div className="nav-item" style={{ cursor: 'default' }}>
                        <span className="nav-icon">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </span>
                        <span>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>Configuración</span>
                            <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-30)' }}>Preferencias</span>
                        </span>
                    </div>
                </nav>

                {/* User */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ borderRadius: 13, padding: '11px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, #c8f560, #a8d940)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#080c0a', fontSize: 13, fontWeight: 900
                        }}>
                            {(usuario?.nombre?.[0] || 'A').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                                {usuario?.nombre || 'Administrador'}
                            </p>
                            <p style={{ fontSize: 10.5, color: 'var(--ink-20)', marginTop: 1 }}>Admin · Activo</p>
                        </div>
                        <button onClick={handleLogout} title="Cerrar sesión" style={{
                            width: 28, height: 28, borderRadius: 8, border: 'none',
                            background: 'rgba(255,107,107,0.12)', color: '#ff9b9b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.12)'}
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 4px 2px' }}>
                        <span className="pulse-dot" />
                        <span style={{ fontSize: 10, color: 'var(--ink-30)', letterSpacing: '0.02em' }}>Soacha · UNIMINUTO</span>
                    </div>
                </div>
            </aside>
        </>
    )
}