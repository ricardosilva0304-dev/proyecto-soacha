import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

function POS() {
    const [productos, setProductos] = useState([])
    const [clientes, setClientes] = useState([])
    const [carrito, setCarrito] = useState([])
    const [clienteId, setClienteId] = useState('')
    const [loading, setLoading] = useState(false)
    const [ventaExitosa, setVentaExitosa] = useState(false)

    useEffect(() => {
        axios.get(`${API}/productos`).then(r => setProductos(r.data))
        axios.get(`${API}/clientes`).then(r => setClientes(r.data))
    }, [])

    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(i => i.producto_id === producto.id)
        if (existe) {
            if (existe.cantidad >= producto.stock) return alert('Stock insuficiente')
            setCarrito(carrito.map(i => i.producto_id === producto.id
                ? { ...i, cantidad: i.cantidad + 1 } : i))
        } else {
            setCarrito([...carrito, {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio,
                cantidad: 1,
                stock: producto.stock
            }])
        }
    }

    const quitarDelCarrito = (producto_id) => {
        setCarrito(carrito.filter(i => i.producto_id !== producto_id))
    }

    const total = carrito.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0)

    const handleVenta = async () => {
        if (carrito.length === 0) return alert('El carrito está vacío')
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
            setTimeout(() => setVentaExitosa(false), 3000)
            const { data } = await axios.get(`${API}/productos`)
            setProductos(data)
        } catch (err) {
            alert('Error al registrar venta')
        }
        setLoading(false)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Punto de Venta</h2>

            {ventaExitosa && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 font-medium">
                    ✅ Venta registrada exitosamente!
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Catálogo de productos */}
                <div className="col-span-2">
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-semibold text-gray-700 mb-4">Productos disponibles</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {productos.map(p => (
                                <button key={p.id} onClick={() => agregarAlCarrito(p)}
                                    disabled={p.stock === 0}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${p.stock === 0
                                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                            : 'border-blue-200 hover:border-blue-500 hover:bg-blue-50'
                                        }`}>
                                    <p className="font-semibold text-gray-800">{p.nombre}</p>
                                    <p className="text-blue-600 font-bold">${Number(p.precio).toLocaleString()}</p>
                                    <p className={`text-sm ${p.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                                        Stock: {p.stock} uds
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Carrito */}
                <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                    <h3 className="font-semibold text-gray-700 mb-4">🧾 Carrito</h3>

                    <select className="border rounded-lg px-3 py-2 mb-4 text-gray-600"
                        value={clienteId} onChange={e => setClienteId(e.target.value)}>
                        <option value="">Cliente (opcional)</option>
                        {clientes.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>

                    <div className="flex-1 space-y-2 min-h-32">
                        {carrito.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Agrega productos al carrito</p>
                        ) : (
                            carrito.map(item => (
                                <div key={item.producto_id} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
                                    <div>
                                        <p className="font-medium text-sm">{item.nombre}</p>
                                        <p className="text-gray-500 text-xs">{item.cantidad} x ${Number(item.precio_unitario).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">${(item.cantidad * item.precio_unitario).toLocaleString()}</span>
                                        <button onClick={() => quitarDelCarrito(item.producto_id)}
                                            className="text-red-400 hover:text-red-600 font-bold">✕</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between text-xl font-bold mb-4">
                            <span>Total:</span>
                            <span className="text-blue-600">${total.toLocaleString()}</span>
                        </div>
                        <button onClick={handleVenta} disabled={loading || carrito.length === 0}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold disabled:opacity-50">
                            {loading ? 'Procesando...' : '✅ Registrar Venta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default POS