import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const titulos = {
    '/dashboard': { titulo: 'Dashboard', sub: 'Resumen general del negocio', icon: '📊' },
    '/inventario': { titulo: 'Inventario', sub: 'Gestiona tus productos y stock', icon: '📦' },
    '/clientes': { titulo: 'Clientes', sub: 'Administra tu base de clientes', icon: '👥' },
    '/pos': { titulo: 'Punto de Venta', sub: 'Registra ventas rápidamente', icon: '🛒' },
}

function Header() {
    const location = useLocation()
    const info = titulos[location.pathname] || { titulo: 'Panel', sub: '', icon: '🏠' }
    const [hora, setHora] = useState(new Date())

    useEffect(() => {
        const intervalo = setInterval(() => setHora(new Date()), 1000)
        return () => clearInterval(intervalo)
    }, [])

    const fecha = hora.toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    const horaFormateada = hora.toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-0 flex items-center justify-between h-16 shadow-sm">
            {/* Título página */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
                    {info.icon}
                </div>
                <div>
                    <h1 className="text-base font-bold text-slate-800 leading-tight">{info.titulo}</h1>
                    <p className="text-xs text-slate-400">{info.sub}</p>
                </div>
            </div>

            {/* Centro — reloj */}
            <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-slate-800 tabular-nums tracking-tight">
                    {horaFormateada}
                </p>
                <p className="text-xs text-slate-400 capitalize">{fecha}</p>
            </div>

            {/* Derecha — estado y usuario */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-green-700">Sistema activo</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        A
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-700">Administrador</p>
                        <p className="text-xs text-slate-400">GestiónSoacha</p>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header