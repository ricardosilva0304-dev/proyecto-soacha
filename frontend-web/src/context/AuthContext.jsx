import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const usuarioGuardado = localStorage.getItem('usuario')
        if (token && usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado))
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        setCargando(false)
    }, [])

    const login = async (email, password) => {
        const { data } = await axios.post(`${API}/auth/login`, { email, password })
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUsuario(data.usuario)
        return data
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        delete axios.defaults.headers.common['Authorization']
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)