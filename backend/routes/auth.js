const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'gestion_soacha_secret_2025'

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        return res.status(400).json({ error: 'Email y contraseña requeridos' })

    const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.toLowerCase())

    if (error || !usuarios || usuarios.length === 0)
        return res.status(401).json({ error: 'Credenciales incorrectas' })

    const usuario = usuarios[0]
    const passwordValido = await bcrypt.compare(password, usuario.password)

    if (!passwordValido)
        return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
        JWT_SECRET,
        { expiresIn: '8h' }
    )

    res.json({
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        }
    })
})

// POST /api/auth/verificar
router.get('/verificar', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Token requerido' })

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        res.json({ valido: true, usuario: decoded })
    } catch {
        res.status(401).json({ error: 'Token inválido' })
    }
})

module.exports = router