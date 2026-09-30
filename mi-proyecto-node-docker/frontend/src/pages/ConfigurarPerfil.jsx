import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IconUserCheck = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>;
const IconSave = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

export default function ConfigurarPerfil() {
  const [competencias, setCompetencias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    // Si el usuario guardado no tiene ID o es de una sesión antigua (ghost user)
    if (!usuarioLocal || !usuarioLocal.id) {
      localStorage.removeItem('usuario');
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resComp = await fetch('/api/competencias');
        const dataComp = await resComp.json();
        setCompetencias(dataComp);

        const resMisComp = await fetch(`/api/competencias/estudiante/${usuarioLocal.id}`);
        if (resMisComp.ok) {
          const dataMisComp = await resMisComp.json();
          setSeleccionadas(dataMisComp.map(c => c.id));
        } else if (resMisComp.status === 404 || resMisComp.status === 500) {
          // Si el backend da error (ej: usuario borrado de la bd), forzar relogin
          localStorage.removeItem('usuario');
          navigate('/login');
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, [navigate]);

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

    setLoading(true);
    try {
      const response = await fetch('/api/competencias/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: usuarioLocal.id,
          competencias_ids: seleccionadas
        })
      });

      if (response.ok) {
        usuarioLocal.perfil_configurado = true;
        localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
        navigate('/perfil'); 
      } else {
        const data = await response.json();
        setError(data.error || 'Ocurrió un error al guardar. Tu sesión puede haber expirado.');
        if (response.status === 500) {
          // Fallback por si la DB fue reiniciada y el ID ya no existe
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

  // Agrupar competencias por categoría para renderizarlas de forma bonita
  const competenciasPorCategoria = competencias.reduce((acc, comp) => {
    if (!acc[comp.categoria]) acc[comp.categoria] = [];
    acc[comp.categoria].push(comp);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '30px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '50%', color: '#0284c7' }}>
            <IconUserCheck />
          </div>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.8rem' }}>
              {usuarioLocal?.perfil_configurado ? 'Modifica tu Perfil' : 'Configura tu Perfil'}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
              Hola <strong>{usuarioLocal?.nombres}</strong>, selecciona las competencias técnicas y habilidades que manejas para recibir mejores recomendaciones.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
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
