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
// DELETE /api/sensores/:mac -> Borrar equipo físico de la base de datos
router.delete('/api/sensores/:mac', async (req, res) => {
    try {
        const mac = req.params.mac;
        const result = await Sensor.deleteOne({ mac: mac });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Sensor no encontrado en DB' });
        }
        res.json({ success: true, message: 'Sensor eliminado de la infraestructura' });
    } catch (error) {
        console.error("Error eliminando sensor:", error);
        res.status(500).json({ error: 'Error del servidor al eliminar sensor' });
    }
});

module.exports = router;
