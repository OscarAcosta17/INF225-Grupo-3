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
        telefono VARCHAR(20),
        descripcion TEXT,
        enlace_cv VARCHAR(255),
        perfil_configurado BOOLEAN DEFAULT FALSE
    );

    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estudiantes' AND column_name='telefono') THEN
            ALTER TABLE estudiantes ADD COLUMN telefono VARCHAR(20);
            ALTER TABLE estudiantes ADD COLUMN descripcion TEXT;
            ALTER TABLE estudiantes ADD COLUMN enlace_cv VARCHAR(255);
        END IF;
    END $$;

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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ofertas' AND column_name='activa') THEN
            ALTER TABLE ofertas ADD COLUMN activa BOOLEAN DEFAULT TRUE;
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
        telefono VARCHAR(20),
        correo_contacto VARCHAR(100),
        cv_path VARCHAR(255),
        UNIQUE (estudiante_id, oferta_id)
    );

    ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
    ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS correo_contacto VARCHAR(100);
    ALTER TABLE postulaciones ADD COLUMN IF NOT EXISTS cv_path VARCHAR(255);

    -- 8. Tabla de Bitacora 
    CREATE TABLE IF NOT EXISTS bitacoras (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        horas_trabajadas NUMERIC(4, 2) NOT NULL,
        actividades TEXT NOT NULL,
        actividades_pendientes TEXT,
        observaciones TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unq_estudiante_fecha UNIQUE (estudiante_id, fecha)
    );

    -- 9. Tabla de Trámites de Práctica y Convalidación
    CREATE TABLE IF NOT EXISTS tramites_convalidacion (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
        tipo_flujo VARCHAR(30) NOT NULL, -- 'practica_nueva' (Flujo A) | 'convalidacion' (Flujo B)
        tipo_practica VARCHAR(30) NOT NULL, -- 'industrial' | 'profesional'
        tipo_experiencia VARCHAR(50), -- Solo Flujo B: 'trabajo_profesional' | 'practica_investigativa' | 'trabajo_social' | 'emprendimiento'
        empresa_nombre VARCHAR(150) NOT NULL,
        empresa_rut VARCHAR(20),
        empresa_direccion VARCHAR(255) NOT NULL,
        empresa_unica BOOLEAN DEFAULT TRUE, -- Validación Flujo B
        supervisor_nombre VARCHAR(150) NOT NULL,
        supervisor_correo VARCHAR(120) NOT NULL,
        supervisor_telefono VARCHAR(30) NOT NULL,
        modalidad VARCHAR(30) NOT NULL, -- 'Presencial' | 'Hibrido' | 'Remoto'
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        horas_comprometidas INTEGER DEFAULT 360, -- Horas exigidas por la práctica
        meses_a_convalidar NUMERIC(4, 1), -- Solo Flujo B (para validar regla del triple)
        meses_experiencia_real NUMERIC(4, 1), -- Solo Flujo B
        pdf_actividades_path VARCHAR(255), -- Flujo B: PDF de actividades realizadas
        pdf_informe_final_path VARCHAR(255), -- Flujo A: Informe final al terminar práctica
        resumen_bitacora_json JSONB, -- Snapshot de horas y actividades RS12 al entregar informe final
        estado VARCHAR(60) DEFAULT 'Pendiente de confirmación del supervisor',
        tiempo_estimado_dias INTEGER DEFAULT 10,
        acta_numero VARCHAR(50),
        acta_detalle TEXT,
        observaciones_encargado TEXT,
        fecha_resolucion TIMESTAMP,
        apelacion_motivo TEXT,
        apelacion_pdf_path VARCHAR(255),
        apelacion_estado VARCHAR(30), -- NULL | 'En revisión' | 'Resuelta'
        apelacion_resolucion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Tabla de Evaluación del Supervisor
    CREATE TABLE IF NOT EXISTS evaluaciones_supervisor (
        id SERIAL PRIMARY KEY,
        tramite_id INTEGER UNIQUE NOT NULL REFERENCES tramites_convalidacion(id) ON DELETE CASCADE,
        resumen_tareas TEXT NOT NULL,
        observaciones TEXT,

        capacidad INTEGER CHECK (capacidad BETWEEN 1 AND 5),
        confianza INTEGER CHECK (confianza BETWEEN 1 AND 5),
        aplicacion_esfuerzo INTEGER CHECK (aplicacion_esfuerzo BETWEEN 1 AND 5),
        adaptabilidad INTEGER CHECK (adaptabilidad BETWEEN 1 AND 5),
        iniciativa INTEGER CHECK (iniciativa BETWEEN 1 AND 5),
        trabajo_equipo INTEGER CHECK (trabajo_equipo BETWEEN 1 AND 5),
        conocimientos INTEGER CHECK (conocimientos BETWEEN 1 AND 5),
        asistencia_puntualidad INTEGER CHECK (asistencia_puntualidad BETWEEN 1 AND 5),
        resultados INTEGER CHECK (resultados BETWEEN 1 AND 5),
        comunicacion_efectiva INTEGER CHECK (comunicacion_efectiva BETWEEN 1 AND 5),
        manejo_tic INTEGER CHECK (manejo_tic BETWEEN 1 AND 5),
        fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      ('SQL', 'Base de Datos'),
      ('PostgreSQL', 'Base de Datos'),
      ('MySQL', 'Base de Datos'),
      ('MongoDB', 'Base de Datos'),
      ('Redis', 'Base de Datos'),
      ('Modelamiento de Datos', 'Base de Datos'),
      ('React', 'Frontend'),
      ('Angular', 'Frontend'),
      ('Vue.js', 'Frontend'),
      ('HTML/CSS', 'Frontend'),
      ('Node.js', 'Backend'),
      ('Spring Boot', 'Backend'),
      ('Django', 'Backend'),
      ('Express', 'Backend'),
      ('APIs REST', 'Backend'),
      ('AWS', 'Cloud/DevOps'),
      ('Docker', 'Cloud/DevOps'),
      ('Kubernetes', 'Cloud/DevOps'),
      ('GCP', 'Cloud/DevOps'),
      ('Git', 'Herramientas de desarrollo'),
      ('GitHub/GitLab', 'Herramientas de desarrollo'),
      ('Linux/Terminal', 'Herramientas de desarrollo'),
      ('Postman', 'Herramientas de desarrollo'),
      ('VS Code/IntelliJ', 'Herramientas de desarrollo'),
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
      (1, 1, 'Desarrollador Frontend Junior', 'Desarrollo en React', 'Saber React', '2027-12-31', 'Santiago', 'Hibrido', '$350.000 mensuales', '3 meses'),
      (2, 1, 'Analista de Datos', 'Analisis con Python', 'Python, SQL', '2027-12-31', 'Valparaiso', 'Remoto', 'No pagada', '2 meses'),
      (3, 1, 'Ingeniero Backend', 'Node.js y DB', 'Node, Express', '2027-12-31', 'Santiago', 'Presencial', '$500.000 mensuales', '6 meses'),
      (4, 1, 'Cloud Engineer Trainee', 'AWS y contenedores', 'AWS, Docker', '2027-12-31', 'Santiago', 'Hibrido', '$450.000 mensuales', '6 meses'),
      (5, 1, 'Desarrollador Fullstack', 'React y Node', 'Fullstack JS', '2027-12-31', 'Remoto', 'Remoto', '$600.000 mensuales', '3 meses'),
      (6, 1, 'Data Engineer Trainee', 'Pipelines en Python', 'Python, AWS', '2027-12-31', 'Valparaiso', 'Presencial', 'No pagada', '2 meses'),
      (7, 1, 'Backend Java', 'Spring Boot microservices', 'Java, Spring', '2027-12-31', 'Santiago', 'Hibrido', '$550.000 mensuales', '6 meses'),
      (8, 1, 'Frontend Angular', 'SPA empresariales', 'Angular, TS', '2027-12-31', 'Remoto', 'Remoto', '$300.000 mensuales', '3 meses'),
      (9, 1, 'DevOps Junior', 'Kubernetes cluster admin', 'Docker, K8s', '2027-12-31', 'Santiago', 'Presencial', '$480.000 mensuales', '6 meses'),
      (10, 1, 'Desarrollador Go', 'Servicios de alta concurrencia', 'Go, SQL', '2027-12-31', 'Remoto', 'Remoto', '$650.000 mensuales', '3 meses'),
      (11, 1, 'Scrum Master Trainee', 'Gestion de proyectos agiles', 'Liderazgo, Teamwork', '2027-12-31', 'Remoto', 'Remoto', '$250.000 mensuales', '3 meses'),
      (12, 1, 'Desarrollador C#', 'Sistemas backend empresariales', 'C#, SQL', '2027-12-31', 'Santiago', 'Presencial', '$400.000 mensuales', '6 meses'),
      (13, 1, 'Oferta Vencida de Prueba (D-01/D-03)', 'Oferta con fecha límite ya expirada para verificar exclusión y bloqueo de postulación.', 'C++, SQL', '2024-01-01', 'Santiago', 'Presencial', '$300.000 mensuales', '3 meses'),
      (14, 1, 'Oferta Desactivada de Prueba (D-01/D-03)', 'Oferta con activa=false para verificar exclusión del catálogo y filtros.', 'Python', '2027-12-31', 'Remoto', 'Remoto', '$400.000 mensuales', '3 meses')
      ON CONFLICT (id) DO NOTHING;

      UPDATE ofertas SET activa = FALSE WHERE id = 14;

      -- Actualizar ofertas de prueba antiguas que tenian solo 'Pagada' sin monto para que sean compatibles con el filtro de montos
      UPDATE ofertas SET remuneracion = '$350.000 mensuales' WHERE id = 1 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$500.000 mensuales' WHERE id = 3 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$450.000 mensuales' WHERE id = 4 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$600.000 mensuales' WHERE id = 5 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$550.000 mensuales' WHERE id = 7 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$300.000 mensuales' WHERE id = 8 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$480.000 mensuales' WHERE id = 9 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$650.000 mensuales' WHERE id = 10 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$250.000 mensuales' WHERE id = 11 AND remuneracion = 'Pagada';
      UPDATE ofertas SET remuneracion = '$400.000 mensuales' WHERE id = 12 AND remuneracion = 'Pagada';
      
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
      (12, 7), (12, 8),
      (13, 1), (13, 8),
      (14, 2)
      ON CONFLICT DO NOTHING;
      
      INSERT INTO estudiante_competencia (estudiante_id, competencia_id) VALUES
      (1, 4), (1, 12), (1, 16), (1, 15), (1, 25)
      ON CONFLICT DO NOTHING;

      INSERT INTO bitacoras (estudiante_id, fecha, hora_inicio, hora_fin, horas_trabajadas, actividades, actividades_pendientes, observaciones) VALUES
      (1, '2026-11-01', '09:00', '18:00', 9.00, 'Onboarding en la empresa, configuración del entorno local Docker y clonación de repositorios.', 'Revisar documentación de arquitectura', 'Primer día presencial con el tutor.'),
      (1, '2026-11-02', '09:00', '17:30', 8.50, 'Desarrollo de componentes React para el dashboard y conexión inicial a la API REST.', 'Implementar validaciones de formulario', 'Jornada fluida, sin bloqueos técnicos.')
      ON CONFLICT (estudiante_id, fecha) DO NOTHING;
      
      SELECT setval('ofertas_id_seq', (SELECT MAX(id) FROM ofertas));
      SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
      SELECT setval('empresas_id_seq', (SELECT MAX(id) FROM empresas));
      SELECT setval('bitacoras_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bitacoras));
      INSERT INTO tramites_convalidacion (
        id, estudiante_id, tipo_flujo, tipo_practica,
        empresa_nombre, empresa_rut, empresa_direccion,
        supervisor_nombre, supervisor_correo, supervisor_telefono,
        modalidad, fecha_inicio, fecha_fin, horas_comprometidas, estado
        ) VALUES (
        1, 1, 'practica_nueva', 'industrial',
        'TechCorp', '76.123.456-7', 'Av. Vicuña Mackenna 3939, Santiago',
        'Carlos Ruiz', 'supervisor@tech.com', '+56 9 8765 4321',
        'Hibrido', '2026-11-01', '2027-02-28', 360, 'Práctica confirmada / en curso'
        ) ON CONFLICT (id) DO NOTHING;

        SELECT setval('tramites_convalidacion_id_seq', (SELECT COALESCE(MAX(id), 1) FROM tramites_convalidacion));


        
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
