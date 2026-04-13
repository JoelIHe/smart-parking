// ============================================
// STATE.JS — Memoria volátil compartida
// ============================================
// Este módulo centraliza las variables de estado
// que se comparten entre rutas y watchdog.
// En Node.js los módulos son singletons, así que
// todos los archivos que importen este módulo
// acceden al MISMO objeto en memoria.
// ============================================

// Diccionario global de sensores activos almacenados temporalmente en memoria (RAM rápida)
// Estructura:
// { "MAC_ADDRESS": { ultimoEstado: 'LIBRE', ultimaVezVisto: Date.now() } }
module.exports = {
    sensores: {}
};
