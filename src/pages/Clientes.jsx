import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

function getInitials(nombre) {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function Modal({ open, onClose, children }) {
    if (!open) return null
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>{children}</div>
        </div>
    )
}

function FormLabel({ children }) {
    return <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{children}</label>
}

export default function Clientes() {
    const [clientes, setClientes] = useState([])
    const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' })
    const [editando, setEditando] = useState(null)
    const [loading, setLoading] = useState(false)
    const [cargando, setCargando] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [mostrarForm, setMostrarForm] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => { cargarClientes() }, [])

    const cargarClientes = async () => {
        setCargando(true)
        setError(null)
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('id', { ascending: true })
        if (error) { setError(error.message); setCargando(false); return }
        setClientes(data)
        setCargando(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const payload = { nombre: form.nombre, telefono: form.telefono, email: form.email, direccion: form.direccion }
        if (editando) {
            const { error } = await supabase.from('clientes').update(payload).eq('id', editando)
            if (error) { setError(error.message); setLoading(false); return }
        } else {
            const { error } = await supabase.from('clientes').insert([payload])
            if (error) { setError(error.message); setLoading(false); return }
        }
        await cargarClientes()
        setForm({ nombre: '', telefono: '', email: '', direccion: '' })
        setEditando(null)
        setMostrarForm(false)
        setLoading(false)
    }

    const handleEditar = (c) => {
        setForm({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' })
        setEditando(c.id)
        setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return
        const { error } = await supabase.from('clientes').delete().eq('id', id)
        if (error) { setError(error.message); return }
        await cargarClientes()
    }

    const cancelar = () => {
        setEditando(null)
        setMostrarForm(false)
        setForm({ nombre: '', telefono: '', email: '', direccion: '' })
        setError(null)
    }

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        (c.telefono && c.telefono.includes(busqueda))
    )

    const stats = [
        { label: 'Total clientes', val: clientes.length, emoji: '👥', accent: { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', val: '#4a7020' } },
        { label: 'Con correo', val: clientes.filter(c => c.email).length, emoji: '📧', accent: { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', val: '#0369a1' } },
        { label: 'Con teléfono', val: clientes.filter(c => c.telefono).length, emoji: '📱', accent: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', val: '#6d28d9' } },
        { label: 'Sin contacto', val: clientes.filter(c => !c.email && !c.telefono).length, emoji: '⚠️', accent: { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', val: '#92400e' } },
    ]

    if (cargando) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ color: 'var(--ink-20)', fontSize: 13, fontWeight: 600 }}>Cargando clientes...</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {error && (
                <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#c53030', display: 'flex', alignItems: 'center', gap: 8 }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="grid-stats">
                {stats.map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '20px 22px', background: `linear-gradient(135deg, #fff 60%, ${s.accent.bg})`, border: `1px solid ${s.accent.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: s.accent.bg, opacity: 0.8 }} />
                        <div style={{ marginBottom: 14, fontSize: 22 }}>{s.emoji}</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: s.accent.val, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 5, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
                    <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input className="form-input" style={{ paddingLeft: 37 }} placeholder="Buscar por nombre, email o teléfono..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <button className="btn btn-lime" onClick={() => { cancelar(); setMostrarForm(true) }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    Nuevo Cliente
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Directorio de Clientes</p>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 2 }}>Mostrando {filtrados.length} de {clientes.length} clientes</p>
                    </div>
                    {busqueda && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setBusqueda('')}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Limpiar
                        </button>
                    )}
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Dirección</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="empty-state">
                                        <span style={{ fontSize: 30 }}>👥</span>
                                        <p style={{ fontWeight: 800, color: 'var(--ink-40)', fontSize: 14 }}>{busqueda ? 'Sin resultados' : 'No hay clientes registrados'}</p>
                                        <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>{busqueda ? 'Prueba con otro término' : 'Registra el primer cliente'}</p>
                                    </div>
                                </td></tr>
                            ) : filtrados.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: PALETTE[c.id % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#080c0a' }}>
                                                {getInitials(c.nombre)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{c.nombre}</p>
                                                <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 1 }}>ID #{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{c.telefono ? <span style={{ fontSize: 13, color: 'var(--ink-50)' }}>{c.telefono}</span> : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}</td>
                                    <td>{c.email ? <span style={{ fontSize: 13, color: 'var(--ink-50)' }}>{c.email}</span> : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}</td>
                                    <td>{c.direccion ? <span style={{ fontSize: 13, color: 'var(--ink-50)' }}>{c.direccion}</span> : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditar(c)}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Editar
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(c.id)}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={mostrarForm} onClose={cancelar}>
                <div style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</p>
                                <p style={{ fontSize: 12, color: 'var(--ink-20)' }}>{editando ? 'Modifica la información' : 'Completa los datos'}</p>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-icon" onClick={cancelar}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                            {[
                                { key: 'nombre', label: 'Nombre completo *', placeholder: 'Ej: Carlos Pérez', type: 'text', required: true },
                                { key: 'telefono', label: 'Teléfono', placeholder: 'Ej: 3001234567', type: 'text' },
                                { key: 'email', label: 'Correo electrónico', placeholder: 'correo@ejemplo.com', type: 'email' },
                                { key: 'direccion', label: 'Dirección', placeholder: 'Calle 13 # 5-20, Soacha', type: 'text' },
                            ].map(f => (
                                <div key={f.key}>
                                    <FormLabel>{f.label}</FormLabel>
                                    <input className="form-input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
                                </div>
                            ))}
                        </div>
                        {error && <p style={{ fontSize: 12, color: '#c53030', marginBottom: 12 }}>⚠️ {error}</p>}
                        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(8,12,10,0.06)' }}>
                            <button type="submit" className="btn btn-lime" disabled={loading} style={{ flex: 1 }}>
                                {loading ? <><span className="spinner spinner-dark" />Guardando...</> : editando ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}
