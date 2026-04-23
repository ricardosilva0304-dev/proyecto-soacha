import { Link, useLocation } from 'react-router-dom'

const IconDashboard = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
)

const IconBox = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
)

const IconUsers = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const IconPOS = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
)

const IconChevron = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
)

const IconStore = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
)

const menu = [
    { path: '/dashboard', label: 'Dashboard', Icon: IconDashboard, desc: 'Resumen general' },
    { path: '/inventario', label: 'Inventario', Icon: IconBox, desc: 'Productos y stock' },
    { path: '/clientes', label: 'Clientes', Icon: IconUsers, desc: 'Base de clientes' },
    { path: '/pos', label: 'Punto de Venta', Icon: IconPOS, desc: 'Registrar ventas' },
]

function Sidebar() {
    const location = useLocation()

    return (
        <aside className="w-64 bg-gray-950 flex flex-col">

            {/* Logo */}
            <div className="px-5 py-5 border-b border-gray-800/60">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm tracking-tight">GestiónSoacha</p>
                        <p className="text-xs text-gray-500">v1.0 — Panel administrativo</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
                    Navegación
                </p>
                <div className="space-y-0.5">
                    {menu.map(({ path, label, Icon, desc }) => {
                        const active = location.pathname === path
                        return (
                            <Link key={path} to={path}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                        : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-100'
                                    }`}>
                                {/* Icono */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-blue-500' : 'bg-gray-800 group-hover:bg-gray-700'
                                    }`}>
                                    <Icon />
                                </div>
                                {/* Texto */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm leading-tight">{label}</p>
                                    <p className={`text-xs leading-tight truncate ${active ? 'text-blue-200' : 'text-gray-600'}`}>
                                        {desc}
                                    </p>
                                </div>
                                {/* Chevron */}
                                {active && (
                                    <div className="text-blue-300 flex-shrink-0">
                                        <IconChevron />
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Divisor */}
            <div className="mx-4 border-t border-gray-800/60" />

            {/* Info negocio */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-3 py-3 border border-gray-800/50">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                        <IconStore />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-300 truncate">Pequeños Negocios</p>
                        <p className="text-xs text-gray-600 truncate">Soacha, Cundinamarca</p>
                    </div>
                    <div className="flex-shrink-0 ml-auto">
                        <span className="w-2 h-2 bg-green-500 rounded-full block" />
                    </div>
                </div>
            </div>

        </aside>
    )
}

export default Sidebar