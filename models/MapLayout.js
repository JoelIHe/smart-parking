const mongoose = require('mongoose');

const mapLayoutSchema = new mongoose.Schema({
    version: { type: Number, default: 1 },
    name: { type: String, default: "Campus Principal" },
    mapImageBase64: { type: String, default: null },
    imageWidth: { type: Number, default: 3300 },
    imageHeight: { type: Number, default: 2550 },
    puestos: [{
        id: String,
        top: String,
        left: String,
        width: String,
        height: String,
        rotacion: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('MapLayout', mapLayoutSchema);
