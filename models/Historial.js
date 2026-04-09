// ============================================
// HISTORIAL MODEL — Schema de MongoDB
// ============================================
// Define cómo se ve un registro en la base de datos.
// Cada entrada tiene un estado y una fecha.
// ============================================

const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
    estado: String,
    fecha: { type: Date, default: Date.now }
});

const Historial = mongoose.model('Historial', HistorialSchema);

module.exports = Historial;
