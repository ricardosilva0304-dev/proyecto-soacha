const express = require('express')
const router = express.Router()
const supabase = require('../db')

// GET - Listar clientes
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
})

// POST - Crear cliente
router.post('/', async (req, res) => {
    const { nombre, telefono, email, direccion } = req.body
    const { data, error } = await supabase
        .from('clientes')
        .insert([{ nombre, telefono, email, direccion }])
        .select()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json(data[0])
})

// PUT - Actualizar cliente
router.put('/:id', async (req, res) => {
    const { nombre, telefono, email, direccion } = req.body
    const { data, error } = await supabase
        .from('clientes')
        .update({ nombre, telefono, email, direccion })
        .eq('id', req.params.id)
        .select()
    if (error) return res.status(500).json({ error: error.message })
    res.json(data[0])
})

// DELETE - Eliminar cliente
router.delete('/:id', async (req, res) => {
    const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', req.params.id)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ mensaje: 'Cliente eliminado correctamente' })
})

module.exports = router