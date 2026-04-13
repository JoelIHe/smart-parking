const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['cliente', 'admin'], default: 'cliente' }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
