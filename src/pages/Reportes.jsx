import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'

const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

/* ── Tooltip personalizado ── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#080c0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 14, fontWeight: 800, color: p.color || '#c8f560', letterSpacing: '-0.02em' }}>
                    {typeof p.value === 'number' && (p.name?.includes('ingreso') || p.name?.includes('total') || p.name?.includes('Ingresos'))
                        ? `$${p.value.toLocaleString('es-CO')}`
                        : p.value}
                </p>
            ))}
        </div>
    )
}

/* ── Mini sparkline (tendencia) ── */
const Sparkline = ({ data, color = '#c8f560' }) => (
    <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#', '')})`} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
)

/* ── Barra de progreso ── */
const ProgressBar = ({ pct, color }) => (
    <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', marginTop: 7 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
    </div>
)

export default function Reportes() {
    const [ventas, setVentas] = useState([])
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [periodo, setPeriodo] = useState('mes')
    const [exportando, setExportando] = useState(false)
    const [tabGrafico, setTabGrafico] = useState('area') // 'area' | 'barras'

    useEffect(() => { cargarDatos() }, [])

    const cargarDatos = async () => {
        setCargando(true)
        const [{ data: v }, { data: p }] = await Promise.all([
            supabase.from('ventas')
                .select('*, clientes(nombre, telefono), detalle_ventas(cantidad, precio_unitario, productos(nombre, categoria))')
                .order('fecha', { ascending: false }),
            supabase.from('productos').select('*').order('stock', { ascending: true }),
        ])
        setVentas(v || [])
        setProductos(p || [])
        setCargando(false)
    }

    /* ── Filtro de período ── */
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

    /* ── Período anterior (para comparar) ── */
    const ventasPeriodoAnterior = ventas.filter(v => {
        if (!v.fecha) return false
        const fecha = new Date(v.fecha)
        const ahora = new Date()
        if (periodo === 'semana') {
            const d1 = new Date(); d1.setDate(d1.getDate() - 14)
            const d2 = new Date(); d2.setDate(d2.getDate() - 7)
            return fecha >= d1 && fecha < d2
        }
        if (periodo === 'mes') {
            const mes = ahora.getMonth() === 0 ? 11 : ahora.getMonth() - 1
            const año = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear()
            return fecha.getMonth() === mes && fecha.getFullYear() === año
        }
        return false
    })

    /* ── KPIs ── */
    const totalIngresos = ventasFiltradas.reduce((s, v) => s + Number(v.total), 0)
    const totalAnterior = ventasPeriodoAnterior.reduce((s, v) => s + Number(v.total), 0)
    const ticketPromedio = ventasFiltradas.length > 0 ? totalIngresos / ventasFiltradas.length : 0
    const ticketAnterior = ventasPeriodoAnterior.length > 0
        ? ventasPeriodoAnterior.reduce((s, v) => s + Number(v.total), 0) / ventasPeriodoAnterior.length : 0
    const clientesUnicos = new Set(ventasFiltradas.map(v => v.cliente_id).filter(Boolean)).size || ventasFiltradas.filter(v => v.cliente_id).length
    const stockCritico = productos.filter(p => p.stock <= 10).length

    const variacion = (actual, anterior) => {
        if (!anterior) return null
        const pct = ((actual - anterior) / anterior) * 100
        return { pct: Math.abs(pct).toFixed(1), sube: pct >= 0 }
    }
    const varIngresos = variacion(totalIngresos, totalAnterior)
    const varTicket = variacion(ticketPromedio, ticketAnterior)

    /* ── Datos para gráficos ── */
    const ventasPorDia = Array.from({ length: 14 }, (_, i) => {
        const fecha = new Date(); fecha.setDate(fecha.getDate() - (13 - i))
        const fechaStr = fecha.toISOString().split('T')[0]
        const v = ventas.filter(x => x.fecha?.split('T')[0] === fechaStr)
        return {
            dia: fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            ingresos: v.reduce((s, x) => s + Number(x.total), 0),
            transacciones: v.length,
        }
    })

    // Sparkline data (últimos 7 días)
    const sparkData = ventasPorDia.slice(-7).map(d => ({ v: d.ingresos }))
    const sparkTx = ventasPorDia.slice(-7).map(d => ({ v: d.transacciones }))

    const productosMasVendidos = () => {
        const c = {}
        ventasFiltradas.forEach(v => v.detalle_ventas?.forEach(d => {
            const n = d.productos?.nombre || 'Otro'
            c[n] = (c[n] || 0) + (d.cantidad * d.precio_unitario)
        }))
        return Object.entries(c).map(([nombre, total]) => ({
            nombre: nombre.length > 14 ? nombre.slice(0, 14) + '…' : nombre, total
        })).sort((a, b) => b.total - a.total).slice(0, 6)
    }

    const ventasPorCategoria = () => {
        const c = {}
        ventasFiltradas.forEach(v => v.detalle_ventas?.forEach(d => {
            const cat = d.productos?.categoria || 'Sin cat.'
            c[cat] = (c[cat] || 0) + (d.cantidad * d.precio_unitario)
        }))
        return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }

    const clientesTop = () => {
        const c = {}
        ventasFiltradas.forEach(v => {
            const n = v.clientes?.nombre || 'Cliente general'
            c[n] = (c[n] || 0) + Number(v.total)
        })
        return Object.entries(c).map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => b.total - a.total).slice(0, 5)
    }

    // Ventas por hora del día
    const ventasPorHora = () => {
        const horas = Array(24).fill(0)
        ventasFiltradas.forEach(v => {
            if (v.fecha) {
                const h = new Date(v.fecha).getHours()
                horas[h] += Number(v.total)
            }
        })
        return horas.map((val, h) => ({
            hora: `${h.toString().padStart(2, '0')}h`,
            val,
        })).filter((_, i) => i >= 6 && i <= 22) // mostrar solo horas útiles
    }

    const topProductos = productosMasVendidos()
    const topCategorias = ventasPorCategoria()
    const topClientes = clientesTop()
    const horasData = ventasPorHora()
    const maxHora = Math.max(...horasData.map(d => d.val), 1)

    /* ── Exportar CSV ── */
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
        a.href = url; a.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`; a.click()
        URL.revokeObjectURL(url)
        setTimeout(() => setExportando(false), 800)
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── HEADER ── */}
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
                            {exportando
                                ? <span className="spinner spinner-dark" style={{ width: 12, height: 12 }} />
                                : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            CSV
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* ── KPIs CON SPARKLINES ── */}
            <div className="grid-stats">
                {/* Ingresos */}
                <div className="card card-hover" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 60%, rgba(200,245,96,0.06))', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,245,96,0.12)', border: '1px solid rgba(200,245,96,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💰</div>
                        {varIngresos && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: varIngresos.sube ? '#4a7020' : '#c53030', background: varIngresos.sube ? 'rgba(200,245,96,0.15)' : '#fff1f1', border: `1px solid ${varIngresos.sube ? 'rgba(200,245,96,0.3)' : '#fecaca'}`, borderRadius: 99, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                {varIngresos.sube ? '↑' : '↓'} {varIngresos.pct}%
                            </span>
                        )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#4a7020', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2 }}>
                        ${totalIngresos.toLocaleString('es-CO')}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-50)' }}>Ingresos del período</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 6 }}>{ventasFiltradas.length} ventas</p>
                    <Sparkline data={sparkData} color="#c8f560" />
                </div>

                {/* Ticket promedio */}
                <div className="card card-hover" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 60%, rgba(96,200,245,0.06))', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(96,200,245,0.12)', border: '1px solid rgba(96,200,245,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎫</div>
                        {varTicket && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: varTicket.sube ? '#4a7020' : '#c53030', background: varTicket.sube ? 'rgba(200,245,96,0.15)' : '#fff1f1', border: `1px solid ${varTicket.sube ? 'rgba(200,245,96,0.3)' : '#fecaca'}`, borderRadius: 99, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                {varTicket.sube ? '↑' : '↓'} {varTicket.pct}%
                            </span>
                        )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#0369a1', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2 }}>
                        ${Math.round(ticketPromedio).toLocaleString('es-CO')}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-50)' }}>Ticket promedio</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 6 }}>Por venta</p>
                    <Sparkline data={sparkData} color="#60c8f5" />
                </div>

                {/* Transacciones */}
                <div className="card card-hover" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 60%, rgba(167,139,250,0.06))', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛒</div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: '#6d28d9', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2 }}>
                        {ventasFiltradas.length}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-50)' }}>Transacciones</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 6 }}>En el período</p>
                    <Sparkline data={sparkTx} color="#a78bfa" />
                </div>

                {/* Stock crítico */}
                <div className="card card-hover" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 60%, rgba(245,200,66,0.06))', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚠️</div>
                        {stockCritico > 0 && <span className="badge badge-red">{stockCritico}</span>}
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: stockCritico > 0 ? '#c53030' : '#4a7020', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 2 }}>
                        {stockCritico}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-50)' }}>Productos en riesgo</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 6 }}>Stock ≤ 10 unidades</p>
                    <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min((stockCritico / Math.max(productos.length, 1)) * 100, 100)}%`, background: stockCritico > 3 ? '#ff6b6b' : '#f5c842', borderRadius: 99 }} />
                    </div>
                </div>
            </div>

            {/* ── GRÁFICO PRINCIPAL (Evolución) ── */}
            <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Evolución de ingresos</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Últimos 14 días</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[{ id: 'area', label: 'Área' }, { id: 'barras', label: 'Barras' }].map(t => (
                            <button key={t.id} onClick={() => setTabGrafico(t.id)} className={`chip ${tabGrafico === t.id ? 'active' : ''}`} style={{ fontSize: 11, padding: '5px 11px', minHeight: 28 }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                    {tabGrafico === 'area' ? (
                        <AreaChart data={ventasPorDia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c8f560" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#c8f560" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#c8f560" strokeWidth={2.5} fill="url(#gradIngresos)" dot={{ fill: '#c8f560', r: 3 }} activeDot={{ r: 6, fill: '#c8f560', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    ) : (
                        <BarChart data={ventasPorDia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" vertical={false} />
                            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="ingresos" name="Ingresos" radius={[5, 5, 0, 0]}>
                                {ventasPorDia.map((d, i) => <Cell key={i} fill={d.ingresos > 0 ? '#c8f560' : 'var(--surface-2)'} />)}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>

                {/* Resumen rápido de la semana */}
                <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(8,12,10,0.06)', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Pico del día', val: `$${Math.max(...ventasPorDia.map(d => d.ingresos)).toLocaleString('es-CO')}`, sub: ventasPorDia.find(d => d.ingresos === Math.max(...ventasPorDia.map(x => x.ingresos)))?.dia || '—' },
                        { label: 'Promedio diario', val: `$${Math.round(ventasPorDia.reduce((s, d) => s + d.ingresos, 0) / 14).toLocaleString('es-CO')}`, sub: 'Últimos 14 días' },
                        { label: 'Días con ventas', val: ventasPorDia.filter(d => d.ingresos > 0).length, sub: 'De los últimos 14' },
                    ].map(s => (
                        <div key={s.label} style={{ flex: '1 1 120px', background: 'var(--surface)', borderRadius: 10, padding: '10px 14px' }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>{s.val}</p>
                            <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-50)', marginTop: 2 }}>{s.label}</p>
                            <p style={{ fontSize: 10.5, color: 'var(--ink-20)' }}>{s.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FILA: Productos + Categorías ── */}
            <div className="grid-2">
                {/* Productos más rentables */}
                <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 2 }}>Productos más rentables</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 18 }}>Por ingresos generados</p>
                    {topProductos.length === 0 ? (
                        <div className="empty-state" style={{ padding: 28 }}><span style={{ fontSize: 28 }}>📊</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos en este período</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {topProductos.map((p, i) => (
                                <div key={p.nombre}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 22, height: 22, borderRadius: 6, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#080c0a', flexShrink: 0 }}>{i + 1}</div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-70)' }}>{p.nombre}</span>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>${p.total.toLocaleString('es-CO')}</span>
                                    </div>
                                    <ProgressBar pct={(p.total / topProductos[0].total) * 100} color={PALETTE[i % PALETTE.length]} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ventas por categoría */}
                <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 2 }}>Ventas por categoría</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 10 }}>Distribución de ingresos</p>
                    {topCategorias.length === 0 ? (
                        <div className="empty-state" style={{ padding: 28 }}><span style={{ fontSize: 28 }}>🗂️</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos en este período</p></div>
                    ) : (
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie data={topCategorias} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="value">
                                        {topCategorias.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => [`$${Number(v).toLocaleString('es-CO')}`, 'Ingresos']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 100 }}>
                                {topCategorias.map((cat, i) => {
                                    const pct = ((cat.value / topCategorias.reduce((s, c) => s + c.value, 0)) * 100).toFixed(1)
                                    return (
                                        <div key={cat.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                                                    <span style={{ fontSize: 12, color: 'var(--ink-50)', fontWeight: 600 }}>{cat.name}</span>
                                                </div>
                                                <span style={{ fontSize: 11, color: 'var(--ink-30)', fontWeight: 700 }}>{pct}%</span>
                                            </div>
                                            <ProgressBar pct={parseFloat(pct)} color={PALETTE[i % PALETTE.length]} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FILA: Clientes top + Actividad por hora ── */}
            <div className="grid-2">
                {/* Top clientes */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Mejores clientes</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Por volumen de compra</p>
                        </div>
                        <span className="badge badge-lime">{topClientes.length} clientes</span>
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
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</p>
                                    <ProgressBar pct={(c.total / topClientes[0].total) * 100} color={PALETTE[i % PALETTE.length]} />
                                </div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em', flexShrink: 0 }}>
                                    ${c.total.toLocaleString('es-CO')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actividad por hora */}
                <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 2 }}>Actividad por hora</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 16 }}>¿Cuándo vendes más?</p>
                    {horasData.every(d => d.val === 0) ? (
                        <div className="empty-state" style={{ padding: 24 }}><span style={{ fontSize: 24 }}>🕐</span><p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-30)' }}>Sin datos de horario</p></div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90 }}>
                            {horasData.map((h, i) => {
                                const pct = (h.val / maxHora) * 100
                                const esPico = h.val === maxHora && h.val > 0
                                return (
                                    <div key={h.hora} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${h.hora}: $${h.val.toLocaleString('es-CO')}`}>
                                        <div style={{ width: '100%', height: `${Math.max(pct, h.val > 0 ? 8 : 2)}%`, background: esPico ? '#c8f560' : pct > 50 ? 'var(--ink-20)' : 'var(--surface-2)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s', minHeight: h.val > 0 ? 4 : 2 }} />
                                        {i % 3 === 0 && <span style={{ fontSize: 8, color: 'var(--ink-20)', whiteSpace: 'nowrap' }}>{h.hora}</span>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {horasData.some(d => d.val > 0) && (
                        <div style={{ marginTop: 12, background: 'var(--surface)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8f560' }} />
                            <span style={{ fontSize: 12, color: 'var(--ink-50)', fontWeight: 600 }}>
                                Hora pico: <strong style={{ color: 'var(--ink)' }}>{horasData.find(d => d.val === maxHora)?.hora}</strong>
                                {' · '}${maxHora.toLocaleString('es-CO')} en ventas
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── TABLA VENTAS RECIENTES ── */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Ventas recientes</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Últimas {Math.min(ventasFiltradas.length, 10)} transacciones</p>
                    </div>
                    <span className="badge badge-gray">{ventasFiltradas.length} total</span>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventasFiltradas.length === 0 ? (
                                <tr><td colSpan={5}>
                                    <div className="empty-state"><span style={{ fontSize: 28 }}>🧾</span><p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin ventas en este período</p></div>
                                </td></tr>
                            ) : ventasFiltradas.slice(0, 10).map(v => (
                                <tr key={v.id}>
                                    <td><span style={{ fontSize: 11.5, color: 'var(--ink-20)', fontWeight: 700 }}>#{v.id}</span></td>
                                    <td>
                                        <p style={{ fontSize: 13, color: 'var(--ink-70)', fontWeight: 600 }}>
                                            {v.fecha ? new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>
                                            {v.fecha ? new Date(v.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--ink-40)', flexShrink: 0 }}>
                                                {(v.clientes?.nombre?.[0] || 'G').toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-70)' }}>{v.clientes?.nombre || 'Cliente general'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {v.detalle_ventas?.slice(0, 2).map((d, i) => (
                                                <span key={i} className="badge badge-gray" style={{ fontSize: 10.5 }}>
                                                    {d.productos?.nombre || 'Producto'} ×{d.cantidad}
                                                </span>
                                            ))}
                                            {(v.detalle_ventas?.length || 0) > 2 && (
                                                <span className="badge badge-gray" style={{ fontSize: 10.5 }}>+{v.detalle_ventas.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: '#4a7020', letterSpacing: '-0.02em' }}>
                                            ${Number(v.total).toLocaleString('es-CO')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── STOCK CRÍTICO ── */}
            {stockCritico > 0 && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>⚠️ Stock crítico</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-20)', marginTop: 2 }}>Productos que requieren reposición urgente</p>
                        </div>
                        <span className="badge badge-red">{stockCritico} productos</span>
                    </div>
                    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                        {productos.filter(p => p.stock <= 10).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '10px 14px', gap: 8 }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                                    <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{p.categoria || 'Sin cat.'}</p>
                                </div>
                                <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0 }}>
                                    {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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