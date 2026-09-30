const pool = require('./db'); // Importamos la conexión que ya tienen

const createTables = async () => {
  const queryText = `
    1. Tabla para el inicio de sesion
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contrasena_hash VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    2. Tabla para el perfil del estudiante
    CREATE TABLE IF NOT EXISTS estudiantes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        nombres VARCHAR(100),
        apellidos VARCHAR(100),
        perfil_configurado BOOLEAN DEFAULT FALSE
    );

    3. catalogo de competencias tecnicas
    CREATE TABLE IF NOT EXISTS competencias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        categoria VARCHAR(50)
    );

    4. Tabla intermedia (Estudiante elige sus competencias)
    CREATE TABLE IF NOT EXISTS estudiante_competencia (
        estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
        competencia_id INTEGER REFERENCES competencias(id) ON DELETE CASCADE,
        PRIMARY KEY (estudiante_id, competencia_id)
    );
  `;

  try {
    console.log("Creando tablas en PostgreSQL...");
    await pool.query(queryText);
    console.log("¡Tablas creadas con éxito!");
    
    //competencias de ejemplo
    await pool.query(`
      INSERT INTO competencias (nombre, categoria) VALUES 
      ('C++', 'Lenguaje de Programación'),
      ('Python', 'Lenguaje de Programación'),
      ('Java', 'Lenguaje de Programación'),
      ('SQL', 'Base de Datos'),
      ('Trabajo en Equipo', 'Habilidad Blanda')
      ON CONFLICT DO NOTHING;
    `);
    console.log("Competencias de prueba cargadas.");

  } catch (err) {
    console.error("Error creando las tablas:", err);
  } finally {
    pool.end(); 
  }
};

createTables();