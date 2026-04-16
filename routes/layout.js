const express = require('express');
const router = express.Router();
const MapLayout = require('../models/MapLayout');

// Obtener TODOS los layouts (solo metadatos para listado rápido)
router.get('/api/layouts', async (req, res) => {
    try {
        const layouts = await MapLayout.find().select('_id name updatedAt');
        res.json(layouts);
    } catch (error) {
        console.error('Error fetching layouts:', error);
        res.status(500).json({ error: 'Error del servidor obteniendo layouts' });
    }
});

// Obtener UN layout específico o el más reciente por defecto
router.get('/api/layout/:id?', async (req, res) => {
    try {
        let layout;
        if (req.params.id) {
            layout = await MapLayout.findById(req.params.id);
        } else {
            layout = await MapLayout.findOne().sort({ createdAt: -1 });
        }
        
        if (!layout) {
            return res.json({ name: "Nuevo Mapa", puestos: [] });
        }
        res.json(layout);
    } catch (error) {
        console.error('Error fetching layout:', error);
        res.status(500).json({ error: 'Error del servidor obteniendo layout' });
    }
});

// Crear o Actualizar un Layout
router.post('/api/layout', async (req, res) => {
    try {
        const { _id, name, mapImageBase64, imageWidth, imageHeight, puestos } = req.body;
        
        if (!puestos || !Array.isArray(puestos)) {
            return res.status(400).json({ error: 'Formato de array de puestos inválido.' });
        }

        let layout;
        if (_id) {
            // Actualizar existente
            layout = await MapLayout.findByIdAndUpdate(
                _id, 
                { name, mapImageBase64, imageWidth, imageHeight, puestos },
                { new: true }
            );
        } else {
            // Crear nuevo
            layout = new MapLayout({
                name: name || "Nuevo Campus",
                mapImageBase64,
                imageWidth: imageWidth || 3300,
                imageHeight: imageHeight || 2550,
                puestos
            });
            await layout.save();
        }

        res.json({ message: 'Layout guardado con éxito', layout });
    } catch (error) {
        console.error('Error saving layout:', error);
        res.status(500).json({ error: 'Error del servidor al guardar layout' });
    }
});

// Eliminar un Layout
router.delete('/api/layout/:id', async (req, res) => {
    try {
        await MapLayout.findByIdAndDelete(req.params.id);
        res.json({ message: 'Layout eliminado' });
    } catch (error) {
        console.error('Error deleting layout:', error);
        res.status(500).json({ error: 'Error del servidor al eliminar layout' });
    }
});

module.exports = router;
