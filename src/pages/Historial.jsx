import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

export default function Historial() {
    const [ventas, setVentas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [ventaDetalle, setVentaDetalle] = useState(null)
    const [error, setError] = useState(null)
    const [anulando, setAnulando] = useState(null)

    useEffect(() => { cargarVentas() }, [])

    const cargarVentas = async () => {
        setCargando(true)
        setError(null)
        const { data, error } = await supabase
            .from('ventas')
            .select('*, clientes(nombre, telefono), detalle_ventas(id, cantidad, precio_unitario, producto_id, productos(nombre, categoria))')
            .order('fecha', { ascending: false })
        if (error) { setError(error.message); setCargando(false); return }
        setVentas(data || [])
        setCargando(false)
    }

    const handleAnular = async (id) => {
        if (!confirm('¿Anular esta venta? Esta acción restaurará el stock de los productos.')) return
        setAnulando(id)
        try {
            const venta = ventas.find(v => v.id === id)
            // Restaurar stock usando producto_id directamente (no por nombre)
            if (venta?.detalle_ventas?.length) {
                for (const d of venta.detalle_ventas) {
                    if (d.producto_id && d.cantidad) {
                        const { data: prod } = await supabase
                            .from('productos')
                            .select('stock')
                            .eq('id', d.producto_id)
                            .single()
                        if (prod) {
                            await supabase
                                .from('productos')
                                .update({ stock: prod.stock + d.cantidad })
                                .eq('id', d.producto_id)
                        }
                    }
                }
            }
            await supabase.from('detalle_ventas').delete().eq('venta_id', id)
            await supabase.from('ventas').delete().eq('id', id)
            setVentaDetalle(null)
        } catch (err) {
            setError('Error al anular la venta: ' + err.message)
        } finally {
            setAnulando(null)
            await cargarVentas()
        }
    }

    const filtradas = ventas.filter(v => {
        const cliente = v.clientes?.nombre?.toLowerCase() || ''
        const matchBusq = busqueda === '' || cliente.includes(busqueda.toLowerCase()) || String(v.id).includes(busqueda) || String(v.total).includes(busqueda)
        const fecha = v.fecha ? new Date(v.fecha) : null
        const matchDesde = !fechaDesde || (fecha && fecha >= new Date(fechaDesde))
        const matchHasta = !fechaHasta || (fecha && fecha <= new Date(fechaHasta + 'T23:59:59'))
        return matchBusq && matchDesde && matchHasta
    })

    const totalFiltrado = filtradas.reduce((s, v) => s + Number(v.total), 0)
    const limpiarFiltros = () => { setBusqueda(''); setFechaDesde(''); setFechaHasta('') }
    const hayFiltros = busqueda || fechaDesde || fechaHasta

    if (cargando) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ color: 'var(--ink-20)', fontSize: 13, fontWeight: 600 }}>Cargando historial...</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {error && <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#c53030' }}>⚠️ {error}</div>}

            {/* Stats rápidos */}
            <div className="grid-stats">
                {[
                    { label: 'Total transacciones', val: ventas.length, emoji: '🧾', accent: { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', val: '#0369a1' } },
                    { label: 'Ingresos totales', val: `$${ventas.reduce((s, v) => s + Number(v.total), 0).toLocaleString()}`, emoji: '💰', accent: { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', val: '#4a7020' } },
                    { label: 'Filtradas', val: filtradas.length, emoji: '🔍', accent: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', val: '#6d28d9' } },
                    { label: 'Total filtrado', val: `$${totalFiltrado.toLocaleString()}`, emoji: '📊', accent: { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', val: '#92400e' } },
                ].map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '20px 22px', background: `linear-gradient(135deg, #fff 60%, ${s.accent.bg})`, border: `1px solid ${s.accent.border}` }}>
                        <div style={{ marginBottom: 12, fontSize: 22 }}>{s.emoji}</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: s.accent.val, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 5, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
                    <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input className="form-input" style={{ paddingLeft: 37 }} placeholder="Buscar por cliente, ID o monto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className="form-input" type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ width: 148 }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-20)', fontWeight: 600 }}>—</span>
                    <input className="form-input" type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ width: 148 }} />
                </div>
                {hayFiltros && (
                    <button className="btn btn-secondary btn-sm" onClick={limpiarFiltros}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Limpiar
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Historial de Ventas</p>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 2 }}>Mostrando {filtradas.length} de {ventas.length} transacciones</p>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Fecha</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.length === 0 ? (
                                <tr><td colSpan={6}>
                                    <div className="empty-state">
                                        <span style={{ fontSize: 30 }}>🧾</span>
                                        <p style={{ fontWeight: 800, color: 'var(--ink-40)', fontSize: 14 }}>{hayFiltros ? 'Sin resultados' : 'No hay ventas registradas'}</p>
                                        <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>{hayFiltros ? 'Prueba con otros filtros' : 'Las ventas aparecerán aquí'}</p>
                                    </div>
                                </td></tr>
                            ) : filtradas.map((v, i) => (
                                <tr key={v.id}>
                                    <td><span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-30)', fontFamily: 'var(--font-display)' }}>#{v.id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: 8, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#080c0a', flexShrink: 0 }}>
                                                {(v.clientes?.nombre?.[0] || 'C').toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{v.clientes?.nombre || 'Cliente general'}</p>
                                                {v.clientes?.telefono && <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{v.clientes.telefono}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {v.detalle_ventas?.slice(0, 2).map((d, j) => (
                                                <span key={j} style={{ fontSize: 11, background: 'var(--surface)', border: '1px solid rgba(8,12,10,0.07)', borderRadius: 6, padding: '2px 7px', color: 'var(--ink-40)', fontWeight: 600 }}>
                                                    {d.cantidad}× {d.productos?.nombre || 'Producto'}
                                                </span>
                                            ))}
                                            {(v.detalle_ventas?.length || 0) > 2 && (
                                                <span style={{ fontSize: 11, color: 'var(--ink-20)', padding: '2px 4px' }}>+{v.detalle_ventas.length - 2} más</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                                            ${Number(v.total).toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-50)' }}>{new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{new Date(v.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setVentaDetalle(v)}>
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                Ver
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleAnular(v.id)} disabled={anulando === v.id}>
                                                {anulando === v.id ? <span className="spinner" /> : (
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                )}
                                                Anular
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal detalle */}
            {ventaDetalle && (
                <div className="modal-overlay" onClick={() => setVentaDetalle(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Detalle de Venta #{ventaDetalle.id}</p>
                                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>{new Date(ventaDetalle.fecha).toLocaleString('es-CO')}</p>
                                </div>
                                <button className="btn btn-secondary btn-icon" onClick={() => setVentaDetalle(null)}>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Cliente</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{ventaDetalle.clientes?.nombre || 'Cliente general'}</p>
                                {ventaDetalle.clientes?.telefono && <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 2 }}>{ventaDetalle.clientes.telefono}</p>}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-20)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Productos</p>
                                {ventaDetalle.detalle_ventas?.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(8,12,10,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 7, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#080c0a' }}>{d.cantidad}</div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{d.productos?.nombre || 'Producto'}</p>
                                                <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>${Number(d.precio_unitario).toLocaleString()} c/u</p>
                                            </div>
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)' }}>${(d.cantidad * Number(d.precio_unitario)).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink)', borderRadius: 12, padding: '14px 18px' }}>
                                <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 15, fontWeight: 800 }}>Total</p>
                                <p style={{ fontFamily: 'var(--font-display)', color: '#c8f560', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>${Number(ventaDetalle.total).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
