import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const nav = [
    {
        path: '/dashboard', label: 'Dashboard', desc: 'Resumen general',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        path: '/inventario', label: 'Inventario', desc: 'Productos y stock',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        )
    },
    {
        path: '/clientes', label: 'Clientes', desc: 'Base de clientes',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        path: '/pos', label: 'Punto de Venta', desc: 'Registrar ventas',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
]

function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
        onClose?.()
    }

    return (
        <>
            {/* Overlay mobile */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

                {/* Logo */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(22,163,74,0.4)', flexShrink: 0
                        }}>
                            <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p className="font-display" style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>GestiónSoacha</p>
                            <p style={{ color: '#5a7090', fontSize: 11, marginTop: 1 }}>Panel Administrativo</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#3d4f66',
                        padding: '0 10px', marginBottom: 8
                    }}>
                        Menú Principal
                    </p>

                    {nav.map(({ path, label, desc, icon }) => {
                        const active = location.pathname === path
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-item ${active ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <span className="nav-icon">{icon}</span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
                                    <span style={{
                                        display: 'block', fontSize: 11,
                                        color: active ? 'rgba(255,255,255,0.55)' : '#3d4f66',
                                        marginTop: 1
                                    }}>{desc}</span>
                                </span>
                                {active && (
                                    <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.4)" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </Link>
                        )
                    })}

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 10px' }} />

                    <p style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#3d4f66',
                        padding: '0 10px', marginBottom: 8
                    }}>
                        Sistema
                    </p>

                    <div className="nav-item" style={{ cursor: 'default' }}>
                        <span className="nav-icon">
                            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Configuración</span>
                            <span style={{ display: 'block', fontSize: 11, color: '#3d4f66' }}>Preferencias</span>
                        </span>
                    </div>
                </nav>

                {/* User footer */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', gap: 10
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 14, fontWeight: 700
                        }}>
                            {(usuario?.nombre?.[0] || 'A').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#d0dce8', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {usuario?.nombre || 'Administrador'}
                            </p>
                            <p style={{ fontSize: 11, color: '#3d4f66', marginTop: 2 }}>Admin · Activo</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: 30, height: 30, borderRadius: 8, border: 'none',
                                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
                            }}
                            title="Cerrar sesión"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 4px 0' }}>
                        <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: 11, color: '#3d4f66' }}>Soacha, Cundinamarca · UNIMINUTO</span>
                    </div>
                </div>

            </aside>
        </>
    )
}

export default Sidebar