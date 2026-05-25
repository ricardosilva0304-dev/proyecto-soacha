const express = require('express')
const cors = require('cors')
require('dotenv').config()

const productosRouter = require('./routes/productos')
const clientesRouter = require('./routes/clientes')
const ventasRouter = require('./routes/ventas')
const authRouter = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 8080

const corsOptions = {
    origin: [
        'https://proyecto-soacha.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

app.use('/api/auth', authRouter)
console.log('Ruta /api/auth registrada')
app.use('/api/productos', productosRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/ventas', ventasRouter)

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Proyecto Soacha funcionando ✅' })
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})