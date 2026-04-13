const mongoose = require('mongoose');

const mapLayoutSchema = new mongoose.Schema({
    version: { type: Number, default: 1 },
    puestos: [{
        id: String,
        top: String,
        left: String,
        rotacion: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('MapLayout', mapLayoutSchema);
