const express = require('express')
const router = express.Router()
const supabase = require('../db')

// GET - Listar ventas
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('ventas')
        .select(`*, clientes(nombre), detalle_ventas(*, productos(nombre))`)
        .order('fecha', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
})

// POST - Registrar venta completa
router.post('/', async (req, res) => {
    const { cliente_id, total, items } = req.body

    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{ cliente_id, total }])
        .select()
    if (ventaError) return res.status(500).json({ error: ventaError.message })

    const venta_id = venta[0].id

    // 2. Insertar detalle de venta
    const detalles = items.map(item => ({
        venta_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
    }))

    const { error: detalleError } = await supabase
        .from('detalle_ventas')
        .insert(detalles)
    if (detalleError) return res.status(500).json({ error: detalleError.message })

    // 3. Actualizar stock de cada producto
    for (const item of items) {
        const { data: producto } = await supabase
            .from('productos')
            .select('stock')
            .eq('id', item.producto_id)
            .single()

        await supabase
            .from('productos')
            .update({ stock: producto.stock - item.cantidad })
            .eq('id', item.producto_id)
    }

    res.status(201).json({ mensaje: 'Venta registrada correctamente', venta_id })
})

module.exports = router