import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const IconBox = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
)
const IconUsers = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)
const IconCart = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
)
const IconMoney = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const IconWarning = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)
const IconTrend = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
)
const IconReceipt = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
)
const IconChevronRight = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

function getInitials(nombre) {
    if (!nombre) return 'CG'
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getColor(id) {
    const colors = [
        'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
        'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500'
    ]
    return colors[id % colors.length]
}

function StatCard({ titulo, valor, sub, Icon, colorIcon, colorBg, trend }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${colorBg} rounded-xl flex items-center justify-center ${colorIcon}`}>
                    <Icon />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <IconTrend />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{valor}</p>
            <p className="text-sm font-semibold text-slate-600">{titulo}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    )
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
        })
    }, [])

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0)
    const stockBajo = productos.filter(p => p.stock <= 10)
    const sinStock = productos.filter(p => p.stock === 0)
    const valorInventario = productos.reduce((s, p) => s + p.precio * p.stock, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Cargando datos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">

            {/* Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Bienvenido al panel de control</h2>
                        <p className="text-blue-200 text-sm">
                            Aquí tienes un resumen completo del estado de tu negocio hoy.
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        {sinStock.length > 0 && (
                            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 border border-white/20">
                                <p className="text-xs text-blue-200">Sin stock</p>
                                <p className="text-2xl font-bold">{sinStock.length}</p>
                            </div>
                        )}
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 border border-white/20">
                            <p className="text-xs text-blue-200">Valor inventario</p>
                            <p className="text-2xl font-bold">${valorInventario.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    titulo="Productos registrados"
                    valor={productos.length}
                    sub="En inventario activo"
                    Icon={IconBox}
                    colorIcon="text-blue-600"
                    colorBg="bg-blue-50"
                />
                <StatCard
                    titulo="Clientes registrados"
                    valor={clientes.length}
                    sub="Base de clientes"
                    Icon={IconUsers}
                    colorIcon="text-violet-600"
                    colorBg="bg-violet-50"
                />
                <StatCard
                    titulo="Ventas realizadas"
                    valor={ventas.length}
                    sub="Transacciones totales"
                    Icon={IconCart}
                    colorIcon="text-emerald-600"
                    colorBg="bg-emerald-50"
                />
                <StatCard
                    titulo="Ingresos totales"
                    valor={`$${totalVentas.toLocaleString()}`}
                    sub="Acumulado histórico"
                    Icon={IconMoney}
                    colorIcon="text-amber-600"
                    colorBg="bg-amber-50"
                />
            </div>

            {/* Fila inferior */}
            <div className="grid grid-cols-2 gap-4">

                {/* Stock bajo */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                                <IconWarning />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Alertas de stock</h3>
                                <p className="text-xs text-slate-400">Productos que requieren atención</p>
                            </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${stockBajo.length > 0
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                            {stockBajo.length} alertas
                        </span>
                    </div>
                    <div className="p-4">
                        {stockBajo.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-600">Todo el stock está bien</p>
                                <p className="text-xs text-slate-400 mt-1">No hay productos con stock bajo</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {stockBajo.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${p.stock === 0 ? 'bg-red-500' : 'bg-amber-500'
                                                }`}>
                                                {p.nombre[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">{p.nombre}</p>
                                                <p className="text-xs text-slate-400">{p.categoria || 'Sin categoría'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock === 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Últimas ventas */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                <IconReceipt />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">Últimas ventas</h3>
                                <p className="text-xs text-slate-400">Transacciones recientes</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                            {ventas.length} total
                        </span>
                    </div>
                    <div className="p-4">
                        {ventas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                                    <IconCart />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">Sin ventas registradas</p>
                                <p className="text-xs text-slate-400 mt-1">Las ventas aparecerán aquí</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ventas.slice(0, 5).map(v => (
                                    <div key={v.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${getColor(v.id)}`}>
                                                {getInitials(v.clientes?.nombre)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    {v.clientes?.nombre || 'Cliente general'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(v.fecha).toLocaleDateString('es-CO', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800">
                                                ${Number(v.total).toLocaleString()}
                                            </span>
                                            <div className="text-slate-300">
                                                <IconChevronRight />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard