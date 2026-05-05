import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399', '#fb923c']

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
    const [busqueda, setBusqueda] = useState('')
    const [mostrarForm, setMostrarForm] = useState(false)

    useEffect(() => { cargarClientes() }, [])

    const cargarClientes = async () => {
        const { data } = await axios.get(`${API}/clientes`)
        setClientes(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true)
        try {
            editando ? await axios.put(`${API}/clientes/${editando}`, form) : await axios.post(`${API}/clientes`, form)
            setForm({ nombre: '', telefono: '', email: '', direccion: '' })
            setEditando(null); setMostrarForm(false); cargarClientes()
        } catch { alert('Error al guardar cliente') }
        setLoading(false)
    }

    const handleEditar = (c) => {
        setForm({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' })
        setEditando(c.id); setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return
        await axios.delete(`${API}/clientes/${id}`); cargarClientes()
    }

    const cancelar = () => { setEditando(null); setMostrarForm(false); setForm({ nombre: '', telefono: '', email: '', direccion: '' }) }

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
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

            {/* Toolbar */}
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

            {/* Table */}
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

                <div style={{ overflowX: 'auto' }}>
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
                                        <p style={{ fontWeight: 800, color: 'var(--ink-40)', fontSize: 14, letterSpacing: '-0.02em' }}>{busqueda ? 'Sin resultados' : 'No hay clientes registrados'}</p>
                                        <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>{busqueda ? 'Prueba con otro término' : 'Registra el primer cliente'}</p>
                                    </div>
                                </td></tr>
                            ) : filtrados.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: PALETTE[c.id % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#080c0a', letterSpacing: '-0.02em' }}>
                                                {getInitials(c.nombre)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{c.nombre}</p>
                                                <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 1 }}>ID #{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {c.telefono
                                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-50)' }}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {c.telefono}
                                            </div>
                                            : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}
                                    </td>
                                    <td>
                                        {c.email
                                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-50)' }}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {c.email}
                                            </div>
                                            : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}
                                    </td>
                                    <td>
                                        {c.direccion
                                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-50)', maxWidth: 220 }}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.direccion}</span>
                                            </div>
                                            : <span style={{ color: 'var(--ink-05)', fontSize: 13 }}>—</span>}
                                    </td>
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

            {/* Modal */}
            <Modal open={mostrarForm} onClose={cancelar}>
                <div style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#c8f560,#a8d940)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</p>
                                <p style={{ fontSize: 12, color: 'var(--ink-20)' }}>{editando ? 'Modifica la información' : 'Completa los datos del cliente'}</p>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-icon" onClick={cancelar}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
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