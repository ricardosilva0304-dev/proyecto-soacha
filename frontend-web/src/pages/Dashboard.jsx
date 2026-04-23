import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function StatCard({ titulo, valor, icon, color, sub }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{titulo}</p>
                <p className="text-2xl font-bold text-slate-800">{valor}</p>
                {sub && <p className="text-xs text-slate-400">{sub}</p>}
            </div>
        </div>
    )
}

function Dashboard() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [ventas, setVentas] = useState([])

    useEffect(() => {
        axios.get(`${API}/productos`).then(r => setProductos(r.data))
        axios.get(`${API}/clientes`).then(r => setClientes(r.data))
        axios.get(`${API}/ventas`).then(r => setVentas(r.data))
    }, [])

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0)
    const stockBajo = productos.filter(p => p.stock <= 10).length

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard titulo="Total Productos" valor={productos.length}
                    icon="📦" color="bg-blue-50" sub="En inventario" />
                <StatCard titulo="Clientes" valor={clientes.length}
                    icon="👥" color="bg-green-50" sub="Registrados" />
                <StatCard titulo="Ventas" valor={ventas.length}
                    icon="🛒" color="bg-purple-50" sub="Transacciones" />
                <StatCard titulo="Ingresos" valor={`$${totalVentas.toLocaleString()}`}
                    icon="💰" color="bg-yellow-50" sub="Total acumulado" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Productos con stock bajo */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">⚠️ Stock bajo</h3>
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {stockBajo} productos
                        </span>
                    </div>
                    <div className="space-y-2">
                        {productos.filter(p => p.stock <= 10).length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">✅ Todo el stock está bien</p>
                        ) : (
                            productos.filter(p => p.stock <= 10).map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-red-50 rounded-xl px-3 py-2">
                                    <span className="text-sm font-medium text-slate-700">{p.nombre}</span>
                                    <span className="text-red-600 font-bold text-sm">{p.stock} uds</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Últimas ventas */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="font-semibold text-slate-700 mb-4">🧾 Últimas ventas</h3>
                    <div className="space-y-2">
                        {ventas.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">No hay ventas registradas</p>
                        ) : (
                            ventas.slice(0, 5).map(v => (
                                <div key={v.id} className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">
                                            {v.clientes?.nombre || 'Cliente general'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(v.fecha).toLocaleDateString('es-CO')}
                                        </p>
                                    </div>
                                    <span className="text-blue-600 font-bold text-sm">
                                        ${Number(v.total).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard