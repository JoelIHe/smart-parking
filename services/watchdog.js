// ============================================
// WATCHDOG — Perro Guardián del Sensor
// ============================================
// Se ejecuta cada 1 minuto para verificar si
// el sensor ESP32 sigue enviando datos.
// Si pasan más de 3 minutos sin respuesta,
// marca el estado como DESCONECTADO.
// ============================================

const Historial = require('../models/Historial');
const state = require('../state');

const TIEMPO_MAXIMO_SIN_SENSOR = 3 * 60 * 1000; // 3 minutos en milisegundos

const iniciarWatchdog = (io) => {
    setInterval(async () => {
        const ahora = Date.now();
        const macs = Object.keys(state.sensores);

        for (const mac of macs) {
            const sensorData = state.sensores[mac];
            const tiempoSinRespuesta = ahora - sensorData.ultimaVezVisto;

            if (tiempoSinRespuesta > TIEMPO_MAXIMO_SIN_SENSOR && sensorData.ultimoEstado !== "DESCONECTADO") {
                console.log(`🚨 ALARMA: Sensor [${mac}] desconectado o sin WiFi. Cambiando estado...`);
                sensorData.ultimoEstado = "DESCONECTADO";

                // Avisar app
                io.emit('cambio_estado', { mac: mac, estado: "DESCONECTADO" });

                try {
                    // Update Sensor collection as well
                    const Sensor = require('../models/Sensor');
                    await Sensor.findOneAndUpdate({ mac: mac }, { ultimoEstado: 'DESCONECTADO' });

                    // Log in Historial
                    const registroFalla = new Historial({ estado: "DESCONECTADO" });
                    await registroFalla.save();
                } catch (error) {
                    console.error(`❌ Error al guardar watchdog para [${mac}]:`, error);
                }
            }
        }
    }, 60000); // Revisión cada minuto
};

module.exports = iniciarWatchdog;
