import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const COLORS = ['#16a34a', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981']

function StatCard({ title, value, sub, icon, colorClass, trend, trendUp }) {
    return (
        <div className="card card-hover stat-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...colorClass
                }}>
                    {icon}
                </div>
                {trend && (
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, fontWeight: 700,
                        color: trendUp ? '#15803d' : '#dc2626',
                        background: trendUp ? '#dcfce7' : '#fee2e2',
                        padding: '3px 10px', borderRadius: 100
                    }}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>
            <div style={{ marginTop: 16 }}>
                <p className="font-display" style={{ fontSize: 28, fontWeight: 800, color: '#1e2736', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#3d4f66', marginTop: 4 }}>{title}</p>
                {sub && <p style={{ fontSize: 11, color: '#8098b8', marginTop: 2 }}>{sub}</p>}
            </div>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div style={{
                background: '#0f1318', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
                <p style={{ fontSize: 11, color: '#5a7090', marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 14, fontWeight: 700, color: p.color }}>
                        {p.name === 'ingresos' ? `$${Number(p.value).toLocaleString()}` : p.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

function Dashboard() {
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
            setProductos(p.data)
            setClientes(c.data)
            setVentas(v.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const ventasPorDia = () => {
        const dias = []
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date()
            fecha.setDate(fecha.getDate() - i)
            const label = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' })
            const fechaStr = fecha.toISOString().split('T')[0]
            const v = ventas.filter(v => v.fecha?.split('T')[0] === fechaStr)
            dias.push({ dia: label, ingresos: v.reduce((s, x) => s + Number(x.total), 0), count: v.length })
        }
        return dias
    }

    const productosMasVendidos = () => {
        const c = {}
        ventas.forEach(v => v.detalle_ventas?.forEach(d => {
            const n = d.productos?.nombre || 'Desconocido'
            c[n] = (c[n] || 0) + d.cantidad
        }))
        return Object.entries(c).map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
    }

    const ventasPorCategoria = () => {
        const c = {}
        productos.forEach(p => { const cat = p.categoria || 'Sin categoría'; c[cat] = (c[cat] || 0) + p.stock })
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
            <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p style={{ color: '#8098b8', fontSize: 14 }}>Cargando información...</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Welcome banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f1318 0%, #161c26 60%, #1a2635 100%)',
                borderRadius: 20, padding: '28px 32px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: -60, right: 80, width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none'
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: '#5a7090', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Panel de Control Administrativo
                    </p>
                    <h2 className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                        Buenos días 👋
                    </h2>
                    <p style={{ color: '#5a7090', fontSize: 14 }}>
                        Aquí está el resumen de tu negocio hoy — {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {sinStock.length > 0 && (
                        <div style={{
                            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                            borderRadius: 14, padding: '12px 18px', textAlign: 'center'
                        }}>
                            <p style={{ color: '#f87171', fontSize: 11, fontWeight: 600 }}>Sin stock</p>
                            <p className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 800 }}>{sinStock.length}</p>
                        </div>
                    )}
                    <div style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 14, padding: '12px 18px', textAlign: 'center'
                    }}>
                        <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 600 }}>Total ventas</p>
                        <p className="font-display" style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>${totalVentas.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-stats">
                <StatCard
                    title="Productos en inventario" value={productos.length}
                    sub="Artículos registrados"
                    icon={<svg width="20" height="20" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    colorClass={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                />
                <StatCard
                    title="Clientes registrados" value={clientes.length}
                    sub="Base de clientes activa"
                    icon={<svg width="20" height="20" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    colorClass={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}
                />
                <StatCard
                    title="Ventas realizadas" value={ventas.length}
                    sub="Transacciones totales"
                    icon={<svg width="20" height="20" fill="none" stroke="#0ea5e9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    colorClass={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
                />
                <StatCard
                    title="Alertas de stock" value={stockBajo.length}
                    sub="Productos con stock bajo"
                    icon={<svg width="20" height="20" fill="none" stroke="#f59e0b" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    colorClass={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                />
            </div>

            {/* Charts row 1 */}
            <div className="card" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#1e2736' }}>Ingresos — Últimos 7 días</h3>
                        <p style={{ fontSize: 12, color: '#8098b8', marginTop: 2 }}>Evolución diaria de ventas</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 100 }}>Esta semana</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dataDia} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#8098b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#8098b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="ingresos" name="ingresos" stroke="#16a34a" strokeWidth={2.5}
                            dot={{ fill: '#16a34a', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#16a34a' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Charts row 2 */}
            <div className="grid-2">
                <div className="card" style={{ padding: '22px 24px' }}>
                    <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#1e2736', marginBottom: 4 }}>Productos más vendidos</h3>
                    <p style={{ fontSize: 12, color: '#8098b8', marginBottom: 16 }}>Por unidades vendidas</p>
                    {dataMasVendidos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><svg width="24" height="24" fill="none" stroke="#8098b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg></div>
                            <p style={{ color: '#8098b8', fontSize: 14, fontWeight: 600 }}>Sin datos de ventas</p>
                            <p style={{ color: '#a8bcd4', fontSize: 12 }}>Registra ventas para ver estadísticas</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={dataMasVendidos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#8098b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#8098b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="cantidad" name="Unidades" radius={[6, 6, 0, 0]}>
                                    {dataMasVendidos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="card" style={{ padding: '22px 24px' }}>
                    <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#1e2736', marginBottom: 4 }}>Stock por categoría</h3>
                    <p style={{ fontSize: 12, color: '#8098b8', marginBottom: 16 }}>Distribución del inventario</p>
                    {dataCategoria.length === 0 ? (
                        <div className="empty-state">
                            <p style={{ color: '#8098b8', fontSize: 14 }}>Sin categorías</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={dataCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                    {dataCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: '#8098b8' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid-2">

                {/* Stock alerts */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="15" height="15" fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e2736' }}>Alertas de Stock</p>
                                <p style={{ fontSize: 11, color: '#8098b8' }}>Productos con poco inventario</p>
                            </div>
                        </div>
                        <span className={`badge ${stockBajo.length > 0 ? 'badge-red' : 'badge-green'}`}>
                            {stockBajo.length} alertas
                        </span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        {stockBajo.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="20" height="20" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p style={{ color: '#3d4f66', fontSize: 14, fontWeight: 600 }}>¡Stock saludable!</p>
                                <p style={{ color: '#8098b8', fontSize: 12 }}>No hay productos con stock bajo</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {stockBajo.slice(0, 6).map(p => (
                                    <div key={p.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: '#f4f6f9', borderRadius: 10, padding: '10px 12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: p.stock === 0 ? '#fee2e2' : '#fef3c7',
                                                color: p.stock === 0 ? '#dc2626' : '#d97706',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, fontWeight: 700
                                            }}>
                                                {p.nombre[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e2736' }}>{p.nombre}</p>
                                                <p style={{ fontSize: 11, color: '#8098b8' }}>{p.categoria || 'Sin categoría'}</p>
                                            </div>
                                        </div>
                                        <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                                            {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent sales */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e2736' }}>Últimas Ventas</p>
                            <p style={{ fontSize: 11, color: '#8098b8' }}>Transacciones recientes</p>
                        </div>
                        <span className="badge badge-blue">{ventas.length} total</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        {ventas.length === 0 ? (
                            <div className="empty-state" style={{ padding: '24px' }}>
                                <div className="empty-icon">
                                    <svg width="24" height="24" fill="none" stroke="#8098b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <p style={{ color: '#3d4f66', fontSize: 14, fontWeight: 600 }}>Sin ventas registradas</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {ventas.slice(0, 6).map((v, i) => {
                                    const colors = ['#16a34a', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981']
                                    return (
                                        <div key={v.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            background: '#f4f6f9', borderRadius: 10, padding: '10px 12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 8,
                                                    background: colors[i % colors.length], color: '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 700
                                                }}>
                                                    {(v.clientes?.nombre?.[0] || 'C').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1e2736' }}>{v.clientes?.nombre || 'Cliente general'}</p>
                                                    <p style={{ fontSize: 11, color: '#8098b8' }}>
                                                        {new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e2736' }}>${Number(v.total).toLocaleString()}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard