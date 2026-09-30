const PostulacionService = require('../services/postulacionService');

const crearPostulacion = async (req, res) => {
    try {
        const { id_estudiante, id_oferta } = req.body;

        const resultado = await PostulacionService.procesarPostulacion(id_estudiante, id_oferta);

        res.status(201).json({ mensaje: 'Postulación realizada con éxito', data: resultado });

    } catch (error) {
        res.status(400).json({ error: 'Postulación rechazada', detalle: error.message });
    }
};

module.exports = { crearPostulacion };