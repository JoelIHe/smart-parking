const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- CONFIGURACIÓN DE BASE DE DATOS ---
const mongoURI = "mongodb+srv://admin:Joeltupiza12@cluster0.oni6x4u.mongodb.net/SmartParking?retryWrites=true&w=majority&appName=Cluster0";

// --- NUEVO: FUNCIÓN PARA RECUPERAR MEMORIA ---
const sincronizarMemoria = async () => {
    try {
        // Buscamos el último registro en la base de datos ordenado por fecha descendente
        const ultimoRegistro = await Historial.findOne().sort({ fecha: -1 });
        if (ultimoRegistro) {
            ultimoEstado = ultimoRegistro.estado;
            console.log(`🧠 Memoria recuperada de MongoDB: ${ultimoEstado}`);
        } else {
            console.log("📝 No hay registros en BDD, iniciando en LIBRE");
        }
    } catch (err) {
        console.error("❌ Error al recuperar memoria:", err);
    }
};

mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ Conexión exitosa a MongoDB Atlas");
        sincronizarMemoria(); // <--- Llamamos a la sincronización justo al conectar
    })
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// Definimos cómo se ve un registro en la base de datos
const HistorialSchema = new mongoose.Schema({
    estado: String,
    fecha: { type: Date, default: Date.now }
});
const Historial = mongoose.model('Historial', HistorialSchema);

// --- LA MEMORIA VOLÁTIL ---
let ultimoEstado = "LIBRE"; 

// 1. GET: El Front (Vue) lo usa al cargar o refrescar
app.get('/api/estado', (req, res) => {
    res.json({ estado: ultimoEstado });
});

// 2. POST: El ESP32 envía los datos aquí
app.post('/api/estado', async (req, res) => {
    const { estado } = req.body; 
    
    ultimoEstado = estado; 
    console.log(`📡 Sensor reporta: ${estado}`);

    try {
        const nuevoRegistro = new Historial({ estado });
        await nuevoRegistro.save();
        console.log("💾 Historial actualizado en MongoDB");

        io.emit('cambio_estado', estado);

        res.status(200).send("Recibido y guardado, jefe!");
    } catch (error) {
        console.error("❌ Error al guardar en BDD:", error);
        res.status(500).send("Error interno al procesar el dato");
    }
});

const PORT = process.env.PORT || 10000; 
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con BDD listo en el puerto ${PORT}`);
});