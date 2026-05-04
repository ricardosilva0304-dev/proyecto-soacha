import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch {
            setError('Correo o contraseña incorrectos. Intenta de nuevo.')
        }
        setLoading(false)
    }

    return (
        <div className="login-page">

            {/* Brand panel */}
            <div className="login-brand">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(22,163,74,0.4)'
                    }}>
                        <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-display" style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>GestiónSoacha</p>
                        <p style={{ color: '#5a7090', fontSize: 12 }}>Plataforma de Gestión Empresarial</p>
                    </div>
                </div>

                {/* Hero */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 100, padding: '6px 14px', marginBottom: 24
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Proyecto de Grado · UNIMINUTO</span>
                    </div>

                    <h1 className="font-display" style={{ color: '#fff', fontSize: 38, lineHeight: 1.15, marginBottom: 16, fontWeight: 800 }}>
                        Gestiona tu negocio de forma{' '}
                        <span style={{ color: '#4ade80' }}>inteligente</span>
                    </h1>
                    <p style={{ color: '#5a7090', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                        Control total de inventario, ventas y clientes en una sola plataforma diseñada para los pequeños negocios de Soacha, Cundinamarca.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                        {[
                            { icon: '📦', label: 'Inventario', desc: 'Control en tiempo real' },
                            { icon: '🛒', label: 'Ventas', desc: 'Punto de venta ágil' },
                            { icon: '👥', label: 'Clientes', desc: 'CRM integrado' },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 14, padding: '14px 12px'
                            }}>
                                <span style={{ fontSize: 22, display: 'block', marginBottom: 8 }}>{item.icon}</span>
                                <p style={{ color: '#d0dce8', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.label}</p>
                                <p style={{ color: '#3d4f66', fontSize: 11, marginTop: 3 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 12, color: '#3d4f66' }}>
                        Sistema activo — Corporación Universitaria Minuto de Dios
                    </span>
                </div>
            </div>

            {/* Form panel */}
            <div className="login-form-panel">
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }} className="login-mobile-logo">
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="font-display" style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>GestiónSoacha</span>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <h2 className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                            Bienvenido de nuevo
                        </h2>
                        <p style={{ color: '#5a7090', fontSize: 14 }}>Ingresa tus credenciales para acceder al panel</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
                            display: 'flex', alignItems: 'flex-start', gap: 10
                        }}>
                            <svg width="16" height="16" fill="none" stroke="#f87171" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a7090', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Correo electrónico
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg width="15" height="15" fill="none" stroke="#5a7090" viewBox="0 0 24 24"
                                    style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@gestion.com"
                                    style={{
                                        width: '100%', padding: '11px 14px 11px 38px',
                                        background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, fontSize: 14, color: '#fff', outline: 'none',
                                        transition: 'all 0.15s', fontFamily: 'var(--font-body)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5a7090', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg width="15" height="15" fill="none" stroke="#5a7090" viewBox="0 0 24 24"
                                    style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '11px 40px 11px 38px',
                                        background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, fontSize: 14, color: '#fff', outline: 'none',
                                        transition: 'all 0.15s', fontFamily: 'var(--font-body)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a7090', cursor: 'pointer', padding: 4 }}
                                >
                                    {showPass
                                        ? <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        : <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Demo credentials */}
                        <div style={{
                            background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)',
                            borderRadius: 12, padding: '12px 14px', marginBottom: 20
                        }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Credenciales de demo
                            </p>
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 11, color: '#3d4f66', marginBottom: 2 }}>Email</p>
                                    <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4ade80' }}>admin@gestion.com</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: '#3d4f66', marginBottom: 2 }}>Contraseña</p>
                                    <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4ade80' }}>password</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                                background: loading ? '#3d4f66' : 'linear-gradient(135deg, #16a34a, #15803d)',
                                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.4)',
                                transition: 'all 0.15s'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Ingresar al Sistema
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#3d4f66', fontSize: 12, marginTop: 28 }}>
                        GestiónSoacha · Proyecto de Grado UNIMINUTO 2025
                    </p>
                </div>
            </div>

            <style>{`
        @media (min-width: 1024px) {
          .login-mobile-logo { display: none !important; }
        }
      `}</style>
        </div>
    )
}

export default Login