const pool = require('./db');

async function run() {
  try {
    const res = await pool.query("INSERT INTO usuarios (correo, contrasena_hash, rol) VALUES ('estudiante@usm.cl', '1234', 'estudiante'), ('empresa@tech.com', '1234', 'empresa') RETURNING id");
    const studentId = res.rows[0].id;
    const empId = res.rows[1].id;
    await pool.query("INSERT INTO estudiantes (usuario_id, nombres, apellidos, perfil_configurado) VALUES ($1, 'Juan', 'Perez', true)", [studentId]);
    await pool.query("INSERT INTO empresas (usuario_id, nombre_empresa) VALUES ($1, 'TechCorp')", [empId]);
    console.log("Users inserted");
  } catch(e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
}

run();
