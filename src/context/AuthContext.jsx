import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

// Usuario demo que no requiere cuenta en Supabase
const USUARIO_DEMO = { id: 'demo', nombre: 'Administrador', email: 'admin@gestion.com', rol: 'admin' }

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        // Revisar si hay sesión activa (demo o Supabase)
        const demo = localStorage.getItem('demo_session')
        if (demo) {
            setUsuario(USUARIO_DEMO)
            setCargando(false)
            return
        }

        // Sesión de Supabase Auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUsuario({
                    id: session.user.id,
                    email: session.user.email,
                    nombre: session.user.user_metadata?.nombre || session.user.email,
                    rol: session.user.user_metadata?.rol || 'usuario',
                })
            }
            setCargando(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUsuario({
                    id: session.user.id,
                    email: session.user.email,
                    nombre: session.user.user_metadata?.nombre || session.user.email,
                    rol: session.user.user_metadata?.rol || 'usuario',
                })
            } else if (!localStorage.getItem('demo_session')) {
                setUsuario(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        // Login demo — sin base de datos
        if (email === 'admin@gestion.com' && password === 'password') {
            localStorage.setItem('demo_session', '1')
            setUsuario(USUARIO_DEMO)
            return { usuario: USUARIO_DEMO }
        }

        // Login real con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const logout = async () => {
        localStorage.removeItem('demo_session')
        await supabase.auth.signOut()
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
