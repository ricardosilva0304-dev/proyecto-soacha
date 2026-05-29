import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STYLES = `
    .login-input {
        width: 100%;
        padding: 13px 14px 13px 42px;
        background: rgba(255,255,255,0.07);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        font-size: 15px;
        font-family: var(--font-body);
        color: #ffffff;
        outline: none;
        transition: all 0.18s;
        letter-spacing: -0.01em;
        caret-color: #c8f560;
    }
    .login-input::placeholder { color: rgba(255,255,255,0.25); }
    .login-input:focus {
        border-color: rgba(200,245,96,0.55);
        background: rgba(255,255,255,0.1);
        box-shadow: 0 0 0 3px rgba(200,245,96,0.12);
    }
    .login-input:-webkit-autofill,
    .login-input:-webkit-autofill:hover,
    .login-input:-webkit-autofill:focus,
    .login-input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 9999px #1a2420 inset !important;
        -webkit-text-fill-color: #ffffff !important;
        caret-color: #c8f560;
        border-color: rgba(200,245,96,0.3) !important;
        transition: background-color 9999s ease-in-out 0s;
    }
    .login-input-wrap { position: relative; }
    .login-input-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255,255,255,0.3);
        pointer-events: none;
        display: flex;
        align-items: center;
    }
    .login-label {
        display: block;
        font-size: 10.5px;
        font-weight: 800;
        color: rgba(255,255,255,0.4);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    .login-submit {
        width: 100%;
        padding: 14px;
        border-radius: 12px;
        border: none;
        font-size: 15px;
        font-weight: 900;
        font-family: var(--font-display);
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        cursor: pointer;
        transition: all 0.18s;
        min-height: 50px;
    }
    .login-submit:not(:disabled) {
        background: linear-gradient(135deg, #c8f560, #a8d940);
        color: #080c0a;
        box-shadow: 0 8px 28px rgba(200,245,96,0.35);
    }
    .login-submit:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 36px rgba(200,245,96,0.45);
    }
    .login-submit:not(:disabled):active { transform: scale(0.98); }
    .login-submit:disabled {
        background: rgba(255,255,255,0.07);
        color: rgba(255,255,255,0.3);
        cursor: not-allowed;
    }
    .show-pass-btn {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        padding: 4px;
        transition: color 0.15s;
    }
    .show-pass-btn:hover { color: rgba(255,255,255,0.7); }
    .tab-btn {
        flex: 1;
        padding: 10px;
        background: none;
        border: none;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 800;
        font-family: var(--font-display);
        cursor: pointer;
        transition: all 0.18s;
        letter-spacing: -0.01em;
    }
    .tab-btn.active {
        background: rgba(200,245,96,0.12);
        color: #c8f560;
    }
    .tab-btn:not(.active) {
        color: rgba(255,255,255,0.3);
    }
    .tab-btn:not(.active):hover {
        color: rgba(255,255,255,0.6);
    }
`

function IconUser() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function IconMail() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
}
function IconLock() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
}
function IconEyeOff() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
}
function IconEye() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
}
function IconArrow() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
}
function IconCheck() {
    return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
}

export default function Login() {
    const [tab, setTab] = useState('login') // 'login' | 'registro'
    const [registroExitoso, setRegistroExitoso] = useState(false)

    // Login
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPass, setLoginPass] = useState('')
    const [showLoginPass, setShowLoginPass] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)

    // Registro
    const [regNombre, setRegNombre] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPass, setRegPass] = useState('')
    const [regPassConfirm, setRegPassConfirm] = useState('')
    const [showRegPass, setShowRegPass] = useState(false)
    const [regError, setRegError] = useState('')
    const [regLoading, setRegLoading] = useState(false)

    const { login, registro } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoginError('')
        setLoginLoading(true)
        try {
            await login(loginEmail, loginPass)
            navigate('/dashboard')
        } catch (err) {
            setLoginError('Credenciales incorrectas. Verifica tu email y contraseña.')
        }
        setLoginLoading(false)
    }

    const handleRegistro = async (e) => {
        e.preventDefault()
        setRegError('')
        if (regPass !== regPassConfirm) { setRegError('Las contraseñas no coinciden.'); return }
        if (regPass.length < 6) { setRegError('La contraseña debe tener al menos 6 caracteres.'); return }
        setRegLoading(true)
        try {
            await registro(regEmail, regPass, regNombre)
            setRegistroExitoso(true)
        } catch (err) {
            const msg = err.message || ''
            if (msg.includes('already registered') || msg.includes('User already registered')) {
                setRegError('Este correo ya está registrado. Intenta iniciar sesión.')
            } else if (msg.includes('invalid email') || msg.includes('Invalid email')) {
                setRegError('El correo electrónico no es válido.')
            } else {
                setRegError('Error al crear la cuenta: ' + msg)
            }
        }
        setRegLoading(false)
    }

    const strengthLevel = (p) => p.length >= 12 ? 4 : p.length >= 8 ? 3 : p.length >= 6 ? 2 : p.length > 0 ? 1 : 0
    const strengthColors = ['', '#ff6b6b', '#f5c842', '#60c8f5', '#c8f560']
    const strengthLabels = ['', 'Muy corta', 'Aceptable', 'Buena', 'Excelente']

    return (
        <div className="login-page">
            <style>{STYLES}</style>

            {/* Panel izquierdo */}
            <div className="login-brand">
                <div className="login-brand-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(200,245,96,0.4)', flexShrink: 0 }}>
                            <svg width="21" height="21" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em' }}>GestiónSoacha</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plataforma Empresarial</p>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 99, padding: '5px 13px', marginBottom: 24 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8f560' }} />
                            <span style={{ fontSize: 11, color: '#c8f560', fontWeight: 700, letterSpacing: '0.04em' }}>PROYECTO DE GRADO · UNIMINUTO</span>
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(32px,3.5vw,44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 18 }}>
                            Gestiona tu<br />negocio de forma<br /><span style={{ color: '#c8f560' }}>inteligente.</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                            Control total de inventario, ventas y clientes en una sola plataforma diseñada para los negocios de Soacha.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {['📦 Inventario en tiempo real', '🛒 Punto de venta ágil', '👥 CRM integrado', '📊 Reportes y métricas'].map(f => (
                                <span key={f} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 13px', fontWeight: 500 }}>{f}</span>
                            ))}
                        </div>
                    </div>

                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}>
                        Corporación Universitaria Minuto de Dios · Soacha, Cundinamarca
                    </p>
                </div>
            </div>

            {/* Panel derecho */}
            <div className="login-form-panel">
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* Logo mobile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>GestiónSoacha</span>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, marginBottom: 32 }}>
                        <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setLoginError(''); setRegError(''); setRegistroExitoso(false) }}>
                            Iniciar sesión
                        </button>
                        <button className={`tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => { setTab('registro'); setLoginError(''); setRegError('') }}>
                            Crear cuenta
                        </button>
                    </div>

                    {/* ── FORMULARIO LOGIN ── */}
                    {tab === 'login' && (
                        <>
                            <div style={{ marginBottom: 28 }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>Bienvenido de nuevo</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Ingresa tus credenciales para acceder</p>
                            </div>

                            {loginError && (
                                <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '12px 15px', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <svg width="15" height="15" fill="none" stroke="#ff9b9b" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p style={{ color: '#ff9b9b', fontSize: 13 }}>{loginError}</p>
                                </div>
                            )}

                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="login-label">Correo electrónico</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconMail /></span>
                                        <input className="login-input" type="email" placeholder="tu@correo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="email" />
                                    </div>
                                </div>
                                <div>
                                    <label className="login-label">Contraseña</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconLock /></span>
                                        <input className="login-input" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} required autoComplete="current-password" style={{ paddingRight: 44 }} />
                                        <button type="button" className="show-pass-btn" onClick={() => setShowLoginPass(s => !s)} tabIndex={-1}>
                                            {showLoginPass ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="login-submit" disabled={loginLoading} style={{ marginTop: 6 }}>
                                    {loginLoading
                                        ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.7)' }} />Verificando...</>
                                        : <>Ingresar al Sistema <IconArrow /></>
                                    }
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                                ¿No tienes cuenta?{' '}
                                <button onClick={() => setTab('registro')} style={{ background: 'none', border: 'none', color: '#c8f560', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                                    Regístrate
                                </button>
                            </p>
                        </>
                    )}

                    {/* ── FORMULARIO REGISTRO ── */}
                    {tab === 'registro' && !registroExitoso && (
                        <>
                            <div style={{ marginBottom: 28 }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>Crear cuenta</h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Completa los datos para registrarte</p>
                            </div>

                            {regError && (
                                <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '12px 15px', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <svg width="15" height="15" fill="none" stroke="#ff9b9b" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p style={{ color: '#ff9b9b', fontSize: 13 }}>{regError}</p>
                                </div>
                            )}

                            <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="login-label">Nombre completo</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconUser /></span>
                                        <input className="login-input" type="text" placeholder="Tu nombre" value={regNombre} onChange={e => setRegNombre(e.target.value)} required autoComplete="name" />
                                    </div>
                                </div>
                                <div>
                                    <label className="login-label">Correo electrónico</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconMail /></span>
                                        <input className="login-input" type="email" placeholder="tu@correo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required autoComplete="email" />
                                    </div>
                                </div>
                                <div>
                                    <label className="login-label">Contraseña</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconLock /></span>
                                        <input className="login-input" type={showRegPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={regPass} onChange={e => setRegPass(e.target.value)} required autoComplete="new-password" style={{ paddingRight: 44 }} />
                                        <button type="button" className="show-pass-btn" onClick={() => setShowRegPass(s => !s)} tabIndex={-1}>
                                            {showRegPass ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {regPass && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                                {[1, 2, 3, 4].map(n => {
                                                    const s = strengthLevel(regPass)
                                                    return <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= s ? strengthColors[s] : 'rgba(255,255,255,0.1)', transition: 'all 0.2s' }} />
                                                })}
                                            </div>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{strengthLabels[strengthLevel(regPass)]}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="login-label">Confirmar contraseña</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><IconLock /></span>
                                        <input className="login-input" type={showRegPass ? 'text' : 'password'} placeholder="Repite tu contraseña" value={regPassConfirm} onChange={e => setRegPassConfirm(e.target.value)} required autoComplete="new-password"
                                            style={{ paddingRight: 44, borderColor: regPassConfirm && regPass !== regPassConfirm ? 'rgba(255,107,107,0.5)' : undefined }} />
                                        {regPassConfirm && regPass === regPassConfirm && (
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#c8f560', display: 'flex' }}>
                                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" className="login-submit" disabled={regLoading} style={{ marginTop: 6 }}>
                                    {regLoading
                                        ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.7)' }} />Creando cuenta...</>
                                        : <>Crear cuenta <IconCheck /></>
                                    }
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                                ¿Ya tienes cuenta?{' '}
                                <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: '#c8f560', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                                    Inicia sesión
                                </button>
                            </p>
                        </>
                    )}

                    {/* ── REGISTRO EXITOSO ── */}
                    {tab === 'registro' && registroExitoso && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,245,96,0.12)', border: '1px solid rgba(200,245,96,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <svg width="28" height="28" fill="none" stroke="#c8f560" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>¡Cuenta creada!</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
                                Te enviamos un correo a <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{regEmail}</strong> para confirmar tu cuenta. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
                            </p>
                            <button className="login-submit" onClick={() => { setTab('login'); setRegistroExitoso(false) }}>
                                Ir a iniciar sesión <IconArrow />
                            </button>
                        </div>
                    )}

                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 36, letterSpacing: '0.02em' }}>
                        GestiónSoacha · Proyecto de Grado UNIMINUTO 2025
                    </p>
                </div>
            </div>
        </div>
    )
}