const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    mac: { type: String, required: true, unique: true },
    alias: { type: String, default: '' },
    ultimoEstado: { type: String, required: true, enum: ['LIBRE', 'OCUPADO', 'DESCONECTADO'] },
    ultimaVezVisto: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);
