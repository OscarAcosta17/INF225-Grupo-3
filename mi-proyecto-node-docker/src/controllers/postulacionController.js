const PostulacionService = require('../services/postulacionService');

const crearPostulacion = async (req, res) => {
    try {
        const { estudiante_id, oferta_id, confirmarSinRequisitos } = req.body;

        const resultado = await PostulacionService.procesarPostulacion(estudiante_id, oferta_id, confirmarSinRequisitos);

        if (resultado.requiereConfirmacion) {
            return res.status(200).json(resultado);
        }

        res.status(201).json({ mensaje: 'Postulación realizada con éxito', data: resultado.data });

    } catch (error) {
        res.status(400).json({ error: 'Postulación rechazada', detalle: error.message });
    }
};

const obtenerPostulacionesPorEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const postulaciones = await PostulacionService.obtenerPostulacionesEstudiante(id);
        res.json(postulaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener postulaciones' });
    }
};

module.exports = { crearPostulacion, obtenerPostulacionesPorEstudiante };
