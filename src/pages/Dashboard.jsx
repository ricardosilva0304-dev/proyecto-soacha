import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PALETTE = ['#c8f560', '#60c8f5', '#f5c842', '#ff6b6b', '#a78bfa', '#34d399']

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#080c0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-20)', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 14, fontWeight: 800, color: p.color, letterSpacing: '-0.02em' }}>
                    {p.name === 'ingresos' ? `$${Number(p.value).toLocaleString()}` : p.value}
                </p>
            ))}
        </div>
    )
}

function StatCard({ title, value, sub, icon, index }) {
    const accents = [
        { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', iconBg: 'rgba(200,245,96,0.12)', iconColor: '#5a7a20', dot: '#c8f560' },
        { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', iconBg: 'rgba(96,200,245,0.12)', iconColor: '#0369a1', dot: '#60c8f5' },
        { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', iconBg: 'rgba(245,200,66,0.12)', iconColor: '#92400e', dot: '#f5c842' },
        { bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)', iconBg: 'rgba(255,107,107,0.12)', iconColor: '#c53030', dot: '#ff6b6b' },
    ]
    const a = accents[index % 4]
    return (
        <div className="card card-hover" style={{ padding: 'clamp(16px,3vw,22px) clamp(16px,3vw,24px)', background: `linear-gradient(135deg, #fff 60%, ${a.bg})`, border: `1px solid ${a.border}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: a.iconBg, opacity: 0.6 }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: a.iconBg, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.iconColor }}>
                    {icon}
                </div>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.dot, marginTop: 4, boxShadow: `0 0 8px ${a.dot}` }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{value}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-50)', letterSpacing: '-0.01em' }}>{title}</p>
            {sub && <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 3 }}>{sub}</p>}
        </div>
    )
}

const DEMO_DATA = {
    productos: [
        { id: 1, nombre: 'Arroz Diana 500g', categoria: 'Abarrotes', stock: 45, precio: 3200 },
        { id: 2, nombre: 'Aceite 1L', categoria: 'Abarrotes', stock: 8, precio: 12000 },
        { id: 3, nombre: 'Leche Alpina 1L', categoria: 'Lácteos', stock: 0, precio: 4500 },
        { id: 4, nombre: 'Pan tajado', categoria: 'Panadería', stock: 12, precio: 6800 },
        { id: 5, nombre: 'Jabón Rey', categoria: 'Aseo', stock: 3, precio: 2800 },
        { id: 6, nombre: 'Shampoo H&S', categoria: 'Aseo', stock: 20, precio: 15000 },
    ],
    clientes: [
        { id: 1, nombre: 'María García' },
        { id: 2, nombre: 'Carlos Pérez' },
        { id: 3, nombre: 'Ana Rodríguez' },
        { id: 4, nombre: 'Luis Martínez' },
    ],
    ventas: [
        { id: 1, total: 45000, fecha: new Date().toISOString(), clientes: { nombre: 'María García' }, detalle_ventas: [{ cantidad: 3, productos: { nombre: 'Arroz Diana 500g' } }] },
        { id: 2, total: 28000, fecha: new Date(Date.now() - 86400000).toISOString(), clientes: { nombre: 'Carlos Pérez' }, detalle_ventas: [{ cantidad: 2, productos: { nombre: 'Aceite 1L' } }] },
        { id: 3, total: 67000, fecha: new Date(Date.now() - 172800000).toISOString(), clientes: { nombre: 'Ana Rodríguez' }, detalle_ventas: [{ cantidad: 1, productos: { nombre: 'Shampoo H&S' } }] },
        { id: 4, total: 15000, fecha: new Date(Date.now() - 259200000).toISOString(), clientes: { nombre: 'Luis Martínez' }, detalle_ventas: [{ cantidad: 5, productos: { nombre: 'Jabón Rey' } }] },
        { id: 5, total: 52000, fecha: new Date(Date.now() - 345600000).toISOString(), clientes: { nombre: 'María García' }, detalle_ventas: [{ cantidad: 4, productos: { nombre: 'Pan tajado' } }] },
    ]
}

export default function Dashboard() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [ventas, setVentas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargarDatos = async () => {
            const [{ data: prods }, { data: clis }, { data: vents }] = await Promise.all([
                supabase.from('productos').select('*').order('id', { ascending: true }),
                supabase.from('clientes').select('*').order('id', { ascending: true }),
                supabase.from('ventas').select('*, clientes(nombre), detalle_ventas(*, productos(nombre))').order('fecha', { ascending: false }),
            ])
            setProductos(prods || DEMO_DATA.productos)
            setClientes(clis || DEMO_DATA.clientes)
            setVentas(vents || DEMO_DATA.ventas)
            setLoading(false)
        }
        cargarDatos()
    }, [])

    const ventasPorDia = () => Array.from({ length: 7 }, (_, i) => {
        const fecha = new Date(); fecha.setDate(fecha.getDate() - (6 - i))
        const label = fecha.toLocaleDateString('es-CO', { weekday: 'short' })
        const fechaStr = fecha.toISOString().split('T')[0]
        const v = ventas.filter(v => v.fecha?.split('T')[0] === fechaStr)
        return { dia: label, ingresos: v.reduce((s, x) => s + Number(x.total), 0), count: v.length }
    })

    const productosMasVendidos = () => {
        const c = {}
        ventas.forEach(v => v.detalle_ventas?.forEach(d => {
            const n = d.productos?.nombre || 'Desconocido'
            c[n] = (c[n] || 0) + d.cantidad
        }))
        return Object.entries(c).map(([nombre, cantidad]) => ({ nombre: nombre.slice(0, 10), cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
    }

    const ventasPorCategoria = () => {
        const c = {}
        productos.forEach(p => { const cat = p.categoria || 'Sin cat.'; c[cat] = (c[cat] || 0) + p.stock })
        return Object.entries(c).map(([name, value]) => ({ name, value }))
    }

    const totalVentas = ventas.reduce((s, v) => s + Number(v.total), 0)
    const stockBajo = productos.filter(p => p.stock <= 10)
    const sinStock = productos.filter(p => p.stock === 0)
    const dataDia = ventasPorDia()
    const dataMasVendidos = productosMasVendidos()
    const dataCategoria = ventasPorCategoria()

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
            <div className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ color: 'var(--ink-20)', fontSize: 13, fontWeight: 600 }}>Cargando datos...</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

            {/* Hero banner */}
            <div style={{
                background: 'var(--ink)', borderRadius: 'clamp(14px,2vw,20px)', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)', position: 'relative',
                padding: 'clamp(20px,4vw,30px) clamp(18px,4vw,32px)',
            }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,245,96,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,245,96,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -60, left: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(200,245,96,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: 60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(96,200,245,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 99, padding: '4px 12px', marginBottom: 12 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8f560' }} />
                                <span style={{ fontSize: 10, fontWeight: 800, color: '#c8f560', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Panel de Control</span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>
                                Buenos días 👋
                            </h2>
                            <p style={{ color: 'var(--ink-20)', fontSize: 'clamp(12px,2vw,13.5px)' }}>
                                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {sinStock.length > 0 && (
                                <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 12, padding: '12px 18px', textAlign: 'center', minWidth: 90 }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, color: '#ff9b9b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sin stock</p>
                                    <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{sinStock.length}</p>
                                </div>
                            )}
                            <div style={{ background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 12, padding: '12px 18px', textAlign: 'center', minWidth: 110 }}>
                                <p style={{ fontSize: 10, fontWeight: 800, color: '#c8f560', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total ventas</p>
                                <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>${totalVentas.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-stats">
                <StatCard index={0} title="Productos" value={productos.length} sub="En inventario"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
                <StatCard index={1} title="Clientes" value={clientes.length} sub="Registrados"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard index={2} title="Ventas" value={ventas.length} sub="Transacciones"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard index={3} title="Alertas" value={stockBajo.length} sub="Stock bajo"
                    icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            {/* Main line chart */}
            <div className="card" style={{ padding: 'clamp(16px,3vw,24px) clamp(16px,3vw,26px)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px,2.5vw,17px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Ingresos — Últimos 7 días</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)' }}>Evolución diaria de ventas</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4a7020', background: 'rgba(200,245,96,0.12)', border: '1px solid rgba(200,245,96,0.25)', padding: '5px 13px', borderRadius: 99, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Esta semana</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dataDia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--ink-20)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--ink-20)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} width={48} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="ingresos" name="ingresos" stroke="#c8f560" strokeWidth={2.5}
                            dot={{ fill: '#c8f560', r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 7, fill: '#c8f560', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts row */}
            <div className="grid-2">
                <div className="card" style={{ padding: 'clamp(16px,3vw,22px) clamp(16px,3vw,24px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Más vendidos</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 16 }}>Por unidades</p>
                    {dataMasVendidos.length === 0 ? (
                        <div className="empty-state" style={{ padding: '28px' }}>
                            <span style={{ fontSize: 28 }}>📊</span>
                            <p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin datos</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={175}>
                            <BarChart data={dataMasVendidos} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                                <XAxis dataKey="nombre" tick={{ fontSize: 9.5, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9.5, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="cantidad" name="Unidades" radius={[5, 5, 0, 0]}>
                                    {dataMasVendidos.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card" style={{ padding: 'clamp(16px,3vw,22px) clamp(16px,3vw,24px)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Stock por categoría</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 16 }}>Distribución del inventario</p>
                    {dataCategoria.length === 0 ? (
                        <div className="empty-state" style={{ padding: '28px' }}><span style={{ fontSize: 28 }}>🗂️</span><p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin categorías</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={175}>
                            <PieChart>
                                <Pie data={dataCategoria} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                                    {dataCategoria.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                                <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ fontSize: 11, color: 'var(--ink-30)', fontFamily: 'var(--font-body)' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid-2">

                {/* Stock alerts */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="15" height="15" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Alertas de Stock</p>
                                <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>Poco inventario</p>
                            </div>
                        </div>
                        <span className={`badge ${stockBajo.length > 0 ? 'badge-red' : 'badge-lime'}`}>{stockBajo.length} alertas</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                        {stockBajo.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="20" height="20" fill="none" stroke="#5a7a20" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p style={{ fontWeight: 800, color: 'var(--ink-50)', fontSize: 13 }}>¡Todo en orden!</p>
                            </div>
                        ) : stockBajo.slice(0, 5).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '10px 12px', marginBottom: 7, gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: p.stock === 0 ? '#fff1f1' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📦</div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{p.categoria || 'Sin cat.'}</p>
                                    </div>
                                </div>
                                <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0 }}>{p.stock === 0 ? 'Sin stock' : `${p.stock}`}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent sales */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Últimas Ventas</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>Transacciones recientes</p>
                        </div>
                        <span className="badge badge-blue">{ventas.length} total</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                        {ventas.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px' }}>
                                <span style={{ fontSize: 28 }}>🛒</span>
                                <p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin ventas aún</p>
                            </div>
                        ) : ventas.slice(0, 5).map((v, i) => (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 10, padding: '10px 12px', marginBottom: 7, gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#080c0a', flexShrink: 0 }}>
                                        {(v.clientes?.nombre?.[0] || 'C').toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.clientes?.nombre || 'Cliente general'}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                </div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em', whiteSpace: 'nowrap', flexShrink: 0 }}>${Number(v.total).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
