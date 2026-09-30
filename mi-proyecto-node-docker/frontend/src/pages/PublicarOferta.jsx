import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PublicarOferta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    fecha_cierre: '',
    competencias: []
  });

  const [todasCompetencias, setTodasCompetencias] = useState([]);

  useEffect(() => {
    fetch('/api/competencias')
      .then(res => res.json())
      .then(data => setTodasCompetencias(data));

    if (id) {
      fetch(`/api/ofertas/${id}`)
        .then(res => res.json())
        .then(data => {
          const fecha = new Date(data.fecha_cierre).toISOString().split('T')[0];
          setFormData({
            titulo: data.titulo,
            descripcion: data.descripcion,
            requisitos: data.requisitos,
            fecha_cierre: fecha,
            competencias: data.competencia_ids || []
          });
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompetenciaChange = (competenciaId) => {
    const nuevas = formData.competencias.includes(competenciaId)
      ? formData.competencias.filter(id => id !== competenciaId)
      : [...formData.competencias, competenciaId];
    setFormData({ ...formData, competencias: nuevas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = id ? `/api/ofertas/${id}` : '/api/ofertas';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          empresa_id: usuario.id
        })
      });

      if (response.ok) {
        alert(id ? 'Oferta actualizada' : 'Oferta publicada');
        navigate('/mis-ofertas');
      } else {
        const data = await response.json();
        alert(data.error || 'Error al procesar la oferta');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container-small" style={{ maxWidth: '700px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>{id ? 'Editar Oferta' : 'Nueva Oferta de Práctica'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título de la Posición</label>
            <input 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              placeholder="Ej: Desarrollador Frontend Trainee"
              required 
            />
          </div>

          <div className="form-group">
            <label>Descripción de la Práctica</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Describe las tareas y el ambiente de trabajo..."
              required 
              style={{ height: '120px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Requisitos Adicionales</label>
            <textarea 
              name="requisitos" 
              value={formData.requisitos} 
              onChange={handleChange} 
              placeholder="Ej: Estudiante de 4to año, disponibilidad inmediata..."
              required 
              style={{ height: '80px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Fecha de Cierre</label>
            <input 
              name="fecha_cierre" 
              type="date" 
              value={formData.fecha_cierre} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Competencias Clave</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: '10px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)'
            }}>
              {todasCompetencias.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.competencias.includes(c.id)}
                    onChange={() => handleCompetenciaChange(c.id)}
                    style={{ width: 'auto' }}
                  /> {c.nombre}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
            <button type="submit" style={{ flex: 2 }}>
              {id ? 'Guardar Cambios' : 'Publicar Ahora'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/mis-ofertas')} 
              style={{ flex: 1, backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
