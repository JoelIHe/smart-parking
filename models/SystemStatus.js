// ============================================
// SYSTEM STATUS MODEL — Estado del Sistema
// ============================================
// Almacena el estado actual: live, maintenance, error
// Solo existe UN documento (singleton).
// ============================================

const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['live', 'maintenance', 'error'],
        default: 'live',
    },
    message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SystemStatus', systemStatusSchema);
