import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true)
        try { await login(email, password); navigate('/dashboard') }
        catch { setError('Credenciales incorrectas. Intenta de nuevo.') }
        setLoading(false)
    }

    return (
        <div className="login-page">

            {/* Brand panel */}
            <div className="login-brand">
                <div className="login-brand-inner">
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(200,245,96,0.4)', flexShrink: 0 }}>
                            <svg width="21" height="21" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em' }}>GestiónSoacha</p>
                            <p style={{ color: 'var(--ink-20)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plataforma Empresarial</p>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 99, padding: '5px 13px', marginBottom: 24 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)' }} />
                            <span style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, letterSpacing: '0.04em' }}>PROYECTO DE GRADO · UNIMINUTO</span>
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 18 }}>
                            Gestiona tu<br />negocio de forma<br /><span style={{ color: 'var(--lime)' }}>inteligente.</span>
                        </h1>
                        <p style={{ color: 'var(--ink-10)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                            Control total de inventario, ventas y clientes en una sola plataforma diseñada para los negocios de Soacha.
                        </p>

                        {/* Feature pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {['📦 Inventario en tiempo real', '🛒 Punto de venta ágil', '👥 CRM integrado', '📊 Reportes y métricas'].map(f => (
                                <span key={f} style={{ fontSize: 12.5, color: 'var(--ink-05)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 13px', fontWeight: 500 }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: 11, color: 'var(--ink-30)', letterSpacing: '0.02em' }}>
                        Corporación Universitaria Minuto de Dios · Soacha, Cundinamarca
                    </p>
                </div>
            </div>

            {/* Form panel */}
            <div className="login-form-panel">
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* Mobile logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="17" height="17" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>GestiónSoacha</span>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>
                            Bienvenido de nuevo
                        </h2>
                        <p style={{ color: 'var(--ink-20)', fontSize: 14 }}>Ingresa tus credenciales para acceder</p>
                    </div>

                    {/* Demo hint */}
                    <div style={{ background: 'rgba(200,245,96,0.08)', border: '1px solid rgba(200,245,96,0.15)', borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
                        <p style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--lime)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>Acceso Demo</p>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <div><p style={{ fontSize: 10.5, color: 'var(--ink-20)' }}>Email</p><p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--lime)' }}>admin@gestion.com</p></div>
                            <div><p style={{ fontSize: 10.5, color: 'var(--ink-20)' }}>Contraseña</p><p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--lime)' }}>password</p></div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 11, padding: '11px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <svg width="15" height="15" fill="none" stroke="#ff9b9b" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p style={{ color: '#ff9b9b', fontSize: 13 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Correo electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <svg width="14" height="14" fill="none" stroke="var(--ink-30)" viewBox="0 0 24 24" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@gestion.com"
                                    style={{ width: '100%', padding: '11px 14px 11px 38px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 11, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.15s', letterSpacing: '-0.01em' }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(200,245,96,0.4)'; e.target.style.background = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,245,96,0.08)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <svg width="14" height="14" fill="none" stroke="var(--ink-30)" viewBox="0 0 24 24" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                                    style={{ width: '100%', padding: '11px 38px 11px 38px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 11, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                                    onFocus={e => { e.target.style.borderColor = 'rgba(200,245,96,0.4)'; e.target.style.background = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = '0 0 0 3px rgba(200,245,96,0.08)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-20)', cursor: 'pointer', padding: 4 }}>
                                    {showPass
                                        ? <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                            background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#c8f560,#a8d940)',
                            color: loading ? 'rgba(255,255,255,0.4)' : '#080c0a',
                            fontSize: 14.5, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
                            boxShadow: loading ? 'none' : '0 8px 28px rgba(200,245,96,0.4)',
                            transition: 'all 0.18s'
                        }}>
                            {loading ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)' }} />Verificando...</>
                                : <>Ingresar al Sistema <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: 'var(--ink-30)', fontSize: 11, marginTop: 28, letterSpacing: '0.02em' }}>
                        GestiónSoacha · Proyecto de Grado UNIMINUTO 2025
                    </p>
                </div>
            </div>
        </div>
    )
}