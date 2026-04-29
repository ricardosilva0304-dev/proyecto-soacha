import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const titulos = {
    '/dashboard': { titulo: 'Dashboard', sub: 'Resumen general del negocio', Icon: IconDashboard },
    '/inventario': { titulo: 'Inventario', sub: 'Gestiona tus productos y stock', Icon: IconBox },
    '/clientes': { titulo: 'Clientes', sub: 'Administra tu base de clientes', Icon: IconUsers },
    '/pos': { titulo: 'Punto de Venta', sub: 'Registra ventas rápidamente', Icon: IconPOS },
}

function IconDashboard() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    )
}
function IconBox() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    )
}
function IconUsers() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}
function IconPOS() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )
}
function IconBell() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    )
}
function IconChevron() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    )
}

function Header() {
    const location = useLocation()
    const info = titulos[location.pathname]
    const [hora, setHora] = useState(new Date())
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const intervalo = setInterval(() => setHora(new Date()), 1000)
        return () => clearInterval(intervalo)
    }, [])

    const horaFormateada = hora.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })

    const fecha = hora.toLocaleDateString('es-CO', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

    return (
        <header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between h-16 shadow-sm flex-shrink-0">

            {/* Izquierda — Título con breadcrumb */}
            <div className="flex items-center gap-3">
                {info && (
                    <>
                        <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <info.Icon />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">GestiónSoacha</span>
                            <span className="text-slate-300">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                            <span className="text-sm font-bold text-slate-800">{info.titulo}</span>
                            <span className="hidden md:block text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                                {info.sub}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Centro — Reloj */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-slate-800 tabular-nums tracking-tight">
                        {horaFormateada.split(' ')[0]}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                        {horaFormateada.split(' ')[1]}
                    </span>
                </div>
                <p className="text-xs text-slate-400 capitalize leading-tight">
                    {capitalize(fecha)}
                </p>
            </div>

            {/* Derecha — Acciones y usuario */}
            <div className="flex items-center gap-2">

                {/* Estado sistema */}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">En línea</span>
                </div>

                {/* Notificaciones */}
                <button className="relative w-8 h-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <IconBell />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border border-white" />
                </button>

                {/* Divisor */}
                <div className="w-px h-6 bg-slate-200" />

                {/* Usuario */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-colors px-3 py-1.5 rounded-xl group"
                >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {usuario?.nombre?.[0] || 'A'}
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-red-600 transition-colors">
                            {usuario?.nombre || 'Administrador'}
                        </p>
                        <p className="text-xs text-slate-400 leading-tight">Cerrar sesión</p>
                    </div>
                </button>

            </div>
        </header>
    )
}

export default Header