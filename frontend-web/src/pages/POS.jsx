import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const IconPlus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)
const IconMinus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
)
const IconTrash = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)
const IconSearch = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)
const IconCart = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
)
const IconCheck = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
)
const IconUser = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
)
const IconTag = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 9V4a1 1 0 011-1z" />
    </svg>
)

function POS() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [carrito, setCarrito] = useState([])
    const [clienteId, setClienteId] = useState('')
    const [loading, setLoading] = useState(false)
    const [ventaExitosa, setVentaExitosa] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [categoriaActiva, setCategoriaActiva] = useState('Todas')

    useEffect(() => {
        axios.get(`${API}/productos`).then(r => setProductos(r.data))
        axios.get(`${API}/clientes`).then(r => setClientes(r.data))
    }, [])

    const categorias = ['Todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))]

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const matchCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva
        return matchBusqueda && matchCategoria
    })

    const agregarAlCarrito = (producto) => {
        if (producto.stock === 0) return
        const existe = carrito.find(i => i.producto_id === producto.id)
        if (existe) {
            if (existe.cantidad >= producto.stock) return
            setCarrito(carrito.map(i => i.producto_id === producto.id
                ? { ...i, cantidad: i.cantidad + 1 } : i))
        } else {
            setCarrito([...carrito, {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: Number(producto.precio),
                cantidad: 1,
                stock: producto.stock,
                categoria: producto.categoria
            }])
        }
    }

    const cambiarCantidad = (producto_id, delta) => {
        setCarrito(carrito.map(i => {
            if (i.producto_id !== producto_id) return i
            const nueva = i.cantidad + delta
            if (nueva <= 0) return null
            if (nueva > i.stock) return i
            return { ...i, cantidad: nueva }
        }).filter(Boolean))
    }

    const quitarDelCarrito = (producto_id) => {
        setCarrito(carrito.filter(i => i.producto_id !== producto_id))
    }

    const limpiarCarrito = () => setCarrito([])

    const total = carrito.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0)
    const totalItems = carrito.reduce((sum, i) => sum + i.cantidad, 0)

    const handleVenta = async () => {
        if (carrito.length === 0) return
        setLoading(true)
        try {
            await axios.post(`${API}/ventas`, {
                cliente_id: clienteId || null,
                total,
                items: carrito
            })
            setCarrito([])
            setClienteId('')
            setVentaExitosa(true)
            setTimeout(() => setVentaExitosa(false), 4000)
            const { data } = await axios.get(`${API}/productos`)
            setProductos(data)
        } catch (err) {
            alert('Error al registrar venta')
        }
        setLoading(false)
    }

    return (
        <div className="flex gap-5 h-full">

            {/* Panel izquierdo — Productos */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Buscador y filtros */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <IconSearch />
                            </div>
                            <input
                                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                                placeholder="Buscar producto..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <IconCart />
                            <span className="font-semibold text-slate-600">{productosFiltrados.length} productos</span>
                        </div>
                    </div>
                    {/* Filtro categorías */}
                    <div className="flex gap-2 flex-wrap">
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaActiva(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${categoriaActiva === cat
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de productos */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                        {productosFiltrados.map(p => {
                            const enCarrito = carrito.find(i => i.producto_id === p.id)
                            const agotado = p.stock === 0
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => agregarAlCarrito(p)}
                                    disabled={agotado}
                                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${agotado
                                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                                            : enCarrito
                                                ? 'border-blue-400 bg-blue-50 shadow-sm shadow-blue-100'
                                                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm'
                                        }`}
                                >
                                    {/* Badge en carrito */}
                                    {enCarrito && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{enCarrito.cantidad}</span>
                                        </div>
                                    )}
                                    {/* Categoría */}
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="text-slate-400">
                                            <IconTag />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">{p.categoria || 'General'}</span>
                                    </div>
                                    {/* Nombre */}
                                    <p className="font-semibold text-slate-800 text-sm leading-tight mb-1">{p.nombre}</p>
                                    {/* Precio */}
                                    <p className="text-blue-600 font-bold text-base">${Number(p.precio).toLocaleString()}</p>
                                    {/* Stock */}
                                    <div className="mt-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${agotado
                                                ? 'bg-red-100 text-red-600'
                                                : p.stock <= 10
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                            {agotado ? 'Sin stock' : `${p.stock} uds`}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Panel derecho — Carrito */}
            <div className="w-80 flex flex-col gap-3 flex-shrink-0">

                {/* Éxito */}
                {ventaExitosa && (
                    <div className="bg-green-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                            <IconCheck />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Venta registrada</p>
                            <p className="text-green-200 text-xs">Transacción completada</p>
                        </div>
                    </div>
                )}

                {/* Header carrito */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <IconCart />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Carrito</h3>
                                <p className="text-xs text-slate-400">{totalItems} artículo{totalItems !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        {carrito.length > 0 && (
                            <button
                                onClick={limpiarCarrito}
                                className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    {/* Selector cliente */}
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                        <div className="text-slate-400">
                            <IconUser />
                        </div>
                        <select
                            className="flex-1 text-sm bg-transparent focus:outline-none text-slate-600"
                            value={clienteId}
                            onChange={e => setClienteId(e.target.value)}
                        >
                            <option value="">Cliente general</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Items del carrito */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1">
                    {carrito.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                                <IconCart />
                            </div>
                            <p className="text-sm font-semibold text-slate-400">Carrito vacío</p>
                            <p className="text-xs text-slate-300 mt-1">Selecciona productos del catálogo</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {carrito.map(item => (
                                <div key={item.producto_id} className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{item.nombre}</p>
                                            <p className="text-xs text-slate-400">${Number(item.precio_unitario).toLocaleString()} c/u</p>
                                        </div>
                                        <button
                                            onClick={() => quitarDelCarrito(item.producto_id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                                        >
                                            <IconTrash />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* Controles cantidad */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => cambiarCantidad(item.producto_id, -1)}
                                                className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
                                            >
                                                <IconMinus />
                                            </button>
                                            <span className="text-sm font-bold text-slate-800 w-5 text-center">{item.cantidad}</span>
                                            <button
                                                onClick={() => cambiarCantidad(item.producto_id, 1)}
                                                className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
                                            >
                                                <IconPlus />
                                            </button>
                                        </div>
                                        {/* Subtotal */}
                                        <span className="font-bold text-slate-800 text-sm">
                                            ${(item.cantidad * item.precio_unitario).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total y botón */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal ({totalItems} items)</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="font-bold text-slate-800">Total</span>
                            <span className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleVenta}
                        disabled={loading || carrito.length === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <IconCheck />
                                Registrar Venta
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default POS