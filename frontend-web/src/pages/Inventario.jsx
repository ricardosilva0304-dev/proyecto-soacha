import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function Modal({ open, onClose, children }) {
    if (!open) return null
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>{children}</div>
        </div>
    )
}

function StockBar({ stock }) {
    const pct = Math.min((stock / 100) * 100, 100)
    const color = stock === 0 ? '#ff6b6b' : stock <= 10 ? '#f5c842' : '#c8f560'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease', boxShadow: `0 0 6px ${color}60` }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: stock === 0 ? '#c53030' : stock <= 10 ? '#92400e' : 'var(--ink-40)', minWidth: 26, textAlign: 'right', letterSpacing: '-0.01em' }}>{stock}</span>
        </div>
    )
}

function FormLabel({ children }) {
    return <label style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{children}</label>
}

export default function Inventario() {
    const [productos, setProductos] = useState([])
    const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
    const [editando, setEditando] = useState(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [mostrarForm, setMostrarForm] = useState(false)

    useEffect(() => { cargarProductos() }, [])

    const cargarProductos = async () => {
        const { data } = await axios.get(`${API}/productos`)
        setProductos(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true)
        try {
            editando ? await axios.put(`${API}/productos/${editando}`, form) : await axios.post(`${API}/productos`, form)
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
            setEditando(null); setMostrarForm(false); cargarProductos()
        } catch { alert('Error al guardar') }
        setLoading(false)
    }

    const handleEditar = (p) => {
        setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria: p.categoria || '' })
        setEditando(p.id); setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return
        await axios.delete(`${API}/productos/${id}`); cargarProductos()
    }

    const cancelar = () => { setEditando(null); setMostrarForm(false); setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' }) }

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]
    const filtrados = productos.filter(p =>
        (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))) &&
        (filtroCategoria === '' || p.categoria === filtroCategoria)
    )

    const totalStock = productos.reduce((s, p) => s + p.stock, 0)
    const valorTotal = productos.reduce((s, p) => s + p.precio * p.stock, 0)
    const stockBajo = productos.filter(p => p.stock <= 10 && p.stock > 0).length
    const sinStock = productos.filter(p => p.stock === 0).length

    const stats = [
        { label: 'Total productos', val: productos.length, emoji: '📦', accent: { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', val: '#0369a1' } },
        { label: 'Unidades en stock', val: totalStock.toLocaleString(), emoji: '🗃️', accent: { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', val: '#4a7020' } },
        { label: 'Stock bajo / sin stock', val: stockBajo + sinStock, emoji: '⚠️', accent: { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', val: '#92400e' } },
        { label: 'Valor inventario', val: `$${valorTotal.toLocaleString()}`, emoji: '💰', accent: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', val: '#6d28d9' } },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
            <div className="grid-stats">
                {stats.map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '20px 22px', background: `linear-gradient(135deg, #fff 60%, ${s.accent.bg})`, border: `1px solid ${s.accent.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: s.accent.bg, opacity: 0.8 }} />
                        <div style={{ marginBottom: 14, fontSize: 22 }}>{s.emoji}</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: s.accent.val, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 5, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
                    <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input className="form-input" style={{ paddingLeft: 37 }} placeholder="Buscar por nombre o categoría..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <select className="form-input" style={{ width: 'auto', minWidth: 170 }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-lime" onClick={() => { cancelar(); setMostrarForm(true) }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Nuevo Producto
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Catálogo de Productos</p>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 2 }}>Mostrando {filtrados.length} de {productos.length} productos</p>
                    </div>
                    {(busqueda || filtroCategoria) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setBusqueda(''); setFiltroCategoria('') }}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th style={{ minWidth: 150 }}>Stock</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr><td colSpan={6}>
                                    <div className="empty-state">
                                        <span style={{ fontSize: 30 }}>📦</span>
                                        <p style={{ fontWeight: 800, color: 'var(--ink-40)', fontSize: 14, letterSpacing: '-0.02em' }}>No se encontraron productos</p>
                                        <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>{busqueda ? 'Prueba con otro término' : 'Registra el primer producto'}</p>
                                    </div>
                                </td></tr>
                            ) : filtrados.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface)', border: '1px solid rgba(8,12,10,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📦</div>
                                            <div>
                                                <p style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{p.nombre}</p>
                                                {p.descripcion && <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 1 }}>{p.descripcion}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-gray">{p.categoria || 'Sin categoría'}</span></td>
                                    <td><p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.03em' }}>${Number(p.precio).toLocaleString()}</p></td>
                                    <td style={{ minWidth: 150 }}><StockBar stock={p.stock} /></td>
                                    <td>
                                        {p.stock === 0 ? <span className="badge badge-red">Sin stock</span>
                                            : p.stock <= 10 ? <span className="badge badge-amber">Stock bajo</span>
                                                : <span className="badge badge-lime">Disponible</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditar(p)}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Editar
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(p.id)}>
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
                                <svg width="18" height="18" fill="none" stroke="#080c0a" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{editando ? 'Editar Producto' : 'Nuevo Producto'}</p>
                                <p style={{ fontSize: 12, color: 'var(--ink-20)' }}>{editando ? 'Modifica la información' : 'Completa los datos del producto'}</p>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-icon" onClick={cancelar}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                            <div>
                                <FormLabel>Nombre *</FormLabel>
                                <input className="form-input" type="text" placeholder="Ej: Cuaderno 100 hojas" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                            </div>
                            <div>
                                <FormLabel>Categoría</FormLabel>
                                <input className="form-input" type="text" placeholder="Ej: Papelería" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormLabel>Descripción</FormLabel>
                                <input className="form-input" type="text" placeholder="Descripción breve del producto" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                            </div>
                            <div>
                                <FormLabel>Precio *</FormLabel>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-20)', fontSize: 14, fontWeight: 700 }}>$</span>
                                    <input className="form-input" style={{ paddingLeft: 24 }} type="number" placeholder="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <FormLabel>Stock inicial *</FormLabel>
                                <input className="form-input" type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(8,12,10,0.06)' }}>
                            <button type="submit" className="btn btn-lime" disabled={loading} style={{ flex: 1 }}>
                                {loading ? <><span className="spinner spinner-dark" />Guardando...</> : editando ? 'Guardar Cambios' : 'Registrar Producto'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}