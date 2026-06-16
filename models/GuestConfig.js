// ============================================
// GUEST CONFIG MODEL — Configuración Modo Invitado
// ============================================
// Almacena la lista de layout IDs que el admin
// ha desbloqueado para el modo invitado.
// Solo existe UN documento (singleton).
// ============================================

const mongoose = require('mongoose');

const guestConfigSchema = new mongoose.Schema({
    unlockedLayoutIds: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('GuestConfig', guestConfigSchema);
