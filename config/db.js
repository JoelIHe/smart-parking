// ============================================
// DB.JS — Conexión a MongoDB Atlas
// ============================================
// Conecta a la base de datos y recupera el
// último estado guardado (sincronización de memoria).
// ============================================

const mongoose = require('mongoose');
const Historial = require('../models/Historial');
const state = require('../state');

const mongoURI = "mongodb+srv://admin:Joeltupiza12@cluster0.oni6x4u.mongodb.net/SmartParking?retryWrites=true&w=majority&appName=Cluster0";

// --- FUNCIÓN PARA RECUPERAR MEMORIA ---
const sincronizarMemoria = async () => {
    try {
        const ultimoRegistro = await Historial.findOne().sort({ fecha: -1 });
        if (ultimoRegistro) {
            state.ultimoEstado = ultimoRegistro.estado;
            console.log(`🧠 Memoria recuperada de MongoDB: ${state.ultimoEstado}`);
        } else {
            console.log("📝 No hay registros en BDD, iniciando en LIBRE");
        }
    } catch (err) {
        console.error("❌ Error al recuperar memoria:", err);
    }
};

const conectarDB = () => {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log("✅ Conexión exitosa a MongoDB Atlas");
            sincronizarMemoria();
        })
        .catch(err => console.error("❌ Error conectando a MongoDB:", err));
};

module.exports = conectarDB;
