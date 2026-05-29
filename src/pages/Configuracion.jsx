import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Section({ icon, title, sub, children }) {
    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {icon}
                </div>
                <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{title}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 1 }}>{sub}</p>
                </div>
            </div>
            <div style={{ padding: '22px' }}>{children}</div>
        </div>
    )
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</label>
            {children}
        </div>
    )
}

function Toast({ msg, type = 'success', onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [])
    const colors = {
        success: { bg: 'rgba(200,245,96,0.12)', border: 'rgba(200,245,96,0.3)', icon: '#5a7a20', text: '#3d5533' },
        error: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.25)', icon: '#c53030', text: '#c53030' },
    }
    const c = colors[type]
    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, background: '#fff', border: `1px solid ${c.border}`, borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 8px 32px rgba(8,12,10,0.12)', animation: 'scaleIn 0.22s ease', minWidth: 260, maxWidth: 340 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {type === 'success'
                    ? <svg width="16" height="16" fill="none" stroke={c.icon} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    : <svg width="16" height="16" fill="none" stroke={c.icon} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                }
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: c.text, flex: 1, letterSpacing: '-0.01em' }}>{msg}</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-20)', padding: 2 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    )
}

export default function Configuracion() {
    const { usuario } = useAuth()
    const [toast, setToast] = useState(null)

    // Datos del negocio
    const [negocio, setNegocio] = useState({ nombre: '', direccion: '', telefono: '', email: '', nit: '', ciudad: '' })
    const [savingNegocio, setSavingNegocio] = useState(false)

    // Contraseña
    const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' })
    const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false })
    const [savingPass, setSavingPass] = useState(false)

    // Alertas de stock
    const [stockMinimo, setStockMinimo] = useState(10)
    const [savingStock, setSavingStock] = useState(false)

    // Preferencias
    const [moneda, setMoneda] = useState('COP')
    const [savingPref, setSavingPref] = useState(false)

    const showToast = (msg, type = 'success') => setToast({ msg, type })

    useEffect(() => { cargarConfig() }, [])

    const cargarConfig = async () => {
        const { data, error } = await supabase.from('configuracion').select('*').eq('id', 1).single()
        if (error && error.code !== 'PGRST116') {
            // PGRST116 = row not found, es OK si nunca se guardó config
            console.warn('Config no encontrada:', error.message)
            return
        }
        if (data) {
            setNegocio({
                nombre: data.nombre_negocio || '',
                direccion: data.direccion || '',
                telefono: data.telefono || '',
                email: data.email_negocio || '',
                nit: data.nit || '',
                ciudad: data.ciudad || '',
            })
            setStockMinimo(data.stock_minimo ?? 10)
            setMoneda(data.moneda || 'COP')
        }
    }

    const upsertConfig = async (campos) => {
        const { data } = await supabase.from('configuracion').select('id').eq('id', 1).single()
        if (data) {
            return supabase.from('configuracion').update(campos).eq('id', 1)
        } else {
            return supabase.from('configuracion').insert([{ id: 1, ...campos }])
        }
    }

    const handleNegocio = async (e) => {
        e.preventDefault()
        setSavingNegocio(true)
        const { error } = await upsertConfig({
            nombre_negocio: negocio.nombre,
            direccion: negocio.direccion,
            telefono: negocio.telefono,
            email_negocio: negocio.email,
            nit: negocio.nit,
            ciudad: negocio.ciudad,
        })
        setSavingNegocio(false)
        if (error) { showToast('Error al guardar: ' + error.message, 'error'); return }
        showToast('Datos del negocio guardados correctamente')
    }

    const handlePassword = async (e) => {
        e.preventDefault()
        if (pass.nueva !== pass.confirmar) { showToast('Las contraseñas nuevas no coinciden', 'error'); return }
        if (pass.nueva.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres', 'error'); return }
        if (!pass.actual) { showToast('Ingresa tu contraseña actual', 'error'); return }
        setSavingPass(true)

        // Verificar sesión activa antes de intentar cambiar
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            showToast('Tu sesión expiró. Por favor vuelve a iniciar sesión.', 'error')
            setSavingPass(false)
            return
        }

        // Re-autenticar con contraseña actual para verificar identidad
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: session.user.email,
            password: pass.actual,
        })
        if (signInError) {
            showToast('La contraseña actual es incorrecta', 'error')
            setSavingPass(false)
            return
        }

        const { error } = await supabase.auth.updateUser({ password: pass.nueva })
        setSavingPass(false)
        if (error) { showToast('Error: ' + error.message, 'error'); return }
        setPass({ actual: '', nueva: '', confirmar: '' })
        showToast('Contraseña actualizada correctamente')
    }

    const handleStock = async (e) => {
        e.preventDefault()
        setSavingStock(true)
        const { error } = await upsertConfig({ stock_minimo: stockMinimo })
        setSavingStock(false)
        if (error) { showToast('Error al guardar', 'error'); return }
        showToast('Umbral de stock guardado')
    }

    const handlePref = async (e) => {
        e.preventDefault()
        setSavingPref(true)
        const { error } = await upsertConfig({ moneda })
        setSavingPref(false)
        if (error) { showToast('Error al guardar', 'error'); return }
        showToast('Preferencias guardadas')
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Perfil del usuario actual */}
            <div className="card" style={{ padding: '20px 22px', background: 'var(--ink)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(200,245,96,0.06)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#080c0a', flexShrink: 0 }}>
                        {(usuario?.nombre?.[0] || usuario?.email?.[0] || 'A').toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em' }}>{usuario?.nombre || usuario?.email}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{usuario?.email}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 99, padding: '5px 13px' }}>
                        <span className="pulse-dot" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#c8f560' }}>Activo</span>
                    </div>
                </div>
            </div>

            {/* Datos del negocio */}
            <Section
                icon={<svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                title="Datos del negocio"
                sub="Información que aparece en reportes y comprobantes"
            >
                <form onSubmit={handleNegocio}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
                        <Field label="Nombre del negocio *">
                            <input className="form-input" type="text" placeholder="Ej: Tienda La Esperanza" value={negocio.nombre} onChange={e => setNegocio({ ...negocio, nombre: e.target.value })} required />
                        </Field>
                        <Field label="NIT / Cédula">
                            <input className="form-input" type="text" placeholder="Ej: 123456789-0" value={negocio.nit} onChange={e => setNegocio({ ...negocio, nit: e.target.value })} />
                        </Field>
                        <Field label="Ciudad">
                            <input className="form-input" type="text" placeholder="Soacha, Cundinamarca" value={negocio.ciudad} onChange={e => setNegocio({ ...negocio, ciudad: e.target.value })} />
                        </Field>
                        <Field label="Teléfono">
                            <input className="form-input" type="text" placeholder="Ej: 3001234567" value={negocio.telefono} onChange={e => setNegocio({ ...negocio, telefono: e.target.value })} />
                        </Field>
                        <Field label="Correo del negocio">
                            <input className="form-input" type="email" placeholder="negocio@correo.com" value={negocio.email} onChange={e => setNegocio({ ...negocio, email: e.target.value })} />
                        </Field>
                        <Field label="Dirección">
                            <input className="form-input" type="text" placeholder="Calle 13 # 5-20, Soacha" value={negocio.direccion} onChange={e => setNegocio({ ...negocio, direccion: e.target.value })} />
                        </Field>
                    </div>
                    <button type="submit" className="btn btn-lime" disabled={savingNegocio}>
                        {savingNegocio ? <><span className="spinner spinner-dark" />Guardando...</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Guardar datos</>}
                    </button>
                </form>
            </Section>

            {/* Cambio de contraseña */}
            <Section
                icon={<svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                title="Seguridad"
                sub="Cambia tu contraseña de acceso al sistema"
            >
                <form onSubmit={handlePassword}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
                        {[
                            { key: 'actual', label: 'Contraseña actual', placeholder: 'Tu contraseña actual' },
                            { key: 'nueva', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres' },
                            { key: 'confirmar', label: 'Confirmar nueva contraseña', placeholder: 'Repite la contraseña' },
                        ].map(f => (
                            <Field key={f.key} label={f.label}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-input"
                                        type={showPass[f.key] ? 'text' : 'password'}
                                        placeholder={f.placeholder}
                                        value={pass[f.key]}
                                        onChange={e => setPass({ ...pass, [f.key]: e.target.value })}
                                        style={{ paddingRight: 40 }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(s => ({ ...s, [f.key]: !s[f.key] }))}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-20)', display: 'flex', alignItems: 'center' }}>
                                        {showPass[f.key]
                                            ? <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            : <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        }
                                    </button>
                                </div>
                            </Field>
                        ))}
                    </div>
                    {pass.nueva && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                                {[1, 2, 3, 4].map(n => {
                                    const strength = pass.nueva.length >= 12 ? 4 : pass.nueva.length >= 8 ? 3 : pass.nueva.length >= 6 ? 2 : 1
                                    const colors = ['#ff6b6b', '#f5c842', '#60c8f5', '#c8f560']
                                    return <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= strength ? colors[strength - 1] : 'var(--surface-2)', transition: 'all 0.2s' }} />
                                })}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>
                                {pass.nueva.length < 6 ? 'Muy corta' : pass.nueva.length < 8 ? 'Aceptable' : pass.nueva.length < 12 ? 'Buena' : 'Excelente'}
                            </p>
                        </div>
                    )}
                    <button type="submit" className="btn btn-lime" disabled={savingPass}>
                        {savingPass ? <><span className="spinner spinner-dark" />Actualizando...</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Actualizar contraseña</>}
                    </button>
                </form>
            </Section>

            {/* Alertas de stock */}
            <Section
                icon={<svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                title="Alertas de inventario"
                sub="Recibe alertas cuando el stock esté por agotarse"
            >
                <form onSubmit={handleStock}>
                    <div style={{ marginBottom: 20 }}>
                        <Field label={`Umbral mínimo de stock — ${stockMinimo} unidades`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                                <input
                                    type="range" min="1" max="50" value={stockMinimo}
                                    onChange={e => setStockMinimo(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: '#c8f560', height: 4, cursor: 'pointer' }}
                                />
                                <div style={{ width: 52, background: 'var(--surface)', border: '1.5px solid rgba(8,12,10,0.1)', borderRadius: 9, padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                                    {stockMinimo}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                <span style={{ fontSize: 10.5, color: 'var(--ink-20)' }}>1 und</span>
                                <span style={{ fontSize: 10.5, color: 'var(--ink-20)' }}>50 und</span>
                            </div>
                        </Field>
                        <div style={{ marginTop: 14, background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                            <svg width="14" height="14" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p style={{ fontSize: 12, color: '#92400e' }}>Los productos con stock ≤ {stockMinimo} unidades aparecerán como <strong>Stock bajo</strong> en el inventario y dashboard.</p>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-lime" disabled={savingStock}>
                        {savingStock ? <><span className="spinner spinner-dark" />Guardando...</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Guardar umbral</>}
                    </button>
                </form>
            </Section>

            {/* Preferencias */}
            <Section
                icon={<svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                title="Preferencias del sistema"
                sub="Moneda y formato de precios"
            >
                <form onSubmit={handlePref}>
                    <div style={{ marginBottom: 18 }}>
                        <Field label="Moneda">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 8 }}>
                                {[
                                    { value: 'COP', label: 'Peso colombiano', symbol: '$' },
                                    { value: 'USD', label: 'Dólar americano', symbol: 'US$' },
                                    { value: 'EUR', label: 'Euro', symbol: '€' },
                                ].map(m => (
                                    <button key={m.value} type="button" onClick={() => setMoneda(m.value)} style={{
                                        padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                                        border: moneda === m.value ? '2px solid #c8f560' : '1.5px solid rgba(8,12,10,0.1)',
                                        background: moneda === m.value ? 'rgba(200,245,96,0.08)' : 'var(--surface)',
                                    }}>
                                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: moneda === m.value ? '#4a7020' : 'var(--ink)', letterSpacing: '-0.03em' }}>{m.symbol}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-30)', marginTop: 3, fontWeight: 600 }}>{m.label}</p>
                                        <p style={{ fontSize: 10, color: moneda === m.value ? '#5a7a20' : 'var(--ink-20)', marginTop: 1, fontWeight: 700, letterSpacing: '0.04em' }}>{m.value}</p>
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </div>
                    <button type="submit" className="btn btn-lime" disabled={savingPref}>
                        {savingPref ? <><span className="spinner spinner-dark" />Guardando...</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Guardar preferencias</>}
                    </button>
                </form>
            </Section>

            {/* Info del sistema */}
            <div className="card" style={{ padding: '18px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Información del sistema</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    {[
                        { label: 'Versión', val: '1.0.0' },
                        { label: 'Base de datos', val: 'Supabase PostgreSQL' },
                        { label: 'Plataforma', val: 'Vercel' },
                        { label: 'Proyecto', val: 'UNIMINUTO 2025' },
                    ].map(i => (
                        <div key={i.label} style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 14px' }}>
                            <p style={{ fontSize: 10.5, color: 'var(--ink-20)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{i.label}</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-50)', marginTop: 3 }}>{i.val}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
