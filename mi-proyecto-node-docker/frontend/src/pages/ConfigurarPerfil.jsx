import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IconUserCheck = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>;
const IconSave = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;


export default function ConfigurarPerfil() {
  const [competencias, setCompetencias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [perfilInfo, setPerfilInfo] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    descripcion: '',
    enlace_cv: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuarioLocal || !usuarioLocal.id) {
      localStorage.removeItem('usuario');
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resPerfil = await fetch(`/api/competencias/perfil/${usuarioLocal.id}`);
        if (resPerfil.ok) {
          const dataPerfil = await resPerfil.json();
          setPerfilInfo({
            nombres: dataPerfil.nombres || '',
            apellidos: dataPerfil.apellidos || '',
            correo: dataPerfil.correo || '',
            telefono: dataPerfil.telefono || '',
            descripcion: dataPerfil.descripcion || '',
            enlace_cv: dataPerfil.enlace_cv || '',
            cv_file: null
          });
        }

        const resComp = await fetch('/api/competencias');
        const dataComp = await resComp.json();
        setCompetencias(dataComp);

        const resMisComp = await fetch(`/api/competencias/estudiante/${usuarioLocal.id}`);
        if (resMisComp.ok) {
          const dataMisComp = await resMisComp.json();
          setSeleccionadas(dataMisComp.map(c => c.id));
        } else if (resMisComp.status === 404 || resMisComp.status === 500) {
          localStorage.removeItem('usuario');
          navigate('/login');
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, [navigate]);

  const handleInputChange = (e) => {
    setPerfilInfo({ ...perfilInfo, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (id) => {
    setError('');
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(comp_id => comp_id !== id)); 
    } else {
      setSeleccionadas([...seleccionadas, id]); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioLocal) return;

    if (seleccionadas.length === 0) {
      setError('Debes seleccionar al menos una competencia técnica para continuar.');
      return;
    }

    if (perfilInfo.telefono) {
      const telefonoRegex = /^\+?[0-9\s\-]{8,15}$/;
      if (!telefonoRegex.test(perfilInfo.telefono)) {
        setError('Por favor, ingresa un número de teléfono válido (ej: +56 9 1234 5678).');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('telefono', perfilInfo.telefono);
      formData.append('descripcion', perfilInfo.descripcion);
      if (perfilInfo.cv_file) {
        formData.append('cv_file', perfilInfo.cv_file);
      }

      const resPerfil = await fetch(`/api/competencias/perfil/${usuarioLocal.id}`, {
        method: 'PUT',
        body: formData 
      });

      const resComp = await fetch('/api/competencias/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: usuarioLocal.id,
          competencias_ids: seleccionadas
        })
      });

      if (resPerfil.ok && resComp.ok) {
        usuarioLocal.perfil_configurado = true;
        localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
        navigate('/perfil'); 
      } else {
        setError('Ocurrió un error al guardar. Tu sesión puede haber expirado.');
        if (resComp.status === 500 || resPerfil.status === 500) {
          localStorage.removeItem('usuario');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    } catch (error) {
      setError('Error de red al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const competenciasPorCategoria = competencias.reduce((acc, comp) => {
    if (!acc[comp.categoria]) acc[comp.categoria] = [];
    acc[comp.categoria].push(comp);
    return acc;
  }, {});

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px', fontSize: '0.95rem' };
  const labelStyle = { color: '#475569', fontSize: '0.9rem', fontWeight: '600' };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '30px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '50%', color: '#0284c7' }}>
              <IconUserCheck />
            </div>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.8rem' }}>
                {usuarioLocal?.perfil_configurado ? 'Modifica tu Perfil' : 'Configura tu Perfil'}
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
                Completa tu información de contacto y competencias técnicas.
              </p>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={() => navigate('/perfil')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 16px', backgroundColor: 'white', 
              color: '#475569', border: '1px solid #e2e8f0', 
              borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', 
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#475569'; }}
          >
            <IconUser /> Volver al perfil
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          

          <div style={{ marginBottom: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1.1rem' }}>Datos Institucionales</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Nombres</label>
                <input style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b'}} type="text" value={usuarioLocal?.nombres || perfilInfo.nombres || ''} disabled />
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>

                <input style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b'}} type="text" value={usuarioLocal?.apellidos || perfilInfo.apellidos || ''} disabled />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Correo Electrónico</label>
                <input style={{...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b'}} type="email" value={usuarioLocal?.correo || perfilInfo.correo || ''} disabled />
              </div>
            </div>
          </div>


          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1.1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>Información de Contacto</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input name="telefono" placeholder="+56 9 1234 5678" style={inputStyle} type="text" value={perfilInfo.telefono} onChange={handleInputChange} />
              </div>
              <div>
                <label style={labelStyle}>Currículum (PDF)</label>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {perfilInfo.enlace_cv && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <span>📄 CV actual registrado</span>
                      <a href={`http://localhost:4000${perfilInfo.enlace_cv}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                        Ver PDF
                      </a>
                    </div>
                  )}
                  <input 
                    name="cv_file" 
                    type="file" 
                    accept=".pdf" 
                    style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: 'white' }} 
                    onChange={(e) => setPerfilInfo({ ...perfilInfo, cv_file: e.target.files[0] })} 
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selecciona un archivo nuevo solo si deseas reemplazar el actual.</span>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Breve descripción</label>
                <textarea name="descripcion" placeholder="Cuéntanos un poco sobre ti..." style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} value={perfilInfo.descripcion} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* SECCIÓN COMPETENCIAS */}
          <div style={{ marginTop: '50px', marginBottom: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>
              Competencias Técnicas
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Selecciona las herramientas, lenguajes y tecnologías en las que tienes experiencia.
            </p>
          </div>
          {Object.entries(competenciasPorCategoria).map(([categoria, comps]) => (
            <div key={categoria} style={{ marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1.1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
                {categoria}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {comps.map(comp => {
                  const isSelected = seleccionadas.includes(comp.id);
                  return (
                    <label 
                      key={comp.id} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', 
                        cursor: 'pointer', fontSize: '0.95rem',
                        padding: '12px 16px', borderRadius: '8px',
                        backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                        color: isSelected ? '#1d4ed8' : '#475569',
                        transition: 'all 0.2s',
                        fontWeight: isSelected ? '600' : '400'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(comp.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                      />
                      {comp.nombre}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '30px', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', backgroundColor: loading ? '#94a3b8' : '#2563eb', 
                color: 'white', border: 'none', borderRadius: '8px', 
                fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              <IconSave />
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
