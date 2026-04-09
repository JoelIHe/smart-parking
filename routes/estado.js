// ============================================
// ESTADO ROUTES — Rutas de la API
// ============================================
// GET  /api/estado  → El Front lo usa al cargar
// POST /api/estado  → El ESP32 envía datos aquí
// ============================================

const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const state = require('../state');

// 1. GET: El Front (Vue/React Native) lo usa al cargar o refrescar
router.get('/api/estado', (req, res) => {
    res.json({ estado: state.ultimoEstado });
});

// 2. POST: El ESP32 envía los datos aquí
router.post('/api/estado', async (req, res) => {
    const { estado } = req.body;

    state.ultimoEstado = estado;
    state.ultimaVezVisto = Date.now(); // <-- EL SENSOR RESPIRÓ, ACTUALIZAMOS LA HORA

    console.log(`📡 Sensor reporta: ${estado}`);

    try {
        const nuevoRegistro = new Historial({ estado });
        await nuevoRegistro.save();
        console.log("💾 Historial actualizado en MongoDB");

        // Emitir por Socket.io (se inyecta desde server.js)
        const io = req.app.get('io');
        io.emit('cambio_estado', estado);

        res.status(200).send("Recibido y guardado, jefe!");
    } catch (error) {
        console.error("❌ Error al guardar en BDD:", error);
        res.status(500).send("Error interno al procesar el dato");
    }
});

module.exports = router;
