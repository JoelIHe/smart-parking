// ============================================
// GUEST CONFIG ROUTES — Modo Invitado
// ============================================
// GET  /api/guest-config  → Obtener layouts desbloqueados
// POST /api/guest-config  → Guardar layouts desbloqueados
// ============================================

const express = require('express');
const router = express.Router();
const GuestConfig = require('../models/GuestConfig');

// Obtener la configuración del modo invitado
router.get('/api/guest-config', async (req, res) => {
    try {
        let config = await GuestConfig.findOne();
        if (!config) {
            config = { unlockedLayoutIds: [] };
        }
        res.json(config);
    } catch (error) {
        console.error('Error fetching guest config:', error);
        res.status(500).json({ error: 'Error del servidor obteniendo guest config' });
    }
});

// Guardar la configuración del modo invitado
router.post('/api/guest-config', async (req, res) => {
    try {
        const { unlockedLayoutIds } = req.body;

        if (!Array.isArray(unlockedLayoutIds)) {
            return res.status(400).json({ error: 'unlockedLayoutIds debe ser un array' });
        }

        // Upsert: actualizar si existe, crear si no
        let config = await GuestConfig.findOne();
        if (config) {
            config.unlockedLayoutIds = unlockedLayoutIds;
            await config.save();
        } else {
            config = new GuestConfig({ unlockedLayoutIds });
            await config.save();
        }

        res.json({ message: 'Guest config guardado', config });
    } catch (error) {
        console.error('Error saving guest config:', error);
        res.status(500).json({ error: 'Error del servidor al guardar guest config' });
    }
});

module.exports = router;
