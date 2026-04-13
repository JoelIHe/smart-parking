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
const iniciarWatchdog = require('./services/watchdog');

const app = express();
app.use(cors());
app.use(express.json());

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

// --- WATCHDOG DEL SENSOR ---
iniciarWatchdog(io);

// --- ARRANCAR SERVIDOR ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor con BDD y Watchdog listo en el puerto ${PORT}`);
});