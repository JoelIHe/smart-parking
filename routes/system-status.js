// ============================================
// SYSTEM STATUS ROUTES — Estado del Sistema
// ============================================
// GET  /api/system-status  → Obtener estado actual
// POST /api/system-status  → Cambiar estado
// ============================================

const express = require('express');
const router = express.Router();
const SystemStatus = require('../models/SystemStatus');

// Obtener estado actual del sistema
router.get('/api/system-status', async (req, res) => {
    try {
        let status = await SystemStatus.findOne();
        if (!status) {
            status = { status: 'live', message: '' };
        }
        res.json(status);
    } catch (error) {
        console.error('Error fetching system status:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Cambiar estado del sistema
router.post('/api/system-status', async (req, res) => {
    try {
        const { status, message } = req.body;

        if (!['live', 'maintenance', 'error'].includes(status)) {
            return res.status(400).json({ error: 'Estado inválido. Usa: live, maintenance, error' });
        }

        let doc = await SystemStatus.findOne();
        if (doc) {
            doc.status = status;
            doc.message = message || '';
            await doc.save();
        } else {
            doc = new SystemStatus({ status, message: message || '' });
            await doc.save();
        }

        // Emitir por Socket.IO para actualización en tiempo real
        const io = req.app.get('io');
        if (io) {
            io.emit('systemStatus', { status: doc.status, message: doc.message });
        }

        res.json({ message: 'Estado actualizado', systemStatus: doc });
    } catch (error) {
        console.error('Error saving system status:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;
