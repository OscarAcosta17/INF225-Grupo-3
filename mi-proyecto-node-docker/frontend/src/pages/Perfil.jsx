import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconCheckCircle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

export default function Perfil() {
  const navigate = useNavigate();
  const [misCompetencias, setMisCompetencias] = useState(() => {
    const saved = sessionStorage.getItem('perfil_competencias');
    return saved ? JSON.parse(saved) : [];
  }); 
  const [misPostulaciones, setMisPostulaciones] = useState(() => {
    const saved = sessionStorage.getItem('perfil_postulaciones');
    return saved ? JSON.parse(saved) : [];
  });
  
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuarioLocal) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const resComp = await fetch(`/api/competencias/estudiante/${usuarioLocal.id}`);
        if (resComp.ok) {
          const data = await resComp.json();
          setMisCompetencias(data);
          sessionStorage.setItem('perfil_competencias', JSON.stringify(data));
        } else if (resComp.status === 404 || resComp.status === 500) {
            localStorage.removeItem('usuario');
            navigate('/login');
        }

        const resPost = await fetch(`/api/postulaciones/estudiante/${usuarioLocal.id}`);
        if (resPost.ok) {
          const data = await resPost.json();
          setMisPostulaciones(data);
          sessionStorage.setItem('perfil_postulaciones', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, [navigate]); 

  const manejarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <>
      <style>{`
        body { 
          margin: 0; padding: 0; 
          background-color: #f8fafc;
        }
        * { box-sizing: border-box; }
        
        .perfil-app {
          width: 100%; height: 100vh;
          display: flex; flex-direction: column; 
          font-family: sans-serif;
          overflow: hidden;
        }
        
        .perfil-body {
          flex: 1; padding: 40px;
          display: flex; gap: 40px; 
          max-width: 1400px; margin: 0 auto; width: 100%;
          overflow: hidden;
        }
        
        .perfil-left {
          flex: 0 0 320px; 
          display: flex; flex-direction: column;
        }
        
        .perfil-right {
          flex: 1; 
          display: flex; flex-direction: column; 
          background-color: white; border-radius: 16px; 
          border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); 
          overflow: hidden; min-width: 0;
        }
        
        .header-actions { display: flex; gap: 12px; }
        .header-title-box { display: flex; alignItems: center; gap: 20px; }
        
        /* Responsive adjustments */
        @media (max-width: 900px) {
          .perfil-app {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .perfil-body {
            flex-direction: column;
            overflow: visible;
            padding: 20px;
            gap: 20px;
          }
          .perfil-left {
            flex: none;
            width: 100%;
          }
          .perfil-right {
            overflow: visible;
          }
          .history-scroll {
            overflow-y: visible !important;
          }
          .header-actions {
            display: none; /* or redesign into a hamburger menu, we hide for brevity if it's too cramped */
          }
        }
      `}</style>
      <div className="perfil-app">
        
        {/* Header Fijo */}
        <div style={{ flexShrink: 0, minHeight: '90px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div className="header-title-box">
            <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
              {usuarioLocal?.nombres?.[0]}
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '700' }}>{usuarioLocal?.nombres} {usuarioLocal?.apellidos}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{usuarioLocal?.correo} • Estudiante</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => navigate('/configurar-perfil')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <IconEdit /> Editar Perfil
            </button>
            <button 
              onClick={() => navigate('/ver-ofertas')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <IconSearch /> Explorar Ofertas
            </button>
            <button 
              onClick={manejarCerrarSesion} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <IconLogOut /> Salir
            </button>
          </div>
        </div>

        {/* Cuerpo principal */}
        <div className="perfil-body">
          
          {/* Columna Izquierda: Competencias Técnicas (Ancho Fijo en Desktop) */}
          <div className="perfil-left">
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                  <span style={{ color: '#3b82f6' }}><IconCheckCircle /></span> Competencias
                </h3>
              </div>
              
              <div style={{ padding: '24px' }}>
                {misCompetencias.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {misCompetencias.map((comp) => (
                      <span 
                        key={comp.id} 
                        style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        {comp.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.85rem' }}>No tienes competencias.</p>
                    <button 
                      onClick={() => navigate('/configurar-perfil')}
                      style={{ padding: '8px 16px', backgroundColor: 'white', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                    >
                      Configurar ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Historial de Postulaciones (Con scroll interno en Desktop) */}
          <div className="perfil-right">
            
            <div style={{ flexShrink: 0, backgroundColor: 'white', padding: '24px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                <span style={{ color: '#8b5cf6' }}><IconClock /></span> Historial de Postulaciones
              </h3>
              <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                {misPostulaciones.length} enviadas
              </span>
            </div>
            
            <div className="history-scroll" style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
              {misPostulaciones.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {misPostulaciones.map((post) => (
                    <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>{post.titulo}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{post.nombre_empresa}</p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ 
                          backgroundColor: post.estado === 'Pendiente' ? '#fefcbf' : '#dcfce7',
                          color: post.estado === 'Pendiente' ? '#744210' : '#166534',
                          border: `1px solid ${post.estado === 'Pendiente' ? '#fde047' : '#bbf7d0'}`,
                          padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {post.estado}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                          Postulado el {new Date(post.fecha_postulacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#64748b' }}>
                    <IconClock />
                  </div>
                  <h4 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '8px' }}>No hay postulaciones recientes</h4>
                  <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1rem' }}>Explora el catálogo y encuentra la práctica ideal para ti.</p>
                  <button 
                    onClick={() => navigate('/ver-ofertas')}
                    style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Explorar Catálogo
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
