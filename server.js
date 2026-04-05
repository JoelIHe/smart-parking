const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- LA MEMORIA DEL SERVIDOR ---
// Aquí guardamos el último dato que mandó el ESP32
let ultimoEstado = "LIBRE"; 

// 1. NUEVO: El Front (Vue) usará este GET al recargar la página
app.get('/api/estado', (req, res) => {
    res.json({ estado: ultimoEstado });
});

// 2. Aquí es donde el ESP32 hace el POST
app.post('/api/estado', (req, res) => {
    const { estado } = req.body; 
    
    // Guardamos el estado en la variable para que no se pierda
    ultimoEstado = estado; 
    
    console.log(`📡 Sensor reporta: ${estado}`);

    // Avisamos a la App de Vue en tiempo real por Sockets
    io.emit('cambio_estado', estado);

    res.status(200).send("Recibido jefe!");
});

// Render asigna el puerto automáticamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 10000; 

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en la nube listo en el puerto ${PORT}`);
});