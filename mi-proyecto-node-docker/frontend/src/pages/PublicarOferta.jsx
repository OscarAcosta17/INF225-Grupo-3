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
    localidad: '',
    modalidad: 'Híbrido',
    duracion: '',
    competencias: []
  });

  const [tipoRemuneracion, setTipoRemuneracion] = useState('Pagada');
  const [montoRemuneracion, setMontoRemuneracion] = useState('');

  const [todasCompetencias, setTodasCompetencias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Control de acceso general (CP-RS2.2-03)
    if (!usuario || usuario.rol !== 'empresa') {
      alert('Acceso no autorizado: Solo las empresas pueden publicar o editar ofertas.');
      navigate('/login');
      return;
    }

    fetch('/api/competencias')
      .then(res => res.json())
      .then(data => setTodasCompetencias(data))
      .catch(err => console.error("Error al cargar competencias:", err));

    if (id) {
      fetch(`/api/ofertas/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Oferta no encontrada');
          return res.json();
        })
        .then(data => {
          // CP-RS2.2-03: Control de acceso para evitar que una empresa edite ofertas ajenas
          if (data.empresa_id && Number(data.empresa_id) !== Number(usuario.id)) {
            alert('Acceso no autorizado: No tienes permiso para editar ofertas de otra empresa.');
            navigate('/mis-ofertas');
            return;
          }

          const fechaCierre = new Date(data.fecha_cierre);
          if (fechaCierre < new Date()) {
            alert('Esta oferta ya ha vencido su fecha límite y no puede ser modificada.');
            navigate('/mis-ofertas');
            return;
          }

          const fecha = fechaCierre.toISOString().split('T')[0];
          setFormData({
            titulo: data.titulo || '',
            descripcion: data.descripcion || '',
            requisitos: data.requisitos || '',
            fecha_cierre: fecha,
            localidad: data.localidad || '',
            modalidad: data.modalidad || 'Híbrido',
            duracion: data.duracion || '',
            competencias: data.competencia_ids || []
          });

          // Determinar tipo de remuneración existente
          const rem = data.remuneracion || '';
          if (rem.toLowerCase().includes('no pagada')) {
            setTipoRemuneracion('No pagada');
            setMontoRemuneracion('');
          } else {
            setTipoRemuneracion('Pagada');
            setMontoRemuneracion(rem === 'Pagada' ? '' : rem);
          }
        })
        .catch(err => {
          alert('Error al obtener la oferta o no existe.');
          navigate('/mis-ofertas');
        });
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setError('');
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompetenciaChange = (competenciaId) => {
    setError('');
    const nuevas = formData.competencias.includes(competenciaId)
      ? formData.competencias.filter(cid => cid !== competenciaId)
      : [...formData.competencias, competenciaId];
    setFormData({ ...formData, competencias: nuevas });
  };

  const validarFormulario = () => {
    if (!formData.titulo.trim()) return 'El título de la posición es obligatorio.';
    if (!formData.descripcion.trim()) return 'La descripción de la práctica es obligatoria.';
    if (!formData.requisitos.trim()) return 'Los requisitos son obligatorios.';
    if (!formData.fecha_cierre) return 'La fecha de cierre es obligatoria.';
    
    // Validaciones obligatorias RS2.1 y RS2.2
    if (!formData.localidad.trim()) return 'La localidad es obligatoria.';
    if (!formData.modalidad.trim()) return 'La modalidad es obligatoria.';
    
    // Remuneración (CP-RS2.2-02)
    if (tipoRemuneracion === 'Pagada') {
      if (!montoRemuneracion.trim()) {
        return 'Debe ingresar el monto de remuneración mensual (ej: $400.000 mensuales).';
      }
      if (/-\s*\d+/.test(montoRemuneracion)) {
        return 'La remuneración no puede contener valores negativos.';
      }
      if (!/\d+/.test(montoRemuneracion)) {
        return 'Debe ingresar un monto numérico válido en pesos (ej: 400.000 o $400.000 mensuales).';
      }
    }
    
    // Duración (no vacía y mayor a 0) - CP-RS2.2-02
    if (!formData.duracion.trim()) return 'La duración es obligatoria.';
    const numMatch = formData.duracion.match(/-?\d+(\.\d+)?/);
    if (numMatch) {
      const num = parseFloat(numMatch[0]);
      if (num <= 0) return 'La duración debe ser mayor a 0 meses.';
    }

    // Tecnologías requeridas
    if (formData.competencias.length === 0) {
      return 'Debe seleccionar al menos una tecnología o competencia clave.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    // Formatear remuneración consistente con los informes
    let remuneracionFinal = 'No pagada';
    if (tipoRemuneracion === 'Pagada') {
      const raw = montoRemuneracion.trim();
      const digitsOnly = raw.replace(/\D/g, '');
      if (digitsOnly && !raw.toLowerCase().includes('mensual')) {
        const formateado = Number(digitsOnly).toLocaleString('es-CL');
        remuneracionFinal = `$${formateado} mensuales`;
      } else {
        remuneracionFinal = raw;
      }
    }

    setLoading(true);
    const url = id ? `/api/ofertas/${id}` : '/api/ofertas';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          remuneracion: remuneracionFinal,
          empresa_id: usuario.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(id ? 'Oferta actualizada exitosamente' : 'Oferta publicada exitosamente');
        navigate('/mis-ofertas');
      } else {
        setError(data.error || 'Error al procesar la oferta');
      }
    } catch (err) {
      setError('Error de comunicación con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-small" style={{ maxWidth: '750px', padding: '30px 20px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
          {id ? 'Editar Oferta de Práctica' : 'Nueva Oferta de Práctica'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Completa todos los campos obligatorios para {id ? 'actualizar' : 'publicar'} la vacante según las normas del portal.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título de la Posición *</label>
            <input 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              placeholder="Ej: Desarrollador Frontend Trainee"
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Modalidad *</label>
              <select 
                name="modalidad" 
                value={formData.modalidad} 
                onChange={handleChange}
                required
              >
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>

            <div className="form-group">
              <label>Localidad *</label>
              <input 
                name="localidad" 
                value={formData.localidad} 
                onChange={handleChange} 
                placeholder="Ej: Santiago, Valparaíso o Remoto"
                required 
              />
            </div>
          </div>

          {/* Sección de Remuneración adaptada según RS2 y RS3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Tipo de Remuneración *</label>
              <select 
                value={tipoRemuneracion} 
                onChange={(e) => {
                  setTipoRemuneracion(e.target.value);
                  setError('');
                }}
              >
                <option value="Pagada">Remunerada (Pagada)</option>
                <option value="No pagada">No remunerada (Ad honorem)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {tipoRemuneracion === 'Pagada' ? 'Monto Mensual ($ CLP) *' : 'Condición'}
              </label>
              {tipoRemuneracion === 'Pagada' ? (
                <input 
                  type="text"
                  value={montoRemuneracion} 
                  onChange={(e) => {
                    setMontoRemuneracion(e.target.value);
                    setError('');
                  }} 
                  placeholder="Ej: 400.000 o $400.000 mensuales"
                  required 
                />
              ) : (
                <input 
                  type="text" 
                  value="Sin remuneración" 
                  disabled 
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Duración de la Práctica *</label>
              <input 
                name="duracion" 
                value={formData.duracion} 
                onChange={handleChange} 
                placeholder="Ej: 3 meses, 6 meses"
                required 
              />
            </div>

            <div className="form-group">
              <label>Fecha de Cierre de Postulaciones *</label>
              <input 
                name="fecha_cierre" 
                type="date" 
                value={formData.fecha_cierre} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción de la Práctica *</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Describe las tareas, funciones y el ambiente de trabajo..."
              required 
              style={{ height: '110px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Requisitos Adicionales *</label>
            <textarea 
              name="requisitos" 
              value={formData.requisitos} 
              onChange={handleChange} 
              placeholder="Ej: Estudiante de Informática regular, disponibilidad de 20 hrs semanales..."
              required 
              style={{ height: '80px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Tecnologías y Competencias Requeridas * (Selecciona al menos una)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '10px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {todasCompetencias.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
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
            <button type="submit" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Guardando...' : id ? 'Guardar Cambios' : 'Publicar Ahora'}
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
