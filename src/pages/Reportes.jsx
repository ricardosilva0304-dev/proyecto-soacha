import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#080c0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 14, fontWeight: 800, color: p.color || '#c8f560', letterSpacing: '-0.02em' }}>
                    {typeof p.value === 'number' && p.name?.includes('ingreso') ? `$${p.value.toLocaleString()}` : p.value}
                </p>
            ))}
        </div>
    )
}

export default function Reportes() {
    const [ventas, setVentas] = useState([])
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [periodo, setPeriodo] = useState('mes')
    const [exportando, setExportando] = useState(false)
    const reportRef = useRef(null)

    useEffect(() => { cargarDatos() }, [])

    const cargarDatos = async () => {
        setCargando(true)
        const [{ data: v }, { data: p }, { data: c }] = await Promise.all([
            supabase.from('ventas').select('*, clientes(nombre), detalle_ventas(cantidad, precio_unitario, productos(nombre, categoria))').order('fecha', { ascending: false }),
            supabase.from('productos').select('*').order('stock', { ascending: true }),
            supabase.from('clientes').select('*'),
        ])
        setVentas(v || [])
        setProductos(p || [])
        setClientes(c || [])
        setCargando(false)
    }

    // Filtrar ventas por periodo
    const ventasFiltradas = ventas.filter(v => {
        if (!v.fecha) return false
        const fecha = new Date(v.fecha)
        const ahora = new Date()
        if (periodo === 'semana') { const d = new Date(); d.setDate(d.getDate() - 7); return fecha >= d }
        if (periodo === 'mes') { return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear() }
        if (periodo === 'trimestre') { const d = new Date(); d.setMonth(d.getMonth() - 3); return fecha >= d }
        if (periodo === 'año') { return fecha.getFullYear() === ahora.getFullYear() }
        return true
    })

    // Ventas por día (últimos 14 días)
    const ventasPorDia = Array.from({ length: 14 }, (_, i) => {
        const fecha = new Date(); fecha.setDate(fecha.getDate() - (13 - i))
        const fechaStr = fecha.toISOString().split('T')[0]
        const v = ventasFiltradas.filter(x => x.fecha?.split('T')[0] === fechaStr)
        return {
            dia: fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            ingresos: v.reduce((s, x) => s + Number(x.total), 0),
            transacciones: v.length,
        }
    })

    // Productos más vendidos
    const productosMasVendidos = () => {
        const c = {}
        ventasFiltradas.forEach(v => v.detalle_ventas?.forEach(d => {
            const n = d.productos?.nombre || 'Otro'
            c[n] = (c[n] || 0) + (d.cantidad * d.precio_unitario)
        }))
        return Object.entries(c).map(([nombre, total]) => ({ nombre: nombre.length > 12 ? nombre.slice(0, 12) + '…' : nombre, total }))
            .sort((a, b) => b.total - a.total).slice(0, 6)
    }

    // Ventas por categoría
    const ventasPorCategoria = () => {
        const c = {}
        ventasFiltradas.forEach(v => v.detalle_ventas?.forEach(d => {
            const cat = d.productos?.categoria || 'Sin cat.'
            c[cat] = (c[cat] || 0) + (d.cantidad * d.precio_unitario)
        }))
        return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }

    // Clientes top
    const clientesTop = () => {
        const c = {}
        ventasFiltradas.forEach(v => {
            const n = v.clientes?.nombre || 'General'
            c[n] = (c[n] || 0) + Number(v.total)
        })
        return Object.entries(c).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total).slice(0, 5)
    }

    const totalIngresos = ventasFiltradas.reduce((s, v) => s + Number(v.total), 0)
    const ticketPromedio = ventasFiltradas.length > 0 ? totalIngresos / ventasFiltradas.length : 0
    const topProductos = productosMasVendidos()
    const topCategorias = ventasPorCategoria()
    const topClientes = clientesTop()

    // Exportar CSV
    const exportarCSV = () => {
        setExportando(true)
        const headers = ['ID', 'Fecha', 'Cliente', 'Productos', 'Total']
        const rows = ventasFiltradas.map(v => [
            v.id,
            v.fecha ? new Date(v.fecha).toLocaleString('es-CO') : '',
            v.clientes?.nombre || 'Cliente general',
            v.detalle_ventas?.map(d => `${d.productos?.nombre || ''} x${d.cantidad}`).join(' | ') || '',
            v.total,
        ])
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        setTimeout(() => setExportando(false), 800)
    }

    // Exportar PDF (print)
    const exportarPDF = () => {
        window.print()
    }

    const periodos = [
        { value: 'semana', label: 'Esta semana' },
        { value: 'mes', label: 'Este mes' },
        { value: 'trimestre', label: 'Trimestre' },
        { value: 'año', label: 'Este año' },
        { value: 'todo', label: 'Todo' },
    ]

    if (cargando) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ color: 'var(--ink-20)', fontSize: 13, fontWeight: 600 }}>Generando reportes...</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} ref={reportRef}>

            {/* Header con filtros y exportar */}
            <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Período de análisis</p>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-20)', marginTop: 1 }}>{ventasFiltradas.length} ventas en el período seleccionado</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div className="tabs-scroll" style={{ gap: 6 }}>
                        {periodos.map(p => (
                            <button key={p.value} onClick={() => setPeriodo(p.value)} className={`chip ${periodo === p.value ? 'active' : ''}`} style={{ fontSize: 12, padding: '6px 13px', minHeight: 32 }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={exportarCSV} disabled={exportando}>
                            {exportando ? <span className="spinner spinner-dark" style={{ width: 12, height: 12 }} /> : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            CSV
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={exportarPDF}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid-stats">
                {[
                    { label: 'Ingresos del período', val: `$${totalIngresos.toLocaleString()}`, sub: `${ventasFiltradas.length} ventas`, emoji: '💰', accent: { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', val: '#4a7020' } },
                    { label: 'Ticket promedio', val: `$${Math.round(ticketPromedio).toLocaleString()}`, sub: 'Por venta', emoji: '🎫', accent: { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', val: '#0369a1' } },
                    { label: 'Productos en riesgo', val: productos.filter(p => p.stock <= 10).length, sub: 'Stock ≤ 10 unidades', emoji: '⚠️', accent: { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', val: '#92400e' } },
                    { label: 'Clientes activos', val: new Set(ventasFiltradas.map(v => v.cliente_id).filter(Boolean)).size || ventasFiltradas.length, sub: 'En el período', emoji: '👥', accent: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', val: '#6d28d9' } },
                ].map(s => (
                    <div key={s.label} className="card card-hover" style={{ padding: '18px 20px', background: `linear-gradient(135deg, #fff 60%, ${s.accent.bg})`, border: `1px solid ${s.accent.border}`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: s.accent.bg, opacity: 0.8 }} />
                        <div style={{ marginBottom: 10, fontSize: 20 }}>{s.emoji}</div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: s.accent.val, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-50)', letterSpacing: '-0.01em', marginTop: 5 }}>{s.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 2 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Gráfico de ingresos */}
            <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Evolución de ingresos</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Últimos 14 días</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c8f560' }} />
                            <span style={{ fontSize: 11, color: 'var(--ink-30)', fontWeight: 600 }}>Ingresos</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#60c8f5' }} />
                            <span style={{ fontSize: 11, color: 'var(--ink-30)', fontWeight: 600 }}>Transacciones</span>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={ventasPorDia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} width={52} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} width={24} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line yAxisId="left" type="monotone" dataKey="ingresos" name="ingresos" stroke="#c8f560" strokeWidth={2.5} dot={{ fill: '#c8f560', r: 3 }} activeDot={{ r: 6, fill: '#c8f560', stroke: '#fff', strokeWidth: 2 }} />
                        <Line yAxisId="right" type="monotone" dataKey="transacciones" name="transacciones" stroke="#60c8f5" strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={{ r: 5, fill: '#60c8f5' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Fila 2: productos + categorías */}
            <div className="grid-2">
                <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 4 }}>Productos más rentables</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 18 }}>Por ingresos generados</p>
                    {topProductos.length === 0 ? (
                        <div className="empty-state" style={{ padding: 28 }}><span style={{ fontSize: 28 }}>📊</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={topProductos} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10, fill: 'var(--ink-40)', fontWeight: 600 }} axisLine={false} tickLine={false} width={70} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total" name="Ingresos" radius={[0, 5, 5, 0]}>
                                    {topProductos.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 4 }}>Ventas por categoría</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 18 }}>Distribución de ingresos</p>
                    {topCategorias.length === 0 ? (
                        <div className="empty-state" style={{ padding: 28 }}><span style={{ fontSize: 28 }}>🗂️</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                                <Pie data={topCategorias} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                    {topCategorias.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Ingresos']} />
                                <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ fontSize: 11, color: 'var(--ink-30)', fontFamily: 'var(--font-body)' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Fila 3: clientes top + stock crítico */}
            <div className="grid-2">
                {/* Top clientes */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Mejores clientes</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Por volumen de compra</p>
                    </div>
                    <div style={{ padding: '12px' }}>
                        {topClientes.length === 0 ? (
                            <div className="empty-state" style={{ padding: 24 }}><span style={{ fontSize: 24 }}>👥</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos</p></div>
                        ) : topClientes.map((c, i) => (
                            <div key={c.nombre} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', borderRadius: 11, padding: '11px 14px', marginBottom: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#080c0a', flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</p>
                                    <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(c.total / topClientes[0].total) * 100}%`, background: PALETTE[i % PALETTE.length], borderRadius: 99, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', flexShrink: 0 }}>${c.total.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stock crítico */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Stock crítico</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Requieren reposición</p>
                        </div>
                        <span className="badge badge-red">{productos.filter(p => p.stock <= 10).length} productos</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                        {productos.filter(p => p.stock <= 10).length === 0 ? (
                            <div className="empty-state" style={{ padding: 24 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="20" height="20" fill="none" stroke="#5a7a20" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p style={{ fontWeight: 800, color: 'var(--ink-50)', fontSize: 13 }}>¡Todo en orden!</p>
                            </div>
                        ) : productos.filter(p => p.stock <= 10).slice(0, 6).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '10px 12px', marginBottom: 7, gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: p.stock === 0 ? '#fff1f1' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📦</div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{p.categoria || 'Sin cat.'}</p>
                                    </div>
                                </div>
                                <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0 }}>{p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Estilos para impresión */}
            <style>{`
                @media print {
                    .app-header, .sidebar, .sidebar-overlay { display: none !important; }
                    .main-content { margin-left: 0 !important; }
                    .page-content { padding: 0 !important; }
                    .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
                    .grid-2 { grid-template-columns: 1fr 1fr !important; }
                    .grid-stats { grid-template-columns: repeat(4, 1fr) !important; }
                }
            `}</style>
        </div>
    )
}
