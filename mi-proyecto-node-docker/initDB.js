const pool = require('./db');

const createTables = async () => {
  const queryText = `
    -- 1. Tabla para el inicio de sesion
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contrasena_hash VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='rol') THEN
            ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) DEFAULT 'estudiante';
        END IF;
    END $$;

    -- 2. Tabla para el perfil del estudiante
    CREATE TABLE IF NOT EXISTS estudiantes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        nombres VARCHAR(100),
        apellidos VARCHAR(100),
        perfil_configurado BOOLEAN DEFAULT FALSE
    );

    -- 2.1 Tabla para el perfil de la empresa
    CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre_empresa VARCHAR(100),
        descripcion TEXT
    );

    -- 3. catalogo de competencias tecnicas
    CREATE TABLE IF NOT EXISTS competencias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        categoria VARCHAR(50)
    );

    -- 4. Tabla intermedia (Estudiante elige sus competencias)
    CREATE TABLE IF NOT EXISTS estudiante_competencia (
        estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
        competencia_id INTEGER REFERENCES competencias(id) ON DELETE CASCADE,
        PRIMARY KEY (estudiante_id, competencia_id)
    );

    -- 5. Tabla de ofertas de practica
    CREATE TABLE IF NOT EXISTS ofertas (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        requisitos TEXT,
        localidad VARCHAR(100),
        modalidad VARCHAR(50),
        remuneracion VARCHAR(50),
        duracion VARCHAR(50),
        fecha_cierre TIMESTAMP NOT NULL,
        fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ofertas' AND column_name='localidad') THEN
            ALTER TABLE ofertas ADD COLUMN localidad VARCHAR(100);
            ALTER TABLE ofertas ADD COLUMN modalidad VARCHAR(50);
            ALTER TABLE ofertas ADD COLUMN remuneracion VARCHAR(50);
            ALTER TABLE ofertas ADD COLUMN duracion VARCHAR(50);
        END IF;
    END $$;

    -- 6. Tabla intermedia (Oferta requiere competencias)
    CREATE TABLE IF NOT EXISTS oferta_competencia (
        oferta_id INTEGER REFERENCES ofertas(id) ON DELETE CASCADE,
        competencia_id INTEGER REFERENCES competencias(id) ON DELETE CASCADE,
        PRIMARY KEY (oferta_id, competencia_id)
    );

    -- 7. Tabla de postulaciones
    CREATE TABLE IF NOT EXISTS postulaciones (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
        oferta_id INTEGER REFERENCES ofertas(id) ON DELETE CASCADE,
        fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado VARCHAR(50) DEFAULT 'Pendiente',
        UNIQUE (estudiante_id, oferta_id)
    );
  `;

  try {
    console.log("Creando tablas en PostgreSQL...");
    await pool.query(queryText);
    console.log("Tablas creadas con exito!");

    await pool.query(`
      INSERT INTO competencias (nombre, categoria) VALUES 
      ('C++', 'Lenguaje de Programacion'),
      ('Python', 'Lenguaje de Programacion'),
      ('Java', 'Lenguaje de Programacion'),
      ('JavaScript', 'Lenguaje de Programacion'),
      ('TypeScript', 'Lenguaje de Programacion'),
      ('Go', 'Lenguaje de Programacion'),
      ('C#', 'Lenguaje de Programacion'),
      ('PostgreSQL', 'Base de Datos'),
      ('MySQL', 'Base de Datos'),
      ('MongoDB', 'Base de Datos'),
      ('Redis', 'Base de Datos'),
      ('React', 'Frontend'),
      ('Angular', 'Frontend'),
      ('Vue.js', 'Frontend'),
      ('HTML/CSS', 'Frontend'),
      ('Node.js', 'Backend'),
      ('Spring Boot', 'Backend'),
      ('Django', 'Backend'),
      ('Express', 'Backend'),
      ('AWS', 'Cloud/DevOps'),
      ('Docker', 'Cloud/DevOps'),
      ('Kubernetes', 'Cloud/DevOps'),
      ('GCP', 'Cloud/DevOps'),
      ('Liderazgo', 'Habilidad Blanda'),
      ('Trabajo en Equipo', 'Habilidad Blanda'),
      ('Comunicacion Efectiva', 'Habilidad Blanda'),
      ('Resolucion de Problemas', 'Habilidad Blanda')
      ON CONFLICT DO NOTHING;
    `);
    console.log("Competencias de prueba cargadas.");

    await pool.query(`
      INSERT INTO usuarios (id, correo, contrasena_hash, rol) VALUES 
      (1, 'estudiante@usm.cl', '1234', 'estudiante'),
      (2, 'empresa@tech.com', '1234', 'empresa')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO estudiantes (usuario_id, nombres, apellidos, perfil_configurado) VALUES 
      (1, 'Juan', 'Perez', true)
      ON CONFLICT DO NOTHING;

      INSERT INTO empresas (id, usuario_id, nombre_empresa, descripcion) VALUES 
      (1, 2, 'TechCorp', 'Empresa de tecnologia lider.')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO ofertas (id, empresa_id, titulo, descripcion, requisitos, fecha_cierre, localidad, modalidad, remuneracion, duracion) VALUES
      (1, 1, 'Desarrollador Frontend Junior', 'Desarrollo en React', 'Saber React', '2027-12-31', 'Santiago', 'Hibrido', 'Pagada', '3 meses'),
      (2, 1, 'Analista de Datos', 'Analisis con Python', 'Python, SQL', '2027-12-31', 'Valparaiso', 'Remoto', 'No pagada', '2 meses'),
      (3, 1, 'Ingeniero Backend', 'Node.js y DB', 'Node, Express', '2027-12-31', 'Santiago', 'Presencial', 'Pagada', '6 meses'),
      (4, 1, 'Cloud Engineer Trainee', 'AWS y contenedores', 'AWS, Docker', '2027-12-31', 'Santiago', 'Hibrido', 'Pagada', '6 meses'),
      (5, 1, 'Desarrollador Fullstack', 'React y Node', 'Fullstack JS', '2027-12-31', 'Remoto', 'Remoto', 'Pagada', '3 meses'),
      (6, 1, 'Data Engineer Trainee', 'Pipelines en Python', 'Python, AWS', '2027-12-31', 'Valparaiso', 'Presencial', 'No pagada', '2 meses'),
      (7, 1, 'Backend Java', 'Spring Boot microservices', 'Java, Spring', '2027-12-31', 'Santiago', 'Hibrido', 'Pagada', '6 meses'),
      (8, 1, 'Frontend Angular', 'SPA empresariales', 'Angular, TS', '2027-12-31', 'Remoto', 'Remoto', 'Pagada', '3 meses'),
      (9, 1, 'DevOps Junior', 'Kubernetes cluster admin', 'Docker, K8s', '2027-12-31', 'Santiago', 'Presencial', 'Pagada', '6 meses'),
      (10, 1, 'Desarrollador Go', 'Servicios de alta concurrencia', 'Go, SQL', '2027-12-31', 'Remoto', 'Remoto', 'Pagada', '3 meses'),
      (11, 1, 'Scrum Master Trainee', 'Gestion de proyectos agiles', 'Liderazgo, Teamwork', '2027-12-31', 'Remoto', 'Remoto', 'Pagada', '3 meses'),
      (12, 1, 'Desarrollador C#', 'Sistemas backend empresariales', 'C#, SQL', '2027-12-31', 'Santiago', 'Presencial', 'Pagada', '6 meses')
      ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO oferta_competencia (oferta_id, competencia_id) VALUES
      (1, 12), (1, 4), (1, 15), 
      (2, 2), (2, 8),  
      (3, 16), (3, 4), 
      (4, 20), (4, 21),
      (5, 12), (5, 16), (5, 4),
      (6, 2), (6, 20), 
      (7, 3), (7, 17), 
      (8, 13), (8, 5), 
      (9, 21), (9, 22),
      (10, 6), (10, 8),
      (11, 24), (11, 25), (11, 26),
      (12, 7), (12, 8)
      ON CONFLICT DO NOTHING;
      
      INSERT INTO estudiante_competencia (estudiante_id, competencia_id) VALUES
      (1, 4), (1, 12), (1, 16), (1, 15), (1, 25)
      ON CONFLICT DO NOTHING;
      
      SELECT setval('ofertas_id_seq', (SELECT MAX(id) FROM ofertas));
    `);
    console.log("Datos de prueba completos cargados exitosamente.");

  } catch (err) {
    console.error("Error creando las tablas:", err);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Estructura de BD lista. Cerrando script de inicializacion.");
    process.exit(0);
  }
};

createTables();