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

// --- LA MEMORIA VOLÁTIL Y EL WATCHDOG ---
let ultimoEstado = "LIBRE"; 
let ultimaVezVisto = Date.now(); // <-- Guardamos la hora exacta en que el servidor inicia
const TIEMPO_MAXIMO_SIN_SENSOR = 3 * 60 * 1000; // 3 minutos en milisegundos

// --- FUNCIÓN PARA RECUPERAR MEMORIA ---
const sincronizarMemoria = async () => {
    try {
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
        sincronizarMemoria(); 
    })
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

// Definimos cómo se ve un registro en la base de datos
const HistorialSchema = new mongoose.Schema({
    estado: String,
    fecha: { type: Date, default: Date.now }
});
const Historial = mongoose.model('Historial', HistorialSchema);


// 1. GET: El Front (Vue/React Native) lo usa al cargar o refrescar
app.get('/api/estado', (req, res) => {
    res.json({ estado: ultimoEstado });
});

// 2. POST: El ESP32 envía los datos aquí
app.post('/api/estado', async (req, res) => {
    const { estado } = req.body; 
    
    ultimoEstado = estado; 
    ultimaVezVisto = Date.now(); // <-- EL SENSOR RESPIRÓ, ACTUALIZAMOS LA HORA
    
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

// --- EL WATCHDOG (PERRO GUARDIÁN) ---
// Se ejecuta solito cada 1 minuto para revisar si el sensor sigue vivo
setInterval(async () => {
    const tiempoSinRespuesta = Date.now() - ultimaVezVisto;
    
    // Si pasaron más de 3 minutos y no estaba ya desconectado
    if (tiempoSinRespuesta > TIEMPO_MAXIMO_SIN_SENSOR && ultimoEstado !== "DESCONECTADO") {
        console.log("🚨 ALARMA: Sensor desconectado o sin WiFi. Cambiando estado...");
        ultimoEstado = "DESCONECTADO";
        
        // Avisar a todas las apps conectadas (Vue y React Native)
        io.emit('cambio_estado', ultimoEstado);
        
        // Guardar la falla en MongoDB para tener el registro de a qué hora se fue el internet
        try {
            const registroFalla = new Historial({ estado: ultimoEstado });
            await registroFalla.save();
            console.log("💾 Registro de desconexión guardado en la base de datos");
        } catch (error) {
            console.error("❌ Error al guardar el estado de desconexión:", error);
        }
    }
}, 60000); // 60000 ms = 1 minuto

const PORT = process.env.PORT || 10000; 
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con BDD y Watchdog listo en el puerto ${PORT}`);
});