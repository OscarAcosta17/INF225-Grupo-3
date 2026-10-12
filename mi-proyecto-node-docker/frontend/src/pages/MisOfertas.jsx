import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div style={{ width: '100%' }}>
      <header className="nav-header">
        <div>
          <h2 style={{ margin: 0 }}>Portal Empresa</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{usuario?.nombre_empresa}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/publicar-oferta')} style={{ backgroundColor: 'var(--success)' }}>
            + Publicar Oferta
          </button>
          <button onClick={handleLogout} style={{ backgroundColor: 'var(--danger)' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Tus Ofertas Publicadas</h3>
      </div>

      {ofertas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Aún no has publicado ninguna oferta de práctica.</p>
          <button onClick={() => navigate('/publicar-oferta')} style={{ marginTop: '1rem' }}>
            Comenzar ahora
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {ofertas.map(o => (
            <div key={o.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{o.titulo}</h4>
                {new Date(o.fecha_cierre) < new Date() ? (
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Cerrada</span>
                ) : (
                  <button onClick={() => navigate(`/editar-oferta/${o.id}`)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Editar
                  </button>
                )}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Fecha límite:</strong> {new Date(o.fecha_cierre).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.8rem' }}>
                {o.modalidad && <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>{o.modalidad}</span>}
                {o.localidad && <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>📍 {o.localidad}</span>}
                {o.remuneracion && <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}> {o.remuneracion}</span>}
                {o.duracion && <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>⏱️ {o.duracion}</span>}
              </div>

              <p style={{ fontSize: '0.9rem', margin: 0 }}>{o.descripcion}</p>
              
              <div style={{ marginTop: 'auto', pt: '10px' }}>
                <strong>Competencias:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {o.competencias.map((comp, idx) => (
                    <span key={idx} className="badge">{comp}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
