import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function IconMail() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    )
}
function IconLock() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )
}
function IconEye({ show }) {
    return show ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    )
}

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPass, setMostrarPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            setError('Correo o contraseña incorrectos')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">

            {/* Panel izquierdo — Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg">GestiónSoacha</span>
                </div>

                <div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Gestiona tu negocio de forma inteligente
                    </h1>
                    <p className="text-blue-200 text-lg leading-relaxed mb-8">
                        Control total de inventario, ventas y clientes en una sola plataforma diseñada para los pequeños negocios de Soacha.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Inventario', desc: 'Control en tiempo real' },
                            { label: 'Ventas', desc: 'Punto de venta ágil' },
                            { label: 'Clientes', desc: 'CRM integrado' },
                        ].map(item => (
                            <div key={item.label} className="bg-white/10 rounded-xl p-3 border border-white/20">
                                <p className="text-white font-semibold text-sm">{item.label}</p>
                                <p className="text-blue-200 text-xs mt-0.5">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-blue-200 text-sm">
                        Sistema activo — Corporación Universitaria Minuto de Dios
                    </p>
                </div>
            </div>

            {/* Panel derecho — Login */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-white font-bold">GestiónSoacha</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h2>
                        <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder al panel</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <IconMail />
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                                    placeholder="admin@gestion.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                                    <IconLock />
                                </div>
                                <input
                                    type={mostrarPass ? 'text' : 'password'}
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <IconEye show={mostrarPass} />
                                </button>
                            </div>
                        </div>

                        {/* Credenciales demo */}
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-slate-400 mb-1.5">Credenciales de acceso:</p>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-xs font-mono text-blue-400">admin@gestion.com</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Contraseña</p>
                                    <p className="text-xs font-mono text-blue-400">password</p>
                                </div>
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Ingresar al sistema'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 text-xs mt-8">
                        GestiónSoacha — Proyecto de Grado · UNIMINUTO 2025
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login