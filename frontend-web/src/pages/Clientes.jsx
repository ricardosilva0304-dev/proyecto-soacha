import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const COLORS = ['#16a34a', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981', '#6366f1']

function getInitials(nombre) {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function Modal({ open, onClose, children }) {
    if (!open) return null
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

function Clientes() {
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
        e.preventDefault()
        setLoading(true)
        try {
            if (editando) {
                await axios.put(`${API}/clientes/${editando}`, form)
            } else {
                await axios.post(`${API}/clientes`, form)
            }
            setForm({ nombre: '', telefono: '', email: '', direccion: '' })
            setEditando(null)
            setMostrarForm(false)
            cargarClientes()
        } catch {
            alert('Error al guardar cliente')
        }
        setLoading(false)
    }

    const handleEditar = (c) => {
        setForm({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' })
        setEditando(c.id)
        setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return
        await axios.delete(`${API}/clientes/${id}`)
        cargarClientes()
    }

    const cancelar = () => {
        setEditando(null)
        setMostrarForm(false)
        setForm({ nombre: '', telefono: '', email: '', direccion: '' })
    }

    const filtrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        (c.telefono && c.telefono.includes(busqueda))
    )

    const conEmail = clientes.filter(c => c.email).length
    const conTelefono = clientes.filter(c => c.telefono).length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
            <div className="grid-stats">
                {[
                    { label: 'Total clientes', val: clientes.length, icon: '👥', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                    { label: 'Con correo', val: conEmail, icon: '📧', bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1' },
                    { label: 'Con teléfono', val: conTelefono, icon: '📱', bg: '#f5f3ff', border: '#ddd6fe', color: '#7c3aed' },
                    { label: 'Sin contacto', val: clientes.filter(c => !c.email && !c.telefono).length, icon: '⚠️', bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
                ].map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                {s.icon}
                            </div>
                        </div>
                        <p className="font-display" style={{ fontSize: 26, fontWeight: 800, color: '#1e2736' }}>{s.val}</p>
                        <p style={{ fontSize: 12, color: '#8098b8', marginTop: 2, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
                    <svg className="search-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="form-input"
                        style={{ paddingLeft: 38 }}
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { cancelar(); setMostrarForm(true) }}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Nuevo Cliente
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#1e2736' }}>Directorio de Clientes</p>
                        <p style={{ fontSize: 12, color: '#8098b8', marginTop: 2 }}>
                            Mostrando {filtrados.length} de {clientes.length} clientes
                        </p>
                    </div>
                    {busqueda && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setBusqueda('')}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <div className="empty-icon" style={{ fontSize: 24 }}>👥</div>
                                            <p style={{ fontWeight: 700, color: '#3d4f66', fontSize: 14 }}>No se encontraron clientes</p>
                                            <p style={{ color: '#8098b8', fontSize: 12 }}>{busqueda ? 'Prueba con otro término' : 'Registra el primer cliente'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtrados.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                background: COLORS[c.id % COLORS.length],
                                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 700
                                            }}>
                                                {getInitials(c.nombre)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: 13, color: '#1e2736' }}>{c.nombre}</p>
                                                <p style={{ fontSize: 11, color: '#8098b8' }}>ID #{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {c.telefono ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4f66', fontSize: 13 }}>
                                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {c.telefono}
                                            </div>
                                        ) : <span style={{ color: '#d0dce8', fontSize: 13 }}>—</span>}
                                    </td>
                                    <td>
                                        {c.email ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4f66', fontSize: 13 }}>
                                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                {c.email}
                                            </div>
                                        ) : <span style={{ color: '#d0dce8', fontSize: 13 }}>—</span>}
                                    </td>
                                    <td>
                                        {c.direccion ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4f66', fontSize: 13, maxWidth: 220 }}>
                                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.direccion}</span>
                                            </div>
                                        ) : <span style={{ color: '#d0dce8', fontSize: 13 }}>—</span>}
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
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#1e2736' }}>
                                    {editando ? 'Editar Cliente' : 'Nuevo Cliente'}
                                </p>
                                <p style={{ fontSize: 12, color: '#8098b8' }}>
                                    {editando ? 'Modifica los datos del cliente' : 'Completa la información del cliente'}
                                </p>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-icon" onClick={cancelar}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8098b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        {f.label}
                                    </label>
                                    <input
                                        className="form-input"
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={form[f.key]}
                                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                        required={f.required}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {loading ? <><span className="spinner" />Guardando...</> : editando ? 'Guardar Cambios' : 'Registrar Cliente'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}

export default Clientes