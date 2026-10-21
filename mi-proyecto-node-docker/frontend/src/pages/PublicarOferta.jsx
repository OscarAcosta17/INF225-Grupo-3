import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>;
const IconSave = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconCheckCircle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconFileText = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

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
    duracion: '3 meses',
    competencias: []
  });

  const [tipoRemuneracion, setTipoRemuneracion] = useState('Pagada');
  const [montoRemuneracion, setMontoRemuneracion] = useState('360000');
  const [mesesDuracion, setMesesDuracion] = useState(3);

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
          const durRaw = data.duracion || '';
          const durMatch = durRaw.match(/\d+/);
          let parsedMeses = 0;
          if (!durRaw.toLowerCase().includes('flexible') && durMatch) {
            parsedMeses = Math.min(12, Math.max(0, parseInt(durMatch[0], 10)));
          }
          setMesesDuracion(parsedMeses);

          setFormData({
            titulo: data.titulo || '',
            descripcion: data.descripcion || '',
            requisitos: data.requisitos || '',
            fecha_cierre: fecha,
            localidad: data.localidad || '',
            modalidad: data.modalidad || 'Híbrido',
            duracion: parsedMeses === 0 ? 'Flexible' : parsedMeses === 1 ? '1 mes' : `${parsedMeses} meses`,
            competencias: data.competencia_ids || []
          });

          // Determinar tipo de remuneración existente
          const rem = data.remuneracion || '';
          if (rem.toLowerCase().includes('no pagada')) {
            setTipoRemuneracion('No pagada');
            setMontoRemuneracion('0');
          } else {
            setTipoRemuneracion('Pagada');
            const digits = rem.replace(/\D/g, '');
            const num = digits ? Math.max(60000, Number(digits)) : 360000;
            setMontoRemuneracion(String(num));
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

  const handleDuracionSlider = (e) => {
    setError('');
    const m = Number(e.target.value);
    setMesesDuracion(m);
    const textoDuracion = m === 0 ? 'Flexible' : m === 1 ? '1 mes' : `${m} meses`;
    setFormData(prev => ({ ...prev, duracion: textoDuracion }));
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
    
    // Duración
    if (!formData.duracion.trim()) return 'La duración es obligatoria.';

    // Tecnologías requeridas
    if (formData.competencias.length === 0) {
      return 'Debe seleccionar al menos una tecnología o competencia clave.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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

  const competenciasPorCategoria = todasCompetencias.reduce((acc, comp) => {
    const cat = comp.categoria || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(comp);
    return acc;
  }, {});

  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '5px' };
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.88rem', outline: 'none', transition: 'all 0.2s' };

  return (
    <>
      <style>{`
        body {
          margin: 0; padding: 0;
          background-color: #f8fafc;
        }
        * { box-sizing: border-box; }

        .pub-app {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
          overflow: hidden;
          background-color: #f8fafc;
        }

        .pub-header {
          flex-shrink: 0;
          min-height: 84px;
          background-color: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          z-index: 10;
        }

        .pub-body {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 40px;
          display: flex;
          gap: 28px;
          overflow: hidden;
          min-height: 0;
        }

        .pub-left {
          flex: 1.15;
          background-color: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .pub-right {
          flex: 0.85;
          background-color: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        /* Estilo de barra cápsula gruesa (del porte del círculo) y smooth */
        .edge-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 20px;
          background: #e2e8f0;
          border-radius: 999px;
          outline: none;
          margin: 0;
          padding: 0 2px;
          cursor: pointer;
          position: relative;
          z-index: 2;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .edge-slider:hover {
          box-shadow: inset 0 1px 3px rgba(15, 23, 42, 0.12), 0 0 0 3px rgba(59, 130, 246, 0.08);
        }
        .edge-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 5px rgba(37, 99, 235, 0.4);
          cursor: grab;
          transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.15s ease, box-shadow 0.18s ease;
        }
        .edge-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #1d4ed8;
          box-shadow: 0 3px 8px rgba(37, 99, 235, 0.55);
        }
        .edge-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(0.98);
          background: #1e40af;
        }
        .edge-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 5px rgba(37, 99, 235, 0.4);
          cursor: grab;
          transition: transform 0.18s ease, background-color 0.15s ease;
        }

        .comp-scroll::-webkit-scrollbar { width: 8px; }
        .comp-scroll::-webkit-scrollbar-track { background: #f8fafc; }
        .comp-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .comp-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (max-width: 960px) {
          .pub-app { height: auto; min-height: 100vh; overflow-y: auto; }
          .pub-header { padding: 16px 20px; flex-wrap: wrap; }
          .pub-body { flex-direction: column; overflow: visible; padding: 20px; }
          .pub-left, .pub-right { overflow: visible; }
          .comp-scroll { max-height: 350px; }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="pub-app">
        
        {/* Header Superior con Botones de Publicar y Cancelar siempre visibles */}
        <header className="pub-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '46px', height: '46px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <IconBuilding />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>
                {id ? 'Editar Oferta de Práctica' : 'Nueva Oferta de Práctica'}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                {usuario?.nombre_empresa} • Completa los campos obligatorios de la vacante
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', maxWidth: '420px' }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/mis-ofertas')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#475569'; }}
            >
              <IconArrowLeft /> Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)' }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#2563eb'; }}
            >
              <IconSave /> {loading ? 'Guardando...' : id ? 'Guardar Cambios' : 'Publicar Ahora'}
            </button>
          </div>
        </header>

        {/* Cuerpo Principal en 2 Columnas sin scroll general */}
        <div className="pub-body">
          
          {/* Columna Izquierda: Información General de la Vacante */}
          <div className="pub-left">
            <div style={{ flexShrink: 0, backgroundColor: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#2563eb', display: 'flex' }}><IconFileText /></span>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>
                Detalles y Condiciones de la Práctica
              </h3>
            </div>

            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between', overflowY: 'auto' }}>
              
              {/* Fila 1: Título, Modalidad y Localidad */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Título de la Posición *</label>
                  <input
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Desarrollador Frontend Trainee"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Modalidad *</label>
                  <select name="modalidad" value={formData.modalidad} onChange={handleChange} required style={inputStyle}>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Localidad *</label>
                  <input
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                    placeholder="Ej: Santiago, Valparaíso o Remoto"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Fila 2: Tipo Remuneración, Monto (Barra de punto a punto desde 60k), Duración (Barra con puntitos 0-12m) y Fecha Cierre */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1.25fr 0.95fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Remuneración *</label>
                  <select
                    value={tipoRemuneracion}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTipoRemuneracion(val);
                      if (val === 'Pagada' && (!montoRemuneracion || Number(montoRemuneracion) < 60000)) {
                        setMontoRemuneracion('360000');
                      }
                      setError('');
                    }}
                    style={inputStyle}
                  >
                    <option value="Pagada">Remunerada (Pagada)</option>
                    <option value="No pagada">No remunerada</option>
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{tipoRemuneracion === 'Pagada' ? 'Monto Mensual *' : 'Condición'}</span>
                    {tipoRemuneracion === 'Pagada' && (
                      <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700' }}>
                        ${Number(montoRemuneracion || 60000).toLocaleString('es-CL')}
                      </span>
                    )}
                  </label>
                  {tipoRemuneracion === 'Pagada' ? (
                    <div style={{ height: '38px', padding: '0 6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="range"
                        className="edge-slider"
                        min="60000"
                        max="1000000"
                        step="10000"
                        value={Math.max(60000, Number(montoRemuneracion) || 360000)}
                        onChange={(e) => {
                          setMontoRemuneracion(e.target.value);
                          setError('');
                        }}
                        style={{ background: `linear-gradient(to right, #93c5fd ${((Math.max(60000, Number(montoRemuneracion) || 360000) - 60000) / 940000) * 100}%, #e2e8f0 ${((Math.max(60000, Number(montoRemuneracion) || 360000) - 60000) / 940000) * 100}%)` }}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value="Sin remuneración"
                      disabled
                      style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Duración *</span>
                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700' }}>
                      {mesesDuracion === 0 ? 'Flexible' : mesesDuracion === 1 ? '1 mes' : `${mesesDuracion} meses`}
                    </span>
                  </label>
                  <div style={{ position: 'relative', height: '38px', padding: '0 6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center' }}>
                    {/* Puntitos de cada mes (0 a 12) */}
                    <div style={{ position: 'absolute', left: '16px', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none', zIndex: 3 }}>
                      {Array.from({ length: 13 }).map((_, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: idx <= mesesDuracion ? '#1d4ed8' : '#94a3b8',
                            opacity: idx === mesesDuracion ? 0 : 0.75,
                            transition: 'all 0.15s'
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="range"
                      className="edge-slider"
                      min="0"
                      max="12"
                      step="1"
                      value={mesesDuracion}
                      onChange={handleDuracionSlider}
                      style={{ background: `linear-gradient(to right, #93c5fd ${(mesesDuracion / 12) * 100}%, #e2e8f0 ${(mesesDuracion / 12) * 100}%)` }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Fecha de Cierre *</label>
                  <input
                    name="fecha_cierre"
                    type="date"
                    value={formData.fecha_cierre}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Fila 3: Descripción */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '80px' }}>
                <label style={labelStyle}>Descripción de la Práctica *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describe las tareas, funciones y el ambiente de trabajo..."
                  required
                  style={{ ...inputStyle, flex: 1, resize: 'none', lineHeight: '1.45' }}
                />
              </div>

              {/* Fila 4: Requisitos Adicionales */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '70px' }}>
                <label style={labelStyle}>Requisitos Adicionales *</label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  placeholder="Ej: Estudiante de Informática regular, disponibilidad de 20 hrs semanales..."
                  required
                  style={{ ...inputStyle, flex: 1, resize: 'none', lineHeight: '1.45' }}
                />
              </div>

            </div>
          </div>

          {/* Columna Derecha: Competencias Requeridas (con scroll interno) */}
          <div className="pub-right">
            <div style={{ flexShrink: 0, backgroundColor: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#2563eb', display: 'flex' }}><IconCheckCircle /></span>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>
                  Tecnologías y Competencias *
                </h3>
              </div>
              <span style={{ backgroundColor: formData.competencias.length > 0 ? '#eff6ff' : '#f1f5f9', color: formData.competencias.length > 0 ? '#1d4ed8' : '#64748b', border: `1px solid ${formData.competencias.length > 0 ? '#bfdbfe' : '#e2e8f0'}`, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                {formData.competencias.length} seleccionadas
              </span>
            </div>

            <div className="comp-scroll" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
              {Object.entries(competenciasPorCategoria).map(([categoria, comps]) => (
                <div key={categoria} style={{ marginBottom: '18px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    {categoria}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {comps.map(c => {
                      const isSelected = formData.competencias.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCompetenciaChange(c.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '600' : '500',
                            backgroundColor: isSelected ? '#2563eb' : '#f8fafc',
                            color: isSelected ? 'white' : '#475569',
                            border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSelected && <span>✓</span>}
                          {c.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </form>
    </>
  );
}
