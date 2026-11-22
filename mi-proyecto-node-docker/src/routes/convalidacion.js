const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const {
  iniciarPracticaNueva,
  solicitarConvalidacionExperiencia,
  obtenerTramitesEstudiante,
  subirInformeFinal,
  presentarApelacion,
  listarTramitesPendientesIA,
  confirmarPracticaSupervisor,
  registrarEvaluacionSupervisor,
  resolverEncargado
} = require('../controllers/convalidacionController');

const uploadDir = path.resolve(__dirname, '../../uploads/convalidaciones');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `doc-${unique}.pdf`);
  }
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Máx 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos en formato PDF.'));
  }
});

// Rutas estudiante
router.post('/practica-nueva', iniciarPracticaNueva);
router.post('/experiencia-previa', uploadPdf.single('pdf_actividades'), solicitarConvalidacionExperiencia);
router.get('/estudiante/:estudianteId', obtenerTramitesEstudiante);
router.post('/:id/informe-final', uploadPdf.single('pdf_informe'), subirInformeFinal);
router.post('/:id/apelar', uploadPdf.single('pdf_apelacion'), presentarApelacion);

// Rutas para la ia
router.get('/pendientes', listarTramitesPendientesIA);
router.put('/:id/confirmar-supervisor', confirmarPracticaSupervisor);
router.post('/:id/evaluacion-supervisor', registrarEvaluacionSupervisor);
router.put('/:id/resolver-encargado', resolverEncargado);

module.exports = router;