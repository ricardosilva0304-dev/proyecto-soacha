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
        const { data, error } = await supabase
            .from('ventas')
            .select('*, clientes(nombre, telefono), detalle_ventas(cantidad, precio_unitario, productos(nombre, categoria))')
            .order('fecha', { ascending: false })
        if (error) { setError(error.message); setCargando(false); return }
        setVentas(data || [])
        setCargando(false)
    }

    const handleAnular = async (id) => {
        if (!confirm('¿Anular esta venta? Esta acción restaurará el stock de los productos.')) return
        setAnulando(id)
        // Obtener detalles antes de anular
        const venta = ventas.find(v => v.id === id)
        if (venta?.detalle_ventas) {
            for (const d of venta.detalle_ventas) {
                if (d.productos) {
                    const { data: prod } = await supabase.from('productos').select('stock, id').eq('nombre', d.productos.nombre).single()
                    if (prod) {
                        await supabase.from('productos').update({ stock: prod.stock + d.cantidad }).eq('id', prod.id)
                    }
                }
            }
        }
        await supabase.from('detalle_ventas').delete().eq('venta_id', id)
        await supabase.from('ventas').delete().eq('id', id)
        setAnulando(null)
        setVentaDetalle(null)
        await cargarVentas()
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
                    { label: 'Ventas filtradas', val: filtradas.length, emoji: '🔍', accent: { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', val: '#4a7020' } },
                    { label: 'Ingresos totales', val: `$${ventas.reduce((s, v) => s + Number(v.total), 0).toLocaleString()}`, emoji: '💰', accent: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', val: '#6d28d9' } },
                    { label: 'Periodo filtrado', val: `$${totalFiltrado.toLocaleString()}`, emoji: '📊', accent: { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', val: '#92400e' } },
                ].map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '18px 20px', background: `linear-gradient(135deg, #fff 60%, ${s.accent.bg})`, border: `1px solid ${s.accent.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: s.accent.bg, opacity: 0.8 }} />
                        <div style={{ marginBottom: 10, fontSize: 20 }}>{s.emoji}</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: s.accent.val, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-30)', marginTop: 4, fontWeight: 600 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
                        <svg className="search-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input className="form-input" style={{ paddingLeft: 37 }} placeholder="Buscar por cliente, ID o monto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', borderRadius: 10, padding: '8px 12px', border: '1.5px solid rgba(8,12,10,0.08)' }}>
                            <svg width="13" height="13" fill="none" stroke="var(--ink-30)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-50)', fontFamily: 'var(--font-body)', cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--ink-20)', fontWeight: 600 }}>—</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', borderRadius: 10, padding: '8px 12px', border: '1.5px solid rgba(8,12,10,0.08)' }}>
                            <svg width="13" height="13" fill="none" stroke="var(--ink-30)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--ink-50)', fontFamily: 'var(--font-body)', cursor: 'pointer' }} />
                        </div>
                    </div>
                    {hayFiltros && (
                        <button className="btn btn-secondary btn-sm" onClick={limpiarFiltros}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Historial de Ventas</p>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 2 }}>{filtradas.length} transacciones · ${totalFiltrado.toLocaleString()} en total</p>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.length === 0 ? (
                                <tr><td colSpan={6}>
                                    <div className="empty-state">
                                        <span style={{ fontSize: 30 }}>🧾</span>
                                        <p style={{ fontWeight: 800, color: 'var(--ink-40)', fontSize: 14 }}>{hayFiltros ? 'Sin resultados' : 'No hay ventas registradas'}</p>
                                        <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>{hayFiltros ? 'Prueba con otros filtros' : 'Las ventas del POS aparecerán aquí'}</p>
                                    </div>
                                </td></tr>
                            ) : filtradas.map((v, i) => {
                                const fecha = v.fecha ? new Date(v.fecha) : null
                                const productos = v.detalle_ventas?.map(d => d.productos?.nombre).filter(Boolean).join(', ') || '—'
                                return (
                                    <tr key={v.id}>
                                        <td><span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 900, color: 'var(--ink-40)', letterSpacing: '-0.02em' }}>#{v.id}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#080c0a' }}>
                                                    {(v.clientes?.nombre?.[0] || 'G').toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{v.clientes?.nombre || 'Cliente general'}</span>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: 12, color: 'var(--ink-30)', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productos}</span></td>
                                        <td>
                                            {fecha ? (
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-60)' }}>{fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ) : <span style={{ color: 'var(--ink-05)' }}>—</span>}
                                        </td>
                                        <td><p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.03em' }}>${Number(v.total).toLocaleString()}</p></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setVentaDetalle(v)}>
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Ver
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleAnular(v.id)} disabled={anulando === v.id}>
                                                    {anulando === v.id ? <span className="spinner" style={{ width: 12, height: 12, borderColor: 'rgba(197,48,48,0.2)', borderTopColor: '#c53030' }} /> : <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                                                    Anular
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal detalle venta */}
            {ventaDetalle && (
                <div className="modal-overlay" onClick={() => setVentaDetalle(null)}>
                    <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '22px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Venta #{ventaDetalle.id}</p>
                                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>{ventaDetalle.fecha ? new Date(ventaDetalle.fecha).toLocaleString('es-CO') : '—'}</p>
                                </div>
                                <button className="btn btn-secondary btn-icon" onClick={() => setVentaDetalle(null)}>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                                <p style={{ fontSize: 11, color: 'var(--ink-20)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cliente</p>
                                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{ventaDetalle.clientes?.nombre || 'Cliente general'}</p>
                                {ventaDetalle.clientes?.telefono && <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 2 }}>{ventaDetalle.clientes.telefono}</p>}
                            </div>

                            <p style={{ fontSize: 11, color: 'var(--ink-20)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Productos</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                                {ventaDetalle.detalle_ventas?.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '10px 14px' }}>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{d.productos?.nombre || 'Producto'}</p>
                                            <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 2 }}>{d.cantidad} × ${Number(d.precio_unitario).toLocaleString()}</p>
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>${(d.cantidad * d.precio_unitario).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(8,12,10,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Total</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: '#4a7020', letterSpacing: '-0.04em' }}>${Number(ventaDetalle.total).toLocaleString()}</span>
                            </div>

                            <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => handleAnular(ventaDetalle.id)} disabled={anulando === ventaDetalle.id}>
                                {anulando === ventaDetalle.id ? <><span className="spinner" style={{ borderColor: 'rgba(197,48,48,0.2)', borderTopColor: '#c53030' }} />Anulando...</> : <><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Anular esta venta</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
