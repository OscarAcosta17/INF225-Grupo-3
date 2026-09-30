import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConfigurarPerfil() {
  const [competencias, setCompetencias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const navigate = useNavigate();
  
  
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    
    const cargarCompetencias = async () => {
      try {
        const response = await fetch('/api/competencias');
        const data = await response.json();
        setCompetencias(data);
      } catch (error) {
        console.error("Error cargando competencias:", error);
      }
    };
    cargarCompetencias();
  }, []);


  const handleCheckboxChange = (id) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(comp_id => comp_id !== id)); 
    } else {
      setSeleccionadas([...seleccionadas, id]); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioLocal) return alert('No hay sesión iniciada');

    try {
      const response = await fetch('/api/competencias/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: usuarioLocal.estudiante_id,
          competencias_ids: seleccionadas
        })
      });

      if (response.ok) {
        
        usuarioLocal.perfil_configurado = true;
        localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
        
        alert('¡Perfil configurado con éxito!');
        navigate('/perfil'); 
      }
    } catch (error) {
      console.error('Error guardando perfil:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Hola {usuarioLocal?.nombres}, configuremos tu perfil</h2>
      <p>Selecciona las competencias técnicas que manejas:</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {competencias.map(comp => (
            <label key={comp.id} style={{ cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                value={comp.id} 
                onChange={() => handleCheckboxChange(comp.id)}
              />
              {' '}{comp.nombre} ({comp.categoria})
            </label>
          ))}
        </div>
        <button type="submit" disabled={seleccionadas.length === 0}>
          Guardar Perfil
        </button>
      </form>
    </div>
  );
}