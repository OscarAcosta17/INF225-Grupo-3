const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('./db'); 
const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads/cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Carpeta uploads/cvs creada automáticamente en el servidor.');
}

// rutas 
const competenciasRoutes = require('./src/routes/competencias');
const authRoutes = require('./src/routes/auth'); 
const postulacionesRoutes = require('./src/routes/postulaciones');
const ofertasRoutes = require('./src/routes/ofertas');

// (configuraciones generales)
app.use(express.json());
app.use(express.static('public')); 

// EXPONER LA CARPETA DE UPLOADS PÚBLICAMENTE PARA LOS PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Definición de las apis
app.use('/api/competencias', competenciasRoutes);
app.use('/api/auth', authRoutes); // LOGIN/REGISTRO
app.use('/api/postulaciones', postulacionesRoutes);
app.use('/api/ofertas', ofertasRoutes);


app.get('/', (req, res) => {
  res.send('¡Bienvenido! Este es el levantamiento de proyecto del grupo 5, procederemos a trabajar con el sistema de practicas del DI.');
});



app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});