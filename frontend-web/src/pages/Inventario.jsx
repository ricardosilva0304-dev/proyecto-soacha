import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const IconPlus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)
const IconEdit = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
)
const IconTrash = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)
const IconSearch = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)
const IconBox = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
)
const IconX = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const IconFilter = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
)

function StatMini({ label, valor, color }) {
    return (
        <div className={`rounded-xl px-4 py-3 border ${color}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-xl font-bold mt-0.5">{valor}</p>
        </div>
    )
}

function Inventario() {
    const [productos, setProductos] = useState([])
    const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
    const [editando, setEditando] = useState(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [mostrarForm, setMostrarForm] = useState(false)

    useEffect(() => { cargarProductos() }, [])

    const cargarProductos = async () => {
        const { data } = await axios.get(`${API}/productos`)
        setProductos(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (editando) {
                await axios.put(`${API}/productos/${editando}`, form)
            } else {
                await axios.post(`${API}/productos`, form)
            }
            setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
            setEditando(null)
            setMostrarForm(false)
            cargarProductos()
        } catch (err) {
            alert('Error al guardar producto')
        }
        setLoading(false)
    }

    const handleEditar = (p) => {
        setForm({
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio: p.precio,
            stock: p.stock,
            categoria: p.categoria || ''
        })
        setEditando(p.id)
        setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return
        await axios.delete(`${API}/productos/${id}`)
        cargarProductos()
    }

    const cancelar = () => {
        setEditando(null)
        setMostrarForm(false)
        setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '' })
    }

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
        const matchCategoria = filtroCategoria === '' || p.categoria === filtroCategoria
        return matchBusqueda && matchCategoria
    })

    const totalStock = productos.reduce((s, p) => s + p.stock, 0)
    const stockBajo = productos.filter(p => p.stock <= 10).length
    const valorInventario = productos.reduce((s, p) => s + p.precio * p.stock, 0)

    return (
        <div className="space-y-5">

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-4 gap-3">
                <StatMini label="Total productos" valor={productos.length}
                    color="bg-blue-50 border-blue-100 text-blue-800" />
                <StatMini label="Unidades en stock" valor={totalStock.toLocaleString()}
                    color="bg-slate-50 border-slate-200 text-slate-800" />
                <StatMini label="Stock bajo" valor={stockBajo}
                    color={stockBajo > 0 ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"} />
                <StatMini label="Valor inventario" valor={`$${valorInventario.toLocaleString()}`}
                    color="bg-emerald-50 border-emerald-100 text-emerald-800" />
            </div>

            {/* Barra de acciones */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {/* Buscador */}
                    <div className="relative flex-1 max-w-xs">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <IconSearch />
                        </div>
                        <input
                            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                            placeholder="Buscar por nombre o categoría..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    {/* Filtro categoría */}
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                        <IconFilter />
                        <select
                            className="text-sm bg-transparent focus:outline-none text-slate-600"
                            value={filtroCategoria}
                            onChange={e => setFiltroCategoria(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Botón nuevo */}
                <button
                    onClick={() => { cancelar(); setMostrarForm(true) }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm shadow-blue-200"
                >
                    <IconPlus />
                    Nuevo Producto
                </button>
            </div>

            {/* Formulario colapsable */}
            {mostrarForm && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <IconBox />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">
                                    {editando ? 'Editar producto' : 'Registrar nuevo producto'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {editando ? 'Modifica los campos y guarda los cambios' : 'Completa la información del producto'}
                                </p>
                            </div>
                        </div>
                        <button onClick={cancelar} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <IconX />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre *</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Ej: Cuaderno 100 hojas"
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoría</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Ej: Papelería"
                                    value={form.categoria}
                                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Descripción</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Descripción breve"
                                    value={form.descripcion}
                                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                                    <input
                                        className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                        placeholder="0"
                                        type="number"
                                        value={form.precio}
                                        onChange={e => setForm({ ...form, precio: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock inicial *</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="0"
                                    type="number"
                                    value={form.stock}
                                    onChange={e => setForm({ ...form, stock: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar producto'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelar}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Listado de productos</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Mostrando {productosFiltrados.length} de {productos.length} productos
                        </p>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {productosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                                    No se encontraron productos
                                </td>
                            </tr>
                        ) : (
                            productosFiltrados.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800 text-sm">{p.nombre}</p>
                                        {p.descripcion && (
                                            <p className="text-xs text-slate-400 mt-0.5">{p.descripcion}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                            {p.categoria || 'Sin categoría'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-800 text-sm">
                                            ${Number(p.precio).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-700 text-sm">
                                            {p.stock} <span className="text-slate-400 font-normal">uds</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.stock === 0 ? (
                                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-100">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                Sin stock
                                            </span>
                                        ) : p.stock <= 10 ? (
                                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-100">
                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                Stock bajo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-green-100">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                Disponible
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditar(p)}
                                                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-xs font-semibold transition-colors"
                                            >
                                                <IconEdit />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(p.id)}
                                                className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors"
                                            >
                                                <IconTrash />
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Inventario