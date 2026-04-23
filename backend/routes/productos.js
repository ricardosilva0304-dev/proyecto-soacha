const express = require('express')
const router = express.Router()
const supabase = require('../db')

// GET - Listar todos los productos
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
})

// GET - Obtener un producto
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', req.params.id)
        .single()
    if (error) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(data)
})

// POST - Crear producto
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body
    const { data, error } = await supabase
        .from('productos')
        .insert([{ nombre, descripcion, precio, stock, categoria }])
        .select()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json(data[0])
})

// PUT - Actualizar producto
router.put('/:id', async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body
    const { data, error } = await supabase
        .from('productos')
        .update({ nombre, descripcion, precio, stock, categoria })
        .eq('id', req.params.id)
        .select()
    if (error) return res.status(500).json({ error: error.message })
    res.json(data[0])
})

// DELETE - Eliminar producto
router.delete('/:id', async (req, res) => {
    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', req.params.id)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ mensaje: 'Producto eliminado correctamente' })
})

module.exports = router