const express = require('express');
const pool = require('./db'); 
const app = express();
const port = 3000;

// rutas 
const competenciasRoutes = require('./src/routes/competencias');
const authRoutes = require('./src/routes/auth'); 
const postulacionesRoutes = require('./src/routes/postulaciones');

//(configuraciones generales)
app.use(express.json());
app.use(express.static('public')); 

// 3. Definición de las apis
app.use('/api/competencias', competenciasRoutes);
app.use('/api/auth', authRoutes); //LOGIN/REGISTRO


app.get('/', (req, res) => {
  res.send('¡Bienvenido! Este es el levantamiento de proyecto del grupo 5, procederemos a trabajar con el sistema de practicas del DI.');
});



app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});