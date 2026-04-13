const express = require('express');
const router = express.Router();
const MapLayout = require('../models/MapLayout');

// Obtener la configuración actual del mapa (Clientes y Admin)
router.get('/api/layout', async (req, res) => {
    try {
        const layout = await MapLayout.findOne().sort({ createdAt: -1 }); // Extraemos la versión más reciente
        if (!layout) {
            return res.json({ puestos: [] });
        }
        res.json(layout);
    } catch (error) {
        console.error('Error fetching layout:', error);
        res.status(500).json({ error: 'Error del servidor obteniendo layout' });
    }
});

// Guardar nueva configuración (Admin)
router.post('/api/layout', async (req, res) => {
    try {
        const { puestos } = req.body;
        
        if (!puestos || !Array.isArray(puestos)) {
            return res.status(400).json({ error: 'Formato de array de puestos inválido.' });
        }

        const newLayout = new MapLayout({
            puestos
        });
        
        await newLayout.save();
        res.json({ message: 'Layout guardado con éxito', layout: newLayout });
    } catch (error) {
        console.error('Error saving layout:', error);
        res.status(500).json({ error: 'Error del servidor al guardar layout' });
    }
});

module.exports = router;
