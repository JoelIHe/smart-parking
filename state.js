// ============================================
// STATE.JS — Memoria volátil compartida
// ============================================
// Este módulo centraliza las variables de estado
// que se comparten entre rutas y watchdog.
// En Node.js los módulos son singletons, así que
// todos los archivos que importen este módulo
// acceden al MISMO objeto en memoria.
// ============================================

const state = {
    ultimoEstado: "LIBRE",
    ultimaVezVisto: Date.now()
};

module.exports = state;
