const PostulacionService = require('../services/postulacionService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadCv = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            const directory = path.resolve(__dirname, '../../uploads/postulaciones');
            fs.mkdirSync(directory, { recursive: true });
            callback(null, directory);
        },
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `cv-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
            return callback(new Error('Solo se permiten archivos PDF'));
        }
        return callback(null, true);
    }
}).single('cv_file');

const crearPostulacion = async (req, res) => {
    uploadCv(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(400).json({ error: uploadError.message });
        }

        const uploadedPath = req.file ? `/uploads/postulaciones/${req.file.filename}` : null;
        const removeUploadedFile = async () => {
            if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
        };

        try {
            const { estudiante_id, oferta_id, confirmarSinRequisitos, telefono, correo } = req.body;
            const resultado = await PostulacionService.procesarPostulacion(
                estudiante_id, oferta_id, confirmarSinRequisitos === 'true', telefono, correo, uploadedPath
            );

            if (resultado.requiereConfirmacion) {
                await removeUploadedFile();
                return res.status(200).json(resultado);
            }

            return res.status(201).json({ mensaje: 'Postulación realizada con éxito', data: resultado.data });
        } catch (error) {
            await removeUploadedFile();
            return res.status(400).json({ error: 'Postulación rechazada', detalle: error.message });
        }
    });
};

const obtenerPostulacionesPorOferta = async (req, res) => {
    try {
        const { ofertaId, empresaId } = req.params;
        const postulaciones = await PostulacionService.obtenerPostulacionesPorOferta(ofertaId, empresaId);
        if (postulaciones === null) {
            return res.status(404).json({ error: 'Oferta no encontrada para esta empresa' });
        }
        return res.json(postulaciones);
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener postulantes' });
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

module.exports = { crearPostulacion, obtenerPostulacionesPorEstudiante, obtenerPostulacionesPorOferta };
