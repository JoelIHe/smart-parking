// ============================================
// SERVER.JS — Punto de entrada principal
// ============================================
// Orquesta todos los módulos del backend:
// - Express + Socket.io
// - Conexión a MongoDB
// - Rutas de la API
// - Watchdog del sensor
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const conectarDB = require('./config/db');
const estadoRoutes = require('./routes/estado');
const usuariosRoutes = require('./routes/usuarios');
const layoutRoutes = require('./routes/layout');
const sensoresRoutes = require('./routes/sensores');
const guestConfigRoutes = require('./routes/guest-config');
const systemStatusRoutes = require('./routes/system-status');
const iniciarWatchdog = require('./services/watchdog');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Hacer io accesible desde las rutas via req.app.get('io')
app.set('io', io);

// --- CONEXIÓN A BASE DE DATOS ---
conectarDB();

// --- RUTAS DE LA API ---
app.use(estadoRoutes);
app.use(usuariosRoutes);
app.use(layoutRoutes);
app.use(sensoresRoutes);
app.use(guestConfigRoutes);
app.use(systemStatusRoutes);

// --- WATCHDOG DEL SENSOR ---
iniciarWatchdog(io);

// --- KEEP-ALIVE: Evitar que Render (free tier) duerma ---
// Render duerme el servidor si no hay tráfico HTTP en ~15 min.
// Esto lo auto-pingea cada 10 minutos para mantenerlo despierto,
// garantizando que el ESP32 siempre pueda conectarse.
const https = require('https');
const SELF_URL = 'https://smart-parking-9cay.onrender.com/api/estado';
setInterval(() => {
    https.get(SELF_URL, (res) => {
        console.log(`🏓 Keep-alive ping → HTTP ${res.statusCode}`);
        res.resume(); // Consume la respuesta para liberar memoria
    }).on('error', (err) => {
        console.warn(`⚠️  Keep-alive falló: ${err.message}`);
    });
}, 10 * 60 * 1000); // cada 10 minutos

// --- ARRANCAR SERVIDOR ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con BDD y Watchdog listo en el puerto ${PORT}`);
});