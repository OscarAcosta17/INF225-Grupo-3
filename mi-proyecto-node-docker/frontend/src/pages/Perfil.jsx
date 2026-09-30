import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Perfil() {
  const navigate = useNavigate();
  const [misCompetencias, setMisCompetencias] = useState([]); 
  
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    
    if (!usuarioLocal) {
      navigate('/login');
      return;
    }

    
    const cargarMisCompetencias = async () => {
      try {
        const response = await fetch(`/api/competencias/estudiante/${usuarioLocal.estudiante_id}`);
        if (response.ok) {
          const data = await response.json();
          setMisCompetencias(data);
        }
      } catch (error) {
        console.error("Error al cargar las competencias:", error);
      }
    };

    cargarMisCompetencias();
  }, [navigate]); 

  const manejarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mi Perfil - Portal de Prácticas</h2>
        <button 
          onClick={manejarCerrarSesion} 
          style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>
      
      <hr style={{ margin: '20px 0' }} />

      {/* Informacion del estudiante */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Bienvenido, {usuarioLocal?.nombres} {usuarioLocal?.apellidos}</h3>
        <p><strong>Correo:</strong> {usuarioLocal?.correo}</p>
      </div>


      <div>
        <h4>Mis Competencias Técnicas</h4>
        {misCompetencias.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {misCompetencias.map((comp) => (
              <span 
                key={comp.id} 
                style={{
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '5px 12px', 
                  borderRadius: '15px',
                  fontSize: '14px'
                }}
              >
                {comp.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            Aún no has configurado tus competencias o están cargando...
          </p>
        )}
      </div>

    </div>
  );
}