import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)

    const mapSession = (session) => {
        if (!session?.user) return null
        return {
            id: session.user.id,
            email: session.user.email,
            nombre: session.user.user_metadata?.nombre || session.user.email,
            rol: session.user.user_metadata?.rol || 'admin',
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUsuario(mapSession(session))
            setCargando(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUsuario(mapSession(session))
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const registro = async (email, password, nombre) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nombre } },
        })
        if (error) throw error
        return data
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, registro, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)