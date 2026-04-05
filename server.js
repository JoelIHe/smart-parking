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

// --- EL PUNTO DE ENCUENTRO ---
app.post('/api/estado', (req, res) => {
    const { estado } = req.body; 
    console.log(`📡 Sensor reporta: ${estado}`);

    // Avisamos a la App de Vue en tiempo real
    io.emit('cambio_estado', estado);

    res.status(200).send("Recibido jefe!");
});

const PORT = process.env.PORT || 3000; 

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en la nube listo en el puerto ${PORT}`);
}); 