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
        const tiempoSinRespuesta = Date.now() - state.ultimaVezVisto;

        // Si pasaron más de 3 minutos y no estaba ya desconectado
        if (tiempoSinRespuesta > TIEMPO_MAXIMO_SIN_SENSOR && state.ultimoEstado !== "DESCONECTADO") {
            console.log("🚨 ALARMA: Sensor desconectado o sin WiFi. Cambiando estado...");
            state.ultimoEstado = "DESCONECTADO";

            // Avisar a todas las apps conectadas (Vue y React Native)
            io.emit('cambio_estado', state.ultimoEstado);

            // Guardar la falla en MongoDB para tener el registro de a qué hora se fue el internet
            try {
                const registroFalla = new Historial({ estado: state.ultimoEstado });
                await registroFalla.save();
                console.log("💾 Registro de desconexión guardado en la base de datos");
            } catch (error) {
                console.error("❌ Error al guardar el estado de desconexión:", error);
            }
        }
    }, 60000); // 60000 ms = 1 minuto
};

module.exports = iniciarWatchdog;
