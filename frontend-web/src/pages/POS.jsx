import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const CAT_COLORS = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

export default function POS() {
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
    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        (categoriaActiva === 'Todas' || p.categoria === categoriaActiva)
    )

    const agregarAlCarrito = (producto) => {
        if (producto.stock === 0) return
        const existe = carrito.find(i => i.producto_id === producto.id)
        if (existe) {
            if (existe.cantidad >= producto.stock) return
            setCarrito(carrito.map(i => i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        } else {
            setCarrito([...carrito, { producto_id: producto.id, nombre: producto.nombre, precio_unitario: Number(producto.precio), cantidad: 1, stock: producto.stock, categoria: producto.categoria }])
        }
    }

    const cambiarCantidad = (id, delta) => {
        setCarrito(carrito.map(i => {
            if (i.producto_id !== id) return i
            const nueva = i.cantidad + delta
            if (nueva <= 0) return null
            if (nueva > i.stock) return i
            return { ...i, cantidad: nueva }
        }).filter(Boolean))
    }

    const quitarItem = (id) => setCarrito(carrito.filter(i => i.producto_id !== id))

    const total = carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
    const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0)

    const handleVenta = async () => {
        if (carrito.length === 0) return
        setLoading(true)
        try {
            await axios.post(`${API}/ventas`, { cliente_id: clienteId || null, total, items: carrito })
            setCarrito([]); setClienteId(''); setVentaExitosa(true); setMostrarCarritoMobile(false)
            setTimeout(() => setVentaExitosa(false), 4000)
            const { data } = await axios.get(`${API}/productos`); setProductos(data)
        } catch { alert('Error al registrar venta') }
        setLoading(false)
    }

    const PanelCarrito = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>

            {/* Toast éxito */}
            {ventaExitosa && (
                <div style={{ background: 'var(--ink)', border: '1px solid rgba(200,245,96,0.3)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, animation: 'scaleIn 0.22s ease' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(200,245,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="17" height="17" fill="none" stroke="#c8f560" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                        <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em' }}>¡Venta registrada!</p>
                        <p style={{ color: 'var(--ink-20)', fontSize: 11, marginTop: 2 }}>Transacción completada</p>
                    </div>
                </div>
            )}

            {/* Header carrito */}
            <div className="card" style={{ padding: '15px 16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" fill="none" stroke="#4a7020" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Carrito</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{totalItems} artículo{totalItems !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    {carrito.length > 0 && (
                        <button onClick={() => setCarrito([])} style={{ fontSize: 11, fontWeight: 800, color: '#c53030', background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', letterSpacing: '-0.01em' }}>
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Cliente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', borderRadius: 10, padding: '8px 12px', border: '1.5px solid rgba(8,12,10,0.08)' }}>
                    <svg width="13" height="13" fill="none" stroke="var(--ink-20)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <select style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-50)', fontFamily: 'var(--font-body)', fontWeight: 600 }} value={clienteId} onChange={e => setClienteId(e.target.value)}>
                        <option value="">Cliente general</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            {/* Items */}
            <div className="card" style={{ flex: 1, padding: '12px', minHeight: 0, overflow: 'hidden' }}>
                {carrito.length === 0 ? (
                    <div className="empty-state" style={{ padding: '36px 16px' }}>
                        <div style={{ fontSize: 34, animation: 'float 3s ease-in-out infinite' }}>🛒</div>
                        <p style={{ fontWeight: 800, color: 'var(--ink-30)', fontSize: 13, letterSpacing: '-0.02em' }}>Carrito vacío</p>
                        <p style={{ color: 'var(--ink-20)', fontSize: 11 }}>Selecciona productos del catálogo</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                        {carrito.map(item => (
                            <div key={item.producto_id} style={{ background: 'var(--surface)', borderRadius: 12, padding: '11px 13px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 9 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{item.nombre}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 2 }}>${Number(item.precio_unitario).toLocaleString()} c/u</p>
                                    </div>
                                    <button onClick={() => quitarItem(item.producto_id)} style={{ background: 'none', border: 'none', color: 'var(--ink-05)', cursor: 'pointer', padding: '2px 4px', transition: 'color 0.12s', flexShrink: 0 }}
                                        onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                                        onMouseLeave={e => e.target.style.color = 'var(--ink-05)'}>
                                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                        <button onClick={() => cambiarCantidad(item.producto_id, -1)} style={{ width: 26, height: 26, borderRadius: 7, background: '#fff', border: '1.5px solid rgba(8,12,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-30)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(8,12,10,0.1)'}>
                                            <svg width="11" height="11" fill="none" stroke="var(--ink-50)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                                        </button>
                                        <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--ink)', minWidth: 18, textAlign: 'center', letterSpacing: '-0.02em' }}>{item.cantidad}</span>
                                        <button onClick={() => cambiarCantidad(item.producto_id, 1)} style={{ width: 26, height: 26, borderRadius: 7, background: '#c8f560', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.12s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#a8d940'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#c8f560'}>
                                            <svg width="11" height="11" fill="none" stroke="#080c0a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.03em' }}>${(item.cantidad * item.precio_unitario).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Checkout */}
            <div className="card" style={{ padding: '16px', flexShrink: 0 }}>
                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-30)', fontWeight: 600 }}>Subtotal ({totalItems} items)</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-50)', fontWeight: 700 }}>${total.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(8,12,10,0.06)', marginBottom: 10 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Total</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: carrito.length > 0 ? '#4a7020' : 'var(--ink-20)', letterSpacing: '-0.04em' }}>${total.toLocaleString()}</span>
                    </div>
                </div>
                <button onClick={handleVenta} disabled={loading || carrito.length === 0} style={{
                    width: '100%', padding: '13px', borderRadius: 11, border: 'none',
                    background: carrito.length === 0 ? 'var(--surface-2)' : '#c8f560',
                    color: carrito.length === 0 ? 'var(--ink-20)' : '#080c0a',
                    fontSize: 14, fontWeight: 900, cursor: carrito.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
                    boxShadow: carrito.length > 0 ? '0 6px 24px rgba(200,245,96,0.4)' : 'none',
                    transition: 'all 0.18s'
                }}>
                    {loading ? <><span className="spinner spinner-dark" />Procesando...</>
                        : <><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Registrar Venta</>}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Mobile FAB */}
            <div className="mobile-cart-fab">
                <button onClick={() => setMostrarCarritoMobile(true)} style={{
                    position: 'fixed', bottom: 22, right: 22, zIndex: 60,
                    background: '#c8f560', color: '#080c0a',
                    border: 'none', borderRadius: 16, padding: '12px 20px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 8px 28px rgba(200,245,96,0.5)', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em'
                }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Carrito
                    {carrito.length > 0 && (
                        <span style={{ background: '#080c0a', color: '#c8f560', borderRadius: 99, padding: '2px 8px', fontSize: 11.5, fontWeight: 900 }}>{totalItems}</span>
                    )}
                </button>
            </div>

            {/* Mobile carrito modal */}
            {mostrarCarritoMobile && (
                <div className="modal-overlay" onClick={() => setMostrarCarritoMobile(false)}>
                    <div className="modal-box" style={{ maxWidth: 420, maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Carrito de ventas</p>
                            <button className="btn btn-secondary btn-icon" onClick={() => setMostrarCarritoMobile(false)}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div style={{ padding: '14px' }}><PanelCarrito /></div>
                    </div>
                </div>
            )}

            {/* Main layout */}
            <div style={{ display: 'flex', gap: 16 }} className="pos-container">

                {/* Left: productos */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

                    {/* Búsqueda + categorías */}
                    <div className="card" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                            <div className="search-bar" style={{ flex: 1 }}>
                                <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', borderRadius: 10, padding: '0 13px', border: '1.5px solid rgba(8,12,10,0.08)', flexShrink: 0 }}>
                                <svg width="13" height="13" fill="none" stroke="var(--ink-20)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-40)', letterSpacing: '-0.01em' }}>{filtrados.length}</span>
                            </div>
                        </div>
                        <div className="tabs-scroll">
                            {categorias.map((cat, i) => (
                                <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`chip ${categoriaActiva === cat ? 'active' : ''}`}>
                                    {cat !== 'Todas' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: categoriaActiva === cat ? '#c8f560' : CAT_COLORS[(i - 1) % CAT_COLORS.length], flexShrink: 0 }} />}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid productos */}
                    <div className="card" style={{ padding: '16px', flex: 1 }}>
                        {filtrados.length === 0 ? (
                            <div className="empty-state">
                                <span style={{ fontSize: 30 }}>📦</span>
                                <p style={{ fontWeight: 800, color: 'var(--ink-30)', fontSize: 13 }}>Sin productos</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 11 }}>
                                {filtrados.map(p => {
                                    const enCarrito = carrito.find(i => i.producto_id === p.id)
                                    const agotado = p.stock === 0
                                    return (
                                        <button key={p.id} onClick={() => agregarAlCarrito(p)} disabled={agotado} style={{
                                            position: 'relative', padding: '15px', borderRadius: 14, textAlign: 'left',
                                            border: `2px solid ${agotado ? 'rgba(8,12,10,0.06)' : enCarrito ? '#c8f560' : 'rgba(8,12,10,0.08)'}`,
                                            background: agotado ? 'var(--surface)' : enCarrito ? 'rgba(200,245,96,0.08)' : '#fff',
                                            cursor: agotado ? 'not-allowed' : 'pointer',
                                            opacity: agotado ? 0.5 : 1,
                                            transition: 'all 0.15s ease',
                                            boxShadow: enCarrito ? '0 4px 16px rgba(200,245,96,0.25)' : 'var(--shadow-sm)',
                                        }}
                                            onMouseEnter={e => { if (!agotado && !enCarrito) { e.currentTarget.style.border = '2px solid rgba(200,245,96,0.5)'; e.currentTarget.style.background = 'rgba(200,245,96,0.05)' } }}
                                            onMouseLeave={e => { if (!agotado && !enCarrito) { e.currentTarget.style.border = '2px solid rgba(8,12,10,0.08)'; e.currentTarget.style.background = '#fff' } }}
                                        >
                                            {enCarrito && (
                                                <div style={{ position: 'absolute', top: 9, right: 9, width: 21, height: 21, borderRadius: '50%', background: '#c8f560', color: '#080c0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                                                    {enCarrito.cantidad}
                                                </div>
                                            )}
                                            <p style={{ fontSize: 10, color: enCarrito ? '#4a7020' : 'var(--ink-20)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                                                {p.categoria || 'General'}
                                            </p>
                                            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 9, letterSpacing: '-0.02em' }}>{p.nombre}</p>
                                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, color: enCarrito ? '#4a7020' : 'var(--ink)', marginBottom: 8, letterSpacing: '-0.04em' }}>
                                                ${Number(p.precio).toLocaleString()}
                                            </p>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 99,
                                                background: agotado ? '#fff1f1' : p.stock <= 10 ? '#fffbeb' : 'rgba(200,245,96,0.12)',
                                                color: agotado ? '#c53030' : p.stock <= 10 ? '#92400e' : '#4a7020',
                                                border: `1px solid ${agotado ? '#fecaca' : p.stock <= 10 ? '#fde68a' : 'rgba(200,245,96,0.3)'}`,
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

                {/* Right: carrito desktop */}
                <div className="pos-sidebar-desktop" style={{ width: 330, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <PanelCarrito />
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .pos-sidebar-desktop { display: none !important; }
          .mobile-cart-fab { display: block !important; }
          .pos-container { flex-direction: column !important; }
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
        </div>
    )
}