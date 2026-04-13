// ============================================
// ESTADO ROUTES — Rutas de la API
// ============================================
// GET  /api/estado  → El Front lo usa al cargar
// POST /api/estado  → El ESP32 envía datos aquí
// ============================================

const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial');
const Sensor = require('../models/Sensor');
const state = require('../state');

// 1. GET: Retorna diccionario de todos los sensores (El Front lo usa al cargar)
router.get('/api/estado', async (req, res) => {
    // Fallback: Si se reinició el backend, la memoria RAM está vacía. Rellenamos con MongoDB.
    try {
        if (Object.keys(state.sensores).length === 0) {
            const sensoresMongo = await Sensor.find();
            sensoresMongo.forEach(s => {
                state.sensores[s.mac] = { ultimoEstado: s.ultimoEstado, ultimaVezVisto: s.ultimaVezVisto };
            });
        }
        res.json({ sensores: state.sensores });
    } catch (error) {
        console.error("Error al obtener estado:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// 2. POST: El ESP32 envía los datos aquí junto con su MAC
router.post('/api/estado', async (req, res) => {
    const { mac, estado } = req.body;

    // Validación si la placa vieja (ESP32 viejo) nos manda solo {estado} sin "mac" (Compatibilidad hacia atrás)
    const macSegura = mac || "SENSOR-LEGACY";

    // 1. Actualizar memoria RAM rápida
    if (!state.sensores[macSegura]) {
        state.sensores[macSegura] = {};
    }
    state.sensores[macSegura].ultimoEstado = estado;
    state.sensores[macSegura].ultimaVezVisto = Date.now();

    console.log(`📡 Sensor [${macSegura}] reporta: ${estado}`);

    try {
        // 2. Auto-Provisionamiento: Guardar o Actualizar el Chip en MongoDB Mágicamente
        await Sensor.findOneAndUpdate(
            { mac: macSegura },
            { ultimoEstado: estado, ultimaVezVisto: new Date() },
            { upsert: true, new: true } // Upsert = Create OR Update
        );

        // 3. Guardar en Historial 
        const nuevoRegistro = new Historial({ estado }); // Por ahora mantenemos compatibilidad con el schema viejo
        await nuevoRegistro.save();

        // 4. Emitir el Cambio al Mundo via Sockets 
        const io = req.app.get('io');
        // Cambiamos el emit para que identifique QUÉ sensor cambió
        io.emit('cambio_estado', { mac: macSegura, estado: estado });

        res.status(200).send("Recibido y provisionado!");
    } catch (error) {
        console.error("❌ Error al procesar en BDD:", error);
        res.status(500).send("Error interno al procesar el dato");
    }
});

module.exports = router;
