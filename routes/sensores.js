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
// Eliminar un sensor físico (Mantenimiento)
router.delete('/api/sensor/:mac', async (req, res) => {
    try {
        const deleted = await Sensor.findOneAndDelete({ mac: req.params.mac });
        if (!deleted) {
            return res.status(404).json({ error: 'Sensor no encontrado' });
        }
        res.json({ message: 'Sensor eliminado correctamente' });
    } catch (error) {
        console.error("Error eliminando sensor:", error);
        res.status(500).json({ error: 'Error interno eliminando sensor' });
    }
});

module.exports = router;
