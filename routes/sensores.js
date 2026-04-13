const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');

// GET /api/sensores -> Retorna la chatarra (Hardware) real autoprovisionada
router.get('/api/sensores', async (req, res) => {
    try {
        const sensores = await Sensor.find().select('mac ultimoEstado ultimaVezVisto -_id').sort({ updatedAt: -1 });
        res.json(sensores);
    } catch (error) {
        console.error("Error obteniendo inventario de sensores:", error);
        res.status(500).json({ error: 'Error del servidor al obtener sensores' });
    }
});

module.exports = router;
