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
    const color = stock === 0 ? '#f43f5e' : stock <= 10 ? '#f59e0b' : '#16a34a'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 24, textAlign: 'right' }}>{stock}</span>
        </div>
    )
}

function Inventario() {
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
        e.preventDefault()
        setLoading(true)
        try {
            if (editando) {
                await axios.put(`${API}/productos/${editando}`, form)
            } else {
                await axios.post(`${API}/productos`, form)
            }
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
            setEditando(null)
            setMostrarForm(false)
            cargarProductos()
        } catch {
            alert('Error al guardar producto')
        }
        setLoading(false)
    }

    const handleEditar = (p) => {
        setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria: p.categoria || '' })
        setEditando(p.id)
        setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return
        await axios.delete(`${API}/productos/${id}`)
        cargarProductos()
    }

    const cancelar = () => {
        setEditando(null)
        setMostrarForm(false)
        setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
    }

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

    const filtrados = productos.filter(p => {
        const mb = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
        const mc = filtroCategoria === '' || p.categoria === filtroCategoria
        return mb && mc
    })

    const totalStock = productos.reduce((s, p) => s + p.stock, 0)
    const stockBajo = productos.filter(p => p.stock <= 10 && p.stock > 0).length
    const sinStock = productos.filter(p => p.stock === 0).length
    const valorTotal = productos.reduce((s, p) => s + p.precio * p.stock, 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
            <div className="grid-stats">
                {[
                    { label: 'Total productos', val: productos.length, emoji: '📦', bg: '#f0f9ff', border: '#bae6fd', valColor: '#0369a1' },
                    { label: 'Unidades en stock', val: totalStock.toLocaleString(), emoji: '🗃️', bg: '#f0fdf4', border: '#bbf7d0', valColor: '#15803d' },
                    { label: 'Stock bajo', val: stockBajo + sinStock, emoji: '⚠️', bg: sinStock > 0 ? '#fff1f2' : '#fffbeb', border: sinStock > 0 ? '#fecdd3' : '#fde68a', valColor: sinStock > 0 ? '#be123c' : '#92400e' },
                    { label: 'Valor inventario', val: `$${valorTotal.toLocaleString()}`, emoji: '💰', bg: '#f5f3ff', border: '#ddd6fe', valColor: '#7c3aed' },
                ].map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '18px 20px' }}>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                {s.emoji}
                            </div>
                        </div>
                        <p className="font-display" style={{ fontSize: 24, fontWeight: 800, color: s.valColor, lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 12, color: '#8098b8', marginTop: 4, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
                    <svg className="search-icon" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="form-input"
                        style={{ paddingLeft: 38 }}
                        placeholder="Buscar por nombre o categoría..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: 160 }}
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-primary" onClick={() => { cancelar(); setMostrarForm(true) }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Producto
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#1e2736' }}>Catálogo de Productos</p>
                        <p style={{ fontSize: 12, color: '#8098b8', marginTop: 2 }}>Mostrando {filtrados.length} de {productos.length} productos</p>
                    </div>
                    {(busqueda || filtroCategoria) && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setBusqueda(''); setFiltroCategoria('') }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <th style={{ minWidth: 140 }}>Stock</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div style={{ fontSize: 28 }}>📦</div>
                                            <p style={{ fontWeight: 700, color: '#3d4f66', fontSize: 14 }}>No se encontraron productos</p>
                                            <p style={{ color: '#8098b8', fontSize: 12 }}>{busqueda ? 'Prueba con otro término' : 'Registra el primer producto'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtrados.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 9,
                                                background: '#f4f6f9', border: '1px solid rgba(0,0,0,0.06)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 16, flexShrink: 0
                                            }}>
                                                📦
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: 13, color: '#1e2736' }}>{p.nombre}</p>
                                                {p.descripcion && <p style={{ fontSize: 11, color: '#8098b8', marginTop: 1 }}>{p.descripcion}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-gray">{p.categoria || 'Sin categoría'}</span>
                                    </td>
                                    <td>
                                        <p style={{ fontWeight: 800, fontSize: 14, color: '#1e2736' }}>${Number(p.precio).toLocaleString()}</p>
                                    </td>
                                    <td style={{ minWidth: 140 }}>
                                        <StockBar stock={p.stock} />
                                    </td>
                                    <td>
                                        {p.stock === 0
                                            ? <span className="badge badge-red">Sin stock</span>
                                            : p.stock <= 10
                                                ? <span className="badge badge-amber">Stock bajo</span>
                                                : <span className="badge badge-green">Disponible</span>
                                        }
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
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                                <p className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#1e2736' }}>
                                    {editando ? 'Editar Producto' : 'Nuevo Producto'}
                                </p>
                                <p style={{ fontSize: 12, color: '#8098b8' }}>
                                    {editando ? 'Modifica la información del producto' : 'Completa los datos del producto'}
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
                                { key: 'nombre', label: 'Nombre *', placeholder: 'Ej: Cuaderno 100 hojas', type: 'text', required: true, full: false },
                                { key: 'categoria', label: 'Categoría', placeholder: 'Ej: Papelería', type: 'text', required: false, full: false },
                                { key: 'descripcion', label: 'Descripción', placeholder: 'Descripción breve', type: 'text', required: false, full: true },
                            ].map(f => (
                                <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8098b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{f.label}</label>
                                    <input className="form-input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8098b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Precio *</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#8098b8', fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>$</span>
                                    <input className="form-input" style={{ paddingLeft: 24 }} type="number" placeholder="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8098b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Stock *</label>
                                <input className="form-input" type="number" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {loading ? <><span className="spinner" />Guardando...</> : editando ? 'Guardar Cambios' : 'Registrar Producto'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}

export default Inventario