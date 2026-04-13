const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.post('/api/usuarios/sync', async (req, res) => {
    try {
        const { uid, email } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: 'UID y email son requeridos' });
        }

        // Buscar si el usuario ya existe
        let usuario = await Usuario.findOne({ uid });

        if (!usuario) {
            // Por regla de negocio, asignamos 'admin' al usuario de jatupizar, o cliente al resto.
            const rolAsignado = (email === 'jatupizar@puce.edu.ec') ? 'admin' : 'cliente';
            
            usuario = new Usuario({
                uid,
                email,
                role: rolAsignado
            });
            await usuario.save();
        } else {
            // Opcional: asegurarnos de que el admin mantenga sus poderes aunque ya exista
            if (email === 'jatupizar@puce.edu.ec' && usuario.role !== 'admin') {
                usuario.role = 'admin';
                await usuario.save();
            }
        }

        res.json({ message: 'Usuario sincronizado', role: usuario.role });
    } catch (error) {
        console.error('Error sincronizando usuario:', error);
        res.status(500).json({ error: 'Error del servidor al sincronizar usuario' });
    }
});

module.exports = router;
