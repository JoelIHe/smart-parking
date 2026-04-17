const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');

// GET /api/sensores -> Retorna la chatarra (Hardware) real autoprovisionada
router.get('/api/sensores', async (req, res) => {
    try {
        const sensores = await Sensor.find().select('mac alias ultimoEstado ultimaVezVisto -_id').sort({ updatedAt: -1 });
        res.json(sensores);
    } catch (error) {
        console.error("Error obteniendo inventario de sensores:", error);
        res.status(500).json({ error: 'Error del servidor al obtener sensores' });
    }
});

// PUT /api/sensores/:mac/alias -> Renombrar sensor (alias amigable)
router.put('/api/sensores/:mac/alias', async (req, res) => {
    try {
        const mac = decodeURIComponent(req.params.mac);
        const { alias } = req.body;
        const sensor = await Sensor.findOneAndUpdate(
            { mac },
            { alias: alias || '' },
            { new: true }
        );
        if (!sensor) {
            return res.status(404).json({ error: 'Sensor no encontrado' });
        }
        res.json({ message: 'Alias actualizado', sensor });
    } catch (error) {
        console.error("Error actualizando alias:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// DELETE /api/sensores/:mac -> Eliminar sensor de la base de datos
router.delete('/api/sensores/:mac', async (req, res) => {
    try {
        const mac = decodeURIComponent(req.params.mac);
        const result = await Sensor.findOneAndDelete({ mac });
        if (!result) {
            return res.status(404).json({ error: 'Sensor no encontrado' });
        }
        res.json({ message: `Sensor ${mac} eliminado correctamente` });
    } catch (error) {
        console.error("Error eliminando sensor:", error);
        res.status(500).json({ error: 'Error del servidor al eliminar sensor' });
    }
});

module.exports = router;
