import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IconLocation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconBuilding = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>;
const IconMoney = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconSparkles = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

export default function VerOfertas() {
  const [viewMode, setViewMode] = useState(null); 
  
  const [ofertas, setOfertas] = useState([]);
  const [todasCompetencias, setTodasCompetencias] = useState([]);
  const [misCompetenciasNombres, setMisCompetenciasNombres] = useState([]);
  const [misPostulacionesIds, setMisPostulacionesIds] = useState([]); // Nuevo estado para postulaciones
  const [filtrosCompetencias, setFiltrosCompetencias] = useState([]);
  const [filtrosRS3, setFiltrosRS3] = useState({ localidad: '', modalidad: '', remuneracion: '', duracion: '' });
  const [loading, setLoading] = useState(false);
  
  // Estado para modales
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [matchSeleccionado, setMatchSeleccionado] = useState(null); // Modal de match
  
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    
    fetch('/api/competencias')
      .then(res => res.json())
      .then(data => setTodasCompetencias(data));
      
    if (usuario.rol === 'estudiante' && usuario.id) {
      fetch(`/api/competencias/estudiante/${usuario.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMisCompetenciasNombres(data.map(c => c.nombre));
        })
        .catch(err => console.error("Error cargando mis competencias:", err));

      // Fetch postulaciones
      fetch(`/api/postulaciones/estudiante/${usuario.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMisPostulacionesIds(data.map(p => p.oferta_id));
        })
        .catch(err => console.error("Error cargando postulaciones:", err));
    }
  }, [usuario, navigate]);

  useEffect(() => {
    if (viewMode !== null) {
      cargarOfertas(filtrosCompetencias, filtrosRS3, viewMode);
    }
  }, [viewMode, filtrosCompetencias, filtrosRS3]);

  const cargarOfertas = (competenciasIds, rs3, mode) => {
    setLoading(true);
    let url = `/api/ofertas?`;
    
    if (mode === 'personalizadas') url += `estudiante_id=${usuario.id}&`;
    if (competenciasIds.length > 0) url += `competencias_filtro=${competenciasIds.join(',')}&`;
    if (rs3.localidad) url += `localidad=${rs3.localidad}&`;
    if (rs3.modalidad) url += `modalidad=${rs3.modalidad}&`;
    if (rs3.remuneracion) url += `remuneracion=${rs3.remuneracion}&`;
    if (rs3.duracion) url += `duracion=${rs3.duracion}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => { setOfertas(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleToggleFiltroCompetencia = (id) => {
    setFiltrosCompetencias(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleFiltroRS3Change = (e) => {
    setFiltrosRS3(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePostular = async (ofertaId, confirmarSinRequisitos = false) => {
    try {
      const response = await fetch('/api/postulaciones/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: usuario.id, oferta_id: ofertaId, confirmarSinRequisitos })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.requiereConfirmacion) {
          if (window.confirm(`${data.mensaje} ¿Deseas postular de todas formas?`)) {
            handlePostular(ofertaId, true);
          }
        } else {
          alert('¡Postulación exitosa!');
          setMisPostulacionesIds(prev => [...prev, ofertaId]); // Actualizar estado UI inmediatamente
          setOfertaSeleccionada(null); // Cerrar modal al postular
        }
      } else {
        alert(data.error || 'Error al postular');
      }
    } catch (error) {
      alert(`Error al procesar la postulación: ${error.message}`);
    }
  };

  // PANTALLA INICIAL
  if (viewMode === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        
        {/* Botón Volver Rediseñado */}
        <button 
          onClick={() => navigate('/perfil')} 
          style={{ position: 'absolute', top: '30px', left: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#475569'; }}
        >
          <IconUser /> Volver a mi perfil
        </button>

        <h1 style={{ color: '#0f172a', marginBottom: '10px', fontSize: '2.5rem', fontWeight: '800' }}>Catálogo de Prácticas</h1>
        <p style={{ color: '#64748b', marginBottom: '50px', fontSize: '1.1rem' }}>Selecciona tu modo de exploración</p>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => setViewMode('todas')}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
              padding: '40px', width: '300px', backgroundColor: 'white', 
              border: '2px solid transparent', borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
              <IconGlobe />
            </div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>Ver todas las ofertas</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Explora el catálogo completo sin filtros predeterminados.</p>
          </button>

          <button 
            onClick={() => setViewMode('personalizadas')}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
              padding: '40px', width: '300px', backgroundColor: 'white', 
              border: '2px solid transparent', borderRadius: '16px', cursor: 'pointer',
              transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ padding: '20px', backgroundColor: '#f5f3ff', borderRadius: '50%', color: '#8b5cf6' }}>
              <IconSparkles />
            </div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>Ofertas personalizadas</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>Descubre ofertas recomendadas según tus competencias.</p>
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA DE CATÁLOGO
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '50px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => { setViewMode(null); setFiltrosCompetencias([]); setFiltrosRS3({localidad:'', modalidad:'', remuneracion:'', duracion:''}); }} 
              style={{ padding: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                {viewMode === 'personalizadas' ? <><IconSparkles /> Personalizadas para ti</> : <><IconGlobe /> Todas las Ofertas</>}
              </h2>
              {viewMode === 'personalizadas' && (
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                  Ofertas ordenadas por afinidad técnica según tus competencias configuradas.
                </p>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/perfil')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#475569'; }}
          >
            <IconUser /> Volver al perfil
          </button>
        </header>

        {/* Panel de Filtros - Más limpio */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconLocation /> Localidad
              </label>
              <select name="localidad" value={filtrosRS3.localidad} onChange={handleFiltroRS3Change} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500' }}>
                <option value="">Cualquier ubicación</option>
                <option value="Santiago">Santiago</option>
                <option value="Valparaíso">Valparaíso</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconBuilding /> Modalidad
              </label>
              <select name="modalidad" value={filtrosRS3.modalidad} onChange={handleFiltroRS3Change} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500' }}>
                <option value="">Cualquier modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconMoney /> Remuneración
              </label>
              <select name="remuneracion" value={filtrosRS3.remuneracion} onChange={handleFiltroRS3Change} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500' }}>
                <option value="">Todas</option>
                <option value="Pagada">Pagada</option>
                <option value="No pagada">No pagada</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconClock /> Duración
              </label>
              <select name="duracion" value={filtrosRS3.duracion} onChange={handleFiltroRS3Change} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500' }}>
                <option value="">Cualquier duración</option>
                <option value="1 mes">1 mes</option>
                <option value="2 meses">2 meses</option>
                <option value="3 meses">3 meses</option>
                <option value="6 meses">6 meses</option>
              </select>
            </div>
          </div>

          <details style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: '600', userSelect: 'none', outline: 'none' }}>
              + Filtros avanzados por competencia técnica
            </summary>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '15px' }}>
              {todasCompetencias.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleToggleFiltroCompetencia(c.id)}
                  style={{
                    padding: '6px 12px', fontSize: '0.8rem',
                    backgroundColor: filtrosCompetencias.includes(c.id) ? '#3b82f6' : 'white',
                    color: filtrosCompetencias.includes(c.id) ? 'white' : '#475569',
                    borderRadius: '20px', border: `1px solid ${filtrosCompetencias.includes(c.id) ? '#3b82f6' : '#cbd5e1'}`,
                    cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500'
                  }}
                >
                  {c.nombre}
                </button>
              ))}
              {filtrosCompetencias.length > 0 && (
                <button 
                  onClick={() => setFiltrosCompetencias([])}
                  style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginLeft: '8px' }}
                >
                  Limpiar competencias
                </button>
              )}
            </div>
          </details>
        </div>

        {/* Resultados */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (!Array.isArray(ofertas) || ofertas.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '1.2rem' }}>No se encontraron ofertas</h3>
            <p style={{ color: '#64748b' }}>Intenta ajustar los filtros para encontrar más opciones.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {ofertas.map(o => {
              const yaPostulo = misPostulacionesIds.includes(o.id);
              return (
              <div key={o.id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s', ':hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transform: 'translateY(-4px)' } }}>
                
                <div style={{ padding: '24px', flex: '1', position: 'relative' }}>
                  {yaPostulo && (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Postulada
                    </div>
                  )}
                  {o.coincidencia !== undefined && viewMode === 'personalizadas' && (
                    <div style={{ marginBottom: '12px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMatchSeleccionado(o); }}
                        style={{ 
                          backgroundColor: o.coincidencia >= 80 ? '#dcfce7' : o.coincidencia >= 50 ? '#fef3c7' : '#fee2e2',
                          color: o.coincidencia >= 80 ? '#166534' : o.coincidencia >= 50 ? '#92400e' : '#991b1b',
                          padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                          border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'transform 0.1s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <IconSparkles /> {Math.round(o.coincidencia)}% Match
                      </button>
                    </div>
                  )}
                  <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.2rem', lineHeight: '1.4', paddingRight: yaPostulo ? '90px' : '0' }}>{o.titulo}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500', marginBottom: '16px' }}>
                    <IconBuilding /> {o.nombre_empresa}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{o.localidad || 'N/A'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{o.modalidad || 'N/A'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{o.remuneracion || 'N/A'}</span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {o.descripcion}
                  </p>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: yaPostulo ? '#f0fdf4' : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <button 
                    onClick={() => setOfertaSeleccionada(o)}
                    style={{ width: '100%', padding: '10px 20px', backgroundColor: yaPostulo ? '#166534' : '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = yaPostulo ? '#14532d' : '#1e293b'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = yaPostulo ? '#166534' : '#0f172a'; }}
                  >
                    {yaPostulo ? 'Ya Postulaste (Ver Detalles)' : 'Ver Detalles y Postular'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* POPUP / MODAL DE DETALLE DE OFERTA */}
      {ofertaSeleccionada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            
            <button 
              onClick={() => setOfertaSeleccionada(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}><IconBuilding /></div>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>{ofertaSeleccionada.nombre_empresa}</h3>
              </div>
              
              <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.8rem' }}>{ofertaSeleccionada.titulo}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}><IconLocation /> <strong>Localidad:</strong> {ofertaSeleccionada.localidad}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}><IconBuilding /> <strong>Modalidad:</strong> {ofertaSeleccionada.modalidad}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}><IconMoney /> <strong>Remuneración:</strong> {ofertaSeleccionada.remuneracion}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}><IconClock /> <strong>Duración:</strong> {ofertaSeleccionada.duracion}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}><IconCalendar /> <strong>Cierre:</strong> {new Date(ofertaSeleccionada.fecha_cierre).toLocaleDateString()}</div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.1rem' }}>Descripción de la oferta</h4>
                <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>{ofertaSeleccionada.descripcion}</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.1rem' }}>Requisitos Técnicos</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ofertaSeleccionada.competencias.map((comp, idx) => {
                    const loTengo = misCompetenciasNombres.includes(comp);
                    return (
                      <span key={idx} style={{ 
                        padding: '6px 12px', backgroundColor: loTengo ? '#dcfce7' : '#f1f5f9', 
                        color: loTengo ? '#15803d' : '#475569', border: `1px solid ${loTengo ? '#bbf7d0' : '#e2e8f0'}`, 
                        borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' 
                      }}>
                        {loTengo ? '✓ ' : ''}{comp}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 30px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setOfertaSeleccionada(null)}
                style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cerrar
              </button>
              {(() => {
                const yaPostuloModal = misPostulacionesIds.includes(ofertaSeleccionada.id);
                if (yaPostuloModal) {
                  return (
                    <button 
                      disabled
                      style={{ padding: '12px 24px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: '700', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Postulación Enviada
                    </button>
                  );
                }
                return (
                  <button 
                    onClick={() => handlePostular(ofertaSeleccionada.id)}
                    style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                  >
                    Confirmar Postulación
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL DE EXPLICACIÓN DE MATCH */}
      {matchSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button 
              onClick={() => setMatchSeleccionado(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: matchSeleccionado.coincidencia >= 80 ? '#dcfce7' : matchSeleccionado.coincidencia >= 50 ? '#fef3c7' : '#fee2e2', color: matchSeleccionado.coincidencia >= 80 ? '#166534' : matchSeleccionado.coincidencia >= 50 ? '#92400e' : '#991b1b', borderRadius: '50%', marginBottom: '15px' }}>
                <IconSparkles />
              </div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>{Math.round(matchSeleccionado.coincidencia)}% de Coincidencia</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
                Nuestro algoritmo comparó tus habilidades con las requeridas por <strong>{matchSeleccionado.nombre_empresa}</strong>.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>Lo que tienes a favor:</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {matchSeleccionado.competencias.filter(c => misCompetenciasNombres.includes(c)).length > 0 ? 
                  matchSeleccionado.competencias.filter(c => misCompetenciasNombres.includes(c)).map((c, i) => (
                    <span key={i} style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>✓ {c}</span>
                  )) : <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ninguna de las requeridas directamente.</span>
                }
              </div>

              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>Lo que podrías mejorar:</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {matchSeleccionado.competencias.filter(c => !misCompetenciasNombres.includes(c)).length > 0 ? 
                  matchSeleccionado.competencias.filter(c => !misCompetenciasNombres.includes(c)).map((c, i) => (
                    <span key={i} style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>{c}</span>
                  )) : <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>¡Tienes todo lo que buscan!</span>
                }
              </div>
            </div>

            <button 
              onClick={() => { setOfertaSeleccionada(matchSeleccionado); setMatchSeleccionado(null); }}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
            >
              Ver Detalles de la Oferta
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Custom Scrollbar for VerOfertas */
        ::-webkit-scrollbar {
          width: 16px;
          height: 16px;
        }
        ::-webkit-scrollbar-track {
          background: #ffffff;
        }
        ::-webkit-scrollbar-thumb {
          background: #0f172a;
          border-radius: 10px;
          border: 3px solid #ffffff;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #1e293b;
        }
        ::-webkit-scrollbar-thumb:active {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}
