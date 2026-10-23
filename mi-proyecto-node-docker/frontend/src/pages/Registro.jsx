import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const [formData, setFormData] = useState({ correo: '', contrasena: '', nombres: '', apellidos: '', rol: 'estudiante', nombre_empresa: '' });
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensajeError('');

    try {
      const response = await fetch('/api/auth/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: formData.correo, rol: formData.rol })
      });
      
      const data = await response.json();

      if (response.ok) {
        setPaso(2);
      } else {
        setMensajeError(data.error || 'Error al solicitar el código');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensajeError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroFinal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensajeError('');

    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, codigo })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        setMensajeError(data.error || 'Código incorrecto o error al registrar');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensajeError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-small">
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {paso === 1 ? 'Crea tu Cuenta' : 'Verifica tu Correo'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {paso === 1 ? 'Únete al portal de prácticas del DI' : `Hemos enviado un código a ${formData.correo}`}
        </p>

        {mensajeError && (
          <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
            {mensajeError}
          </div>
        )}

        {paso === 1 ? (
          <form onSubmit={handleSolicitarCodigo}>
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
                  <input name="nombres" placeholder="Juan" value={formData.nombres} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Apellidos</label>
                  <input name="apellidos" placeholder="Pérez" value={formData.apellidos} onChange={handleChange} required />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Nombre de la Empresa</label>
                <input name="nombre_empresa" placeholder="Tech Solutions S.A." value={formData.nombre_empresa} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                name="correo" 
                type="email" 
                placeholder={formData.rol === 'estudiante' ? 'ejemplo@usm.cl' : 'contacto@empresa.com'} 
                value={formData.correo} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input name="contrasena" type="password" placeholder="••••••••" value={formData.contrasena} onChange={handleChange} required />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Enviando código...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistroFinal}>
            <div className="form-group">
              <label style={{ textAlign: 'center', display: 'block' }}>Ingresa el código de 6 dígitos</label>
              <input 
                name="codigo" 
                type="text" 
                maxLength="6"
                placeholder="123456" 
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)} 
                required 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', padding: '12px' }}
              />
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '-5px', marginBottom: '15px' }}>
              El código expirará en 10 minutos.
            </p>

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Verificando...' : 'Completar Registro'}
            </button>

            <button 
              type="button" 
              onClick={() => {
                setPaso(1);
                setCodigo('');
              }}
              style={{ width: '100%', marginTop: '1rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
            >
              Volver al formulario
            </button>
          </form>
        )}
        
        {paso === 1 && (
          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Inicia sesión aquí</Link>
          </p>
        )}
      </div>
    </div>
  );
}