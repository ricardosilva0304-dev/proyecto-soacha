import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
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

function StatCard({ title, value, sub, icon, accent, index }) {
    const accents = [
        { bg: 'rgba(200,245,96,0.08)', border: 'rgba(200,245,96,0.2)', iconBg: 'rgba(200,245,96,0.12)', iconColor: '#5a7a20', dot: '#c8f560' },
        { bg: 'rgba(96,200,245,0.08)', border: 'rgba(96,200,245,0.2)', iconBg: 'rgba(96,200,245,0.12)', iconColor: '#0369a1', dot: '#60c8f5' },
        { bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', iconBg: 'rgba(245,200,66,0.12)', iconColor: '#92400e', dot: '#f5c842' },
        { bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)', iconBg: 'rgba(255,107,107,0.12)', iconColor: '#c53030', dot: '#ff6b6b' },
    ]
    const a = accents[index % 4]
    return (
        <div className="card card-hover" style={{ padding: '22px 24px', background: `linear-gradient(135deg, #fff 60%, ${a.bg})`, border: `1px solid ${a.border}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: a.iconBg, opacity: 0.6 }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: a.iconBg, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.iconColor }}>
                    {icon}
                </div>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.dot, marginTop: 4, boxShadow: `0 0 8px ${a.dot}` }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{value}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-50)', letterSpacing: '-0.01em' }}>{title}</p>
            {sub && <p style={{ fontSize: 11, color: 'var(--ink-20)', marginTop: 3 }}>{sub}</p>}
        </div>
    )
}

export default function Dashboard() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [ventas, setVentas] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/productos`),
            axios.get(`${API}/clientes`),
            axios.get(`${API}/ventas`)
        ]).then(([p, c, v]) => {
            setProductos(p.data); setClientes(c.data); setVentas(v.data); setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const ventasPorDia = () => {
        return Array.from({ length: 7 }, (_, i) => {
            const fecha = new Date(); fecha.setDate(fecha.getDate() - (6 - i))
            const label = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' })
            const fechaStr = fecha.toISOString().split('T')[0]
            const v = ventas.filter(v => v.fecha?.split('T')[0] === fechaStr)
            return { dia: label, ingresos: v.reduce((s, x) => s + Number(x.total), 0), count: v.length }
        })
    }

    const productosMasVendidos = () => {
        const c = {}
        ventas.forEach(v => v.detalle_ventas?.forEach(d => {
            const n = d.productos?.nombre || 'Desconocido'
            c[n] = (c[n] || 0) + d.cantidad
        }))
        return Object.entries(c).map(([nombre, cantidad]) => ({ nombre: nombre.slice(0, 12), cantidad }))
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Hero banner */}
            <div style={{
                background: 'var(--ink)', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)', position: 'relative',
                padding: '30px 32px',
            }}>
                {/* Grid bg */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(200,245,96,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,245,96,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
                {/* Glow */}
                <div style={{ position: 'absolute', top: -60, left: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(200,245,96,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: 60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(96,200,245,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 99, padding: '4px 12px', marginBottom: 14 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8f560' }} />
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#c8f560', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Panel de Control</span>
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.1 }}>
                            Buenos días 👋
                        </h2>
                        <p style={{ color: 'var(--ink-20)', fontSize: 13.5 }}>
                            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {sinStock.length > 0 && (
                            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
                                <p style={{ fontSize: 10.5, fontWeight: 800, color: '#ff9b9b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sin stock</p>
                                <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{sinStock.length}</p>
                            </div>
                        )}
                        <div style={{ background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: 10.5, fontWeight: 800, color: '#c8f560', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total ventas</p>
                            <p style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>${totalVentas.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-stats">
                <StatCard index={0} title="Productos registrados" value={productos.length} sub="En inventario activo"
                    icon={<svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
                <StatCard index={1} title="Clientes registrados" value={clientes.length} sub="Base de clientes activa"
                    icon={<svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard index={2} title="Ventas realizadas" value={ventas.length} sub="Transacciones totales"
                    icon={<svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard index={3} title="Alertas de stock" value={stockBajo.length} sub="Productos con stock bajo"
                    icon={<svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            {/* Main chart */}
            <div className="card" style={{ padding: '24px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Ingresos — Últimos 7 días</p>
                        <p style={{ fontSize: 12, color: 'var(--ink-20)' }}>Evolución diaria de ventas</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4a7020', background: 'rgba(200,245,96,0.12)', border: '1px solid rgba(200,245,96,0.25)', padding: '5px 13px', borderRadius: 99, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Esta semana</span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                    <LineChart data={dataDia} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c8f560" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#c8f560" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--ink-20)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-20)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="ingresos" name="ingresos" stroke="#c8f560" strokeWidth={2.5}
                            dot={{ fill: '#c8f560', r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 7, fill: '#c8f560', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts row 2 */}
            <div className="grid-2">
                <div className="card" style={{ padding: '22px 24px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Más vendidos</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 18 }}>Por unidades</p>
                    {dataMasVendidos.length === 0 ? (
                        <div className="empty-state" style={{ padding: '28px' }}>
                            <span style={{ fontSize: 28 }}>📊</span>
                            <p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin datos de ventas</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={185}>
                            <BarChart data={dataMasVendidos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,12,10,0.05)" />
                                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--ink-20)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="cantidad" name="Unidades" radius={[6, 6, 0, 0]}>
                                    {dataMasVendidos.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card" style={{ padding: '22px 24px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 3 }}>Stock por categoría</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-20)', marginBottom: 18 }}>Distribución del inventario</p>
                    {dataCategoria.length === 0 ? (
                        <div className="empty-state" style={{ padding: '28px' }}><span style={{ fontSize: 28 }}>🗂️</span><p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin categorías</p></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={185}>
                            <PieChart>
                                <Pie data={dataCategoria} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value">
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
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="15" height="15" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Alertas de Stock</p>
                                <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>Productos con poco inventario</p>
                            </div>
                        </div>
                        <span className={`badge ${stockBajo.length > 0 ? 'badge-red' : 'badge-lime'}`}>{stockBajo.length} alertas</span>
                    </div>
                    <div style={{ padding: '14px' }}>
                        {stockBajo.length === 0 ? (
                            <div className="empty-state" style={{ padding: '28px' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,245,96,0.1)', border: '1px solid rgba(200,245,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="20" height="20" fill="none" stroke="#5a7a20" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p style={{ fontWeight: 800, color: 'var(--ink-50)', fontSize: 13 }}>¡Todo en orden!</p>
                                <p style={{ color: 'var(--ink-20)', fontSize: 12 }}>No hay alertas de stock</p>
                            </div>
                        ) : stockBajo.slice(0, 5).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 11, padding: '10px 13px', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: p.stock === 0 ? '#fff1f1' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.nombre}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{p.categoria || 'Sin categoría'}</p>
                                    </div>
                                </div>
                                <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>{p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent sales */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(8,12,10,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Últimas Ventas</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>Transacciones recientes</p>
                        </div>
                        <span className="badge badge-blue">{ventas.length} total</span>
                    </div>
                    <div style={{ padding: '14px' }}>
                        {ventas.length === 0 ? (
                            <div className="empty-state" style={{ padding: '28px' }}>
                                <span style={{ fontSize: 28 }}>🛒</span>
                                <p style={{ fontWeight: 700, color: 'var(--ink-30)', fontSize: 13 }}>Sin ventas registradas</p>
                            </div>
                        ) : ventas.slice(0, 5).map((v, i) => (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', borderRadius: 11, padding: '10px 13px', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE[i % PALETTE.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#080c0a' }}>
                                        {(v.clientes?.nombre?.[0] || 'C').toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{v.clientes?.nombre || 'Cliente general'}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ink-20)' }}>{new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                </div>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>${Number(v.total).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}