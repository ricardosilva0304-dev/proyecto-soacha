import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const CAT_COLORS = ['#16a34a', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981', '#6366f1']

function POS() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [carrito, setCarrito] = useState([])
    const [clienteId, setClienteId] = useState('')
    const [loading, setLoading] = useState(false)
    const [ventaExitosa, setVentaExitosa] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [categoriaActiva, setCategoriaActiva] = useState('Todas')
    const [mostrarCarritoMobile, setMostrarCarritoMobile] = useState(false)

    useEffect(() => {
        axios.get(`${API}/productos`).then(r => setProductos(r.data))
        axios.get(`${API}/clientes`).then(r => setClientes(r.data))
    }, [])

    const categorias = ['Todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))]

    const filtrados = productos.filter(p => {
        const mb = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const mc = categoriaActiva === 'Todas' || p.categoria === categoriaActiva
        return mb && mc
    })

    const agregarAlCarrito = (producto) => {
        if (producto.stock === 0) return
        const existe = carrito.find(i => i.producto_id === producto.id)
        if (existe) {
            if (existe.cantidad >= producto.stock) return
            setCarrito(carrito.map(i => i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        } else {
            setCarrito([...carrito, {
                producto_id: producto.id, nombre: producto.nombre,
                precio_unitario: Number(producto.precio), cantidad: 1,
                stock: producto.stock, categoria: producto.categoria
            }])
        }
    }

    const cambiarCantidad = (producto_id, delta) => {
        setCarrito(carrito.map(i => {
            if (i.producto_id !== producto_id) return i
            const nueva = i.cantidad + delta
            if (nueva <= 0) return null
            if (nueva > i.stock) return i
            return { ...i, cantidad: nueva }
        }).filter(Boolean))
    }

    const quitarItem = (producto_id) => setCarrito(carrito.filter(i => i.producto_id !== producto_id))

    const total = carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

    const handleVenta = async () => {
        if (carrito.length === 0) return
        setLoading(true)
        try {
            await axios.post(`${API}/ventas`, { cliente_id: clienteId || null, total, items: carrito })
            setCarrito([])
            setClienteId('')
            setVentaExitosa(true)
            setMostrarCarritoMobile(false)
            setTimeout(() => setVentaExitosa(false), 4000)
            const { data } = await axios.get(`${API}/productos`)
            setProductos(data)
        } catch {
            alert('Error al registrar venta')
        }
        setLoading(false)
    }

    const PanelCarrito = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>

            {/* Success toast */}
            {ventaExitosa && (
                <div style={{
                    background: 'linear-gradient(135deg,#16a34a,#15803d)', borderRadius: 14,
                    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 8px 24px rgba(22,163,74,0.3)', animation: 'scaleIn 0.2s ease'
                }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>¡Venta registrada!</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Transacción completada correctamente</p>
                    </div>
                </div>
            )}

            {/* Cart header */}
            <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="17" height="17" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: '#1e2736' }}>Carrito</p>
                            <p style={{ fontSize: 11, color: '#8098b8' }}>{totalItems} artículo{totalItems !== 1 ? 's' : ''} seleccionado{totalItems !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    {carrito.length > 0 && (
                        <button onClick={() => setCarrito([])} style={{ fontSize: 11, fontWeight: 700, color: '#f43f5e', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Cliente selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6f9', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <svg width="14" height="14" fill="none" stroke="#8098b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <select
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#3d4f66', fontFamily: 'var(--font-body)' }}
                        value={clienteId}
                        onChange={e => setClienteId(e.target.value)}
                    >
                        <option value="">Cliente general</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* Cart items */}
            <div className="card" style={{ flex: 1, padding: '12px', overflow: 'hidden', minHeight: 0 }}>
                {carrito.length === 0 ? (
                    <div className="empty-state" style={{ padding: '32px 16px' }}>
                        <div style={{ fontSize: 36, marginBottom: 4 }}>🛒</div>
                        <p style={{ fontWeight: 700, color: '#3d4f66', fontSize: 14 }}>Carrito vacío</p>
                        <p style={{ color: '#8098b8', fontSize: 12 }}>Selecciona productos del catálogo</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                        {carrito.map(item => (
                            <div key={item.producto_id} style={{ background: '#f4f6f9', borderRadius: 12, padding: '10px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, color: '#1e2736', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                                        <p style={{ fontSize: 11, color: '#8098b8' }}>${Number(item.precio_unitario).toLocaleString()} c/u</p>
                                    </div>
                                    <button onClick={() => quitarItem(item.producto_id)} style={{ background: 'none', border: 'none', color: '#d0dce8', cursor: 'pointer', padding: '2px 4px', transition: 'color 0.12s', flexShrink: 0 }}
                                        onMouseEnter={e => e.target.style.color = '#f43f5e'}
                                        onMouseLeave={e => e.target.style.color = '#d0dce8'}>
                                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button onClick={() => cambiarCantidad(item.producto_id, -1)} style={{ width: 26, height: 26, borderRadius: 7, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s' }}>
                                            <svg width="12" height="12" fill="none" stroke="#3d4f66" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                        </button>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e2736', minWidth: 20, textAlign: 'center' }}>{item.cantidad}</span>
                                        <button onClick={() => cambiarCantidad(item.producto_id, 1)} style={{ width: 26, height: 26, borderRadius: 7, background: '#16a34a', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s' }}>
                                            <svg width="12" height="12" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                    <p style={{ fontWeight: 800, fontSize: 14, color: '#1e2736' }}>${(item.cantidad * item.precio_unitario).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Checkout */}
            <div className="card" style={{ padding: '16px' }}>
                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#8098b8' }}>Subtotal ({totalItems} items)</span>
                        <span style={{ fontSize: 13, color: '#3d4f66', fontWeight: 600 }}>${total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#1e2736' }}>Total</span>
                        <span className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>${total.toLocaleString()}</span>
                    </div>
                </div>
                <button
                    onClick={handleVenta}
                    disabled={loading || carrito.length === 0}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '13px', fontSize: 15, opacity: carrito.length === 0 ? 0.45 : 1, cursor: carrito.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? (
                        <><span className="spinner" />Procesando...</>
                    ) : (
                        <>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Registrar Venta
                        </>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Mobile: botón flotante carrito */}
            <div className="mobile-cart-btn" style={{ display: 'none' }}>
                <button
                    onClick={() => setMostrarCarritoMobile(true)}
                    style={{
                        position: 'fixed', bottom: 20, right: 20, zIndex: 60,
                        background: 'linear-gradient(135deg,#16a34a,#15803d)',
                        color: '#fff', border: 'none', borderRadius: 16, padding: '12px 20px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        boxShadow: '0 8px 24px rgba(22,163,74,0.4)', cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14
                    }}
                >
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Ver carrito
                    {carrito.length > 0 && (
                        <span style={{ background: '#fff', color: '#16a34a', borderRadius: 100, padding: '2px 8px', fontSize: 12, fontWeight: 800 }}>
                            {totalItems}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile carrito modal */}
            {mostrarCarritoMobile && (
                <div className="modal-overlay" onClick={() => setMostrarCarritoMobile(false)}>
                    <div className="modal-box" style={{ maxWidth: 420, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            <p className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Carrito de compras</p>
                            <button className="btn btn-secondary btn-icon" onClick={() => setMostrarCarritoMobile(false)}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div style={{ padding: '16px' }}>
                            <PanelCarrito />
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 16 }} className="pos-container">

                {/* Left: productos */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

                    {/* Search + categories */}
                    <div className="card" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                            <div className="search-bar" style={{ flex: 1 }}>
                                <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 36 }}
                                    placeholder="Buscar producto..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f4f6f9', borderRadius: 10, padding: '0 12px', border: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
                                <svg width="14" height="14" fill="none" stroke="#8098b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#3d4f66' }}>{filtrados.length}</span>
                            </div>
                        </div>
                        <div className="tabs-scroll">
                            {categorias.map((cat, i) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaActiva(cat)}
                                    className={`chip ${categoriaActiva === cat ? 'active' : ''}`}
                                >
                                    {cat !== 'Todas' && (
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: categoriaActiva === cat ? 'rgba(255,255,255,0.6)' : CAT_COLORS[(i - 1) % CAT_COLORS.length], flexShrink: 0 }} />
                                    )}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="card" style={{ padding: '14px', flex: 1 }}>
                        {filtrados.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ fontSize: 32 }}>📦</div>
                                <p style={{ fontWeight: 700, color: '#3d4f66', fontSize: 14 }}>Sin productos</p>
                                <p style={{ color: '#8098b8', fontSize: 12 }}>Prueba con otro filtro</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                                {filtrados.map(p => {
                                    const enCarrito = carrito.find(i => i.producto_id === p.id)
                                    const agotado = p.stock === 0
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => agregarAlCarrito(p)}
                                            disabled={agotado}
                                            style={{
                                                position: 'relative', padding: '14px', borderRadius: 14, textAlign: 'left',
                                                border: `2px solid ${agotado ? 'rgba(0,0,0,0.06)' : enCarrito ? '#16a34a' : 'rgba(0,0,0,0.08)'}`,
                                                background: agotado ? '#f9fafb' : enCarrito ? '#f0fdf4' : '#fff',
                                                cursor: agotado ? 'not-allowed' : 'pointer',
                                                opacity: agotado ? 0.55 : 1,
                                                transition: 'all 0.15s ease',
                                                boxShadow: enCarrito ? '0 4px 14px rgba(22,163,74,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                                            }}
                                            onMouseEnter={e => { if (!agotado && !enCarrito) { e.currentTarget.style.border = '2px solid #16a34a'; e.currentTarget.style.background = '#f0fdf4' } }}
                                            onMouseLeave={e => { if (!agotado && !enCarrito) { e.currentTarget.style.border = '2px solid rgba(0,0,0,0.08)'; e.currentTarget.style.background = '#fff' } }}
                                        >
                                            {/* Badge cantidad */}
                                            {enCarrito && (
                                                <div style={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    width: 22, height: 22, borderRadius: '50%',
                                                    background: '#16a34a', color: '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 11, fontWeight: 800
                                                }}>
                                                    {enCarrito.cantidad}
                                                </div>
                                            )}
                                            {/* Categoría */}
                                            <p style={{ fontSize: 10, color: '#8098b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                                                {p.categoria || 'General'}
                                            </p>
                                            {/* Nombre */}
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e2736', lineHeight: 1.3, marginBottom: 8 }}>
                                                {p.nombre}
                                            </p>
                                            {/* Precio */}
                                            <p className="font-display" style={{ fontSize: 16, fontWeight: 800, color: enCarrito ? '#16a34a' : '#1e2736', marginBottom: 6 }}>
                                                ${Number(p.precio).toLocaleString()}
                                            </p>
                                            {/* Stock */}
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                                                background: agotado ? '#fee2e2' : p.stock <= 10 ? '#fef3c7' : '#dcfce7',
                                                color: agotado ? '#dc2626' : p.stock <= 10 ? '#d97706' : '#15803d',
                                            }}>
                                                {agotado ? 'Sin stock' : `${p.stock} uds`}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: carrito (desktop) */}
                <div className="pos-sidebar" style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <PanelCarrito />
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .pos-sidebar { display: none !important; }
          .mobile-cart-btn { display: block !important; }
          .pos-container { flex-direction: column !important; }
        }
      `}</style>
        </div>
    )
}

export default POS