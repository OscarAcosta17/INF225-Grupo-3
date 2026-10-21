import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>;
const IconLocation = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconMoney = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconBriefcase = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

export default function MisOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuario || usuario.rol !== 'empresa') {
      navigate('/login');
      return;
    }

    fetch(`/api/ofertas?empresa_id=${usuario.id}`)
      .then(res => res.json())
      .then(data => setOfertas(data))
      .catch(err => console.error(err));
  }, [usuario, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '50px', fontFamily: 'sans-serif' }}>
      
      {/* Header Superior en sinergia con Perfil */}
      <header style={{ minHeight: '90px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <IconBuilding />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>Portal Empresa</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
              {usuario?.nombre_empresa} • Gestión de Vacantes
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/publicar-oferta')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <IconPlus /> Publicar Oferta
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <IconLogOut /> Salir
          </button>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '35px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Tus Ofertas Publicadas</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Administra y actualiza la información de las prácticas ofrecidas por tu organización.
            </p>
          </div>
          <span style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            {ofertas.length} {ofertas.length === 1 ? 'oferta' : 'ofertas'}
          </span>
        </div>

        {ofertas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconBuilding />
            </div>
            <h4 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700' }}>Aún no has publicado ofertas</h4>
            <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '0.95rem' }}>Publica tu primera vacante de práctica para conectar con estudiantes de la USM.</p>
            <button
              onClick={() => navigate('/publicar-oferta')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
            >
              <IconPlus /> Comenzar ahora
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {ofertas.map(o => {
              const cerrada = new Date(o.fecha_cierre) < new Date();
              return (
                <div
                  key={o.id}
                  style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s', overflow: 'hidden' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.07)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; }}
                >
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Encabezado de la tarjeta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: '700', lineHeight: '1.35' }}>
                        {o.titulo}
                      </h4>
                      {cerrada ? (
                        <span style={{ flexShrink: 0, fontSize: '0.75rem', color: '#b91c1c', backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                          Cerrada
                        </span>
                      ) : (
                        <span style={{ flexShrink: 0, fontSize: '0.75rem', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                          Activa
                        </span>
                      )}
                    </div>

                    {/* Fecha límite */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', color: '#64748b', fontWeight: '500', marginBottom: '16px' }}>
                      <IconCalendar />
                      <span>Cierre de postulaciones: <strong style={{ color: '#334155' }}>{new Date(o.fecha_cierre).toLocaleDateString()}</strong></span>
                    </div>

                    {/* Atributos (Sin emojis, con íconos SVG limpios) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {o.modalidad && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                          <IconBriefcase /> {o.modalidad}
                        </span>
                      )}
                      {o.localidad && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                          <IconLocation /> {o.localidad}
                        </span>
                      )}
                      {o.remuneracion && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                          <IconMoney /> {o.remuneracion}
                        </span>
                      )}
                      {o.duracion && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                          <IconClock /> {o.duracion}
                        </span>
                      )}
                    </div>

                    {/* Descripción */}
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {o.descripcion}
                    </p>

                    {/* Competencias requeridas */}
                    <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Competencias Requeridas
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Array.isArray(o.competencias) && o.competencias.map((comp, idx) => (
                          <span key={idx} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Footer de acción (igual a VerOfertas) */}
                  <div style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    {cerrada ? (
                      <button
                        disabled
                        style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', cursor: 'not-allowed' }}
                      >
                        Período de edición finalizado
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/editar-oferta/${o.id}`)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
                      >
                        <IconEdit /> Editar Oferta
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
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
