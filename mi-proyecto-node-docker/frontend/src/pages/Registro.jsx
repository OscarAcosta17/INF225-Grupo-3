import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const [formData, setFormData] = useState({ correo: '', contrasena: '', nombres: '', apellidos: '', rol: 'estudiante', nombre_empresa: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        alert('Error al registrar');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-small">
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Crea tu Cuenta</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Únete al portal de prácticas del DI</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de Usuario</label>
            <select name="rol" onChange={handleChange} value={formData.rol}>
              <option value="estudiante">Estudiante</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>

          {formData.rol === 'estudiante' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Nombres</label>
                <input name="nombres" placeholder="Juan" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input name="apellidos" placeholder="Pérez" onChange={handleChange} required />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>Nombre de la Empresa</label>
              <input name="nombre_empresa" placeholder="Tech Solutions S.A." onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input name="correo" type="email" placeholder="correo@ejemplo.com" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input name="contrasena" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Registrarse
          </button>
        </form>
        
        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
