const express = require('express')
const cors = require('cors')
require('dotenv').config()

const productosRouter = require('./routes/productos')
const clientesRouter = require('./routes/clientes')
const ventasRouter = require('./routes/ventas')

const app = express()
const PORT = process.env.PORT || 3001

// CORS actualizado
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://proyecto-soacha.vercel.app',
        /\.vercel\.app$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/productos', productosRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/ventas', ventasRouter)

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Proyecto Soacha funcionando ✅' })
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})