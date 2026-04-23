import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

const IconUserPlus = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
)
const IconEdit = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
const IconX = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const IconPhone = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
)
const IconMail = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
)
const IconLocation = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)
const IconUser = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
)

function getInitials(nombre) {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function getColor(id) {
    const colors = [
        'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
        'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500'
    ]
    return colors[id % colors.length]
}

function StatMini({ label, valor, color }) {
    return (
        <div className={`rounded-xl px-4 py-3 border ${color}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="text-xl font-bold mt-0.5">{valor}</p>
        </div>
    )
}

function Clientes() {
    const [clientes, setClientes] = useState([])
    const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' })
    const [editando, setEditando] = useState(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [mostrarForm, setMostrarForm] = useState(false)

    useEffect(() => { cargarClientes() }, [])

    const cargarClientes = async () => {
        const { data } = await axios.get(`${API}/clientes`)
        setClientes(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (editando) {
                await axios.put(`${API}/clientes/${editando}`, form)
            } else {
                await axios.post(`${API}/clientes`, form)
            }
            setForm({ nombre: '', telefono: '', email: '', direccion: '' })
            setEditando(null)
            setMostrarForm(false)
            cargarClientes()
        } catch (err) {
            alert('Error al guardar cliente')
        }
        setLoading(false)
    }

    const handleEditar = (c) => {
        setForm({ nombre: c.nombre, telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' })
        setEditando(c.id)
        setMostrarForm(true)
    }

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return
        await axios.delete(`${API}/clientes/${id}`)
        cargarClientes()
    }

    const cancelar = () => {
        setEditando(null)
        setMostrarForm(false)
        setForm({ nombre: '', telefono: '', email: '', direccion: '' })
    }

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        (c.telefono && c.telefono.includes(busqueda))
    )

    const conEmail = clientes.filter(c => c.email).length
    const conTelefono = clientes.filter(c => c.telefono).length

    return (
        <div className="space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <StatMini label="Total clientes" valor={clientes.length}
                    color="bg-blue-50 border-blue-100 text-blue-800" />
                <StatMini label="Con email" valor={conEmail}
                    color="bg-slate-50 border-slate-200 text-slate-800" />
                <StatMini label="Con teléfono" valor={conTelefono}
                    color="bg-emerald-50 border-emerald-100 text-emerald-800" />
            </div>

            {/* Barra de acciones */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xs">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <IconSearch />
                    </div>
                    <input
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => { cancelar(); setMostrarForm(true) }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm shadow-blue-200"
                >
                    <IconUserPlus />
                    Nuevo Cliente
                </button>
            </div>

            {/* Formulario colapsable */}
            {mostrarForm && (
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <IconUser />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm">
                                    {editando ? 'Editar cliente' : 'Registrar nuevo cliente'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {editando ? 'Modifica los datos y guarda los cambios' : 'Completa la información del cliente'}
                                </p>
                            </div>
                        </div>
                        <button onClick={cancelar} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <IconX />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre completo *</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Ej: Carlos Pérez"
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Teléfono</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Ej: 3001234567"
                                    value={form.telefono}
                                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Correo electrónico</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="correo@ejemplo.com"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dirección</label>
                                <input
                                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="Ej: Calle 13 # 5-20, Soacha"
                                    value={form.direccion}
                                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar cliente'}
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
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800 text-sm">Listado de clientes</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Mostrando {clientesFiltrados.length} de {clientes.length} clientes
                    </p>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Correo</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dirección</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {clientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                                    No se encontraron clientes
                                </td>
                            </tr>
                        ) : (
                            clientesFiltrados.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                                    {/* Cliente con avatar */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${getColor(c.id)} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                {getInitials(c.nombre)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{c.nombre}</p>
                                                <p className="text-xs text-slate-400">ID #{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Teléfono */}
                                    <td className="px-6 py-4">
                                        {c.telefono ? (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <IconPhone />
                                                <span className="text-sm">{c.telefono}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-sm">—</span>
                                        )}
                                    </td>
                                    {/* Email */}
                                    <td className="px-6 py-4">
                                        {c.email ? (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <IconMail />
                                                <span className="text-sm">{c.email}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-sm">—</span>
                                        )}
                                    </td>
                                    {/* Dirección */}
                                    <td className="px-6 py-4">
                                        {c.direccion ? (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <IconLocation />
                                                <span className="text-sm truncate max-w-xs">{c.direccion}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-sm">—</span>
                                        )}
                                    </td>
                                    {/* Acciones */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditar(c)}
                                                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-xs font-semibold transition-colors"
                                            >
                                                <IconEdit />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(c.id)}
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

export default Clientes