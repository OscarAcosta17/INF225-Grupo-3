import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getFileUrl } from '../config/api';

const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconLogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>;
const IconLocation = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconMoney = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const IconClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconBriefcase = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAlertTriangle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconCheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconChevronDown = ({ rotated }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const obtenerSoloFechaISO = (fechaStr) => {
  if (!fechaStr) return '';
  const texto = String(fechaStr).trim();
  const match = texto.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
};

const formatearFechaSoloDia = (fechaStr) => {
  const iso = obtenerSoloFechaISO(fechaStr);
  if (!iso) return 'Sin fecha';
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
};

const obtenerHoyChileISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());

const esFechaVencida = (fechaStr) => {
  const iso = obtenerSoloFechaISO(fechaStr);
  return Boolean(iso && iso < obtenerHoyChileISO());
};

const esOfertaCaducada = (oferta) => Boolean(oferta && (oferta.activa === false || esFechaVencida(oferta.fecha_cierre)));

const esPostulacionCaducada = (post) => Boolean(
  post && (
    post.estado === 'Sin respuesta oferta caducada' ||
    post.estado === 'No válida: oferta vencida' ||
    (post.estado === 'Pendiente' && post.puede_decidir === false)
  )
);

const obtenerEstiloEstadoPost = (estado) => {
  if (estado === 'Aceptado' || estado === 'Aceptada') {
    return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
  }
  if (estado === 'Rechazado' || estado === 'Rechazada') {
    return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
  }
  if (estado === 'Pendiente') {
    return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
  }
  return { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
};

export default function MisOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const [postulacionesEmpresa, setPostulacionesEmpresa] = useState([]);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [bloqueActivo, setBloqueActivo] = useState(null);
  const [filtroPostulaciones, setFiltroPostulaciones] = useState('todas');
  const [ofertaPostulantes, setOfertaPostulantes] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [cargandoPostulantes, setCargandoPostulantes] = useState(false);
  const [errorPostulantes, setErrorPostulantes] = useState('');
  const [postulacionEnProceso, setPostulacionEnProceso] = useState(null);
  const navigate = useNavigate();
  const usuario = useMemo(() => JSON.parse(localStorage.getItem('usuario')), []);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'empresa') {
      navigate('/login');
      return;
    }

    let activo = true;

    Promise.all([
      fetch(apiUrl(`/api/ofertas?empresa_id=${usuario.id}`)).then(res => res.json()).catch(() => []),
      fetch(apiUrl(`/api/postulaciones/empresa/${usuario.id}`)).then(res => (res.ok ? res.json() : [])).catch(() => [])
    ])
      .then(([ofertasData, postulacionesData]) => {
        if (!activo) return;
        setOfertas(Array.isArray(ofertasData) ? ofertasData : []);
        setPostulacionesEmpresa(Array.isArray(postulacionesData) ? postulacionesData : []);
      })
      .finally(() => {
        if (activo) setCargandoResumen(false);
      });

    return () => {
      activo = false;
    };
  }, [usuario, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const verPostulantes = async (oferta) => {
    setOfertaPostulantes(oferta);
    setPostulantes([]);
    setErrorPostulantes('');
    setCargandoPostulantes(true);
    try {
      const response = await fetch(apiUrl(`/api/postulaciones/oferta/${oferta.id}/empresa/${usuario.id}`));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los postulantes');
      setPostulantes(data);
    } catch (error) {
      setErrorPostulantes(error.message);
    } finally {
      setCargandoPostulantes(false);
    }
  };

  const decidirPostulacion = async (postulante, estado) => {
    const decision = estado === 'Aceptado' ? 'aceptar' : 'rechazar';
    const confirmado = window.confirm(`¿Confirmas que deseas ${decision} a este postulante? Esta decisión solo se puede realizar una vez.`);
    if (!confirmado) return;

    setPostulacionEnProceso(postulante.id);
    try {
      const response = await fetch(apiUrl(`/api/postulaciones/${postulante.id}/decision`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: usuario.id, estado })
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || 'No se pudo guardar la decisión');
        error.status = response.status;
        throw error;
      }

      setPostulantes(actuales => actuales.map(item =>
        item.id === postulante.id ? { ...item, estado: data.data.estado, puede_decidir: false } : item
      ));
      setPostulacionesEmpresa(actuales => actuales.map(item =>
        item.id === postulante.id ? { ...item, estado: data.data.estado, puede_decidir: false } : item
      ));
      if (data.advertencia) {
        window.alert(data.advertencia);
      } else {
        window.alert(data.mensaje);
      }
    } catch (error) {
      window.alert(error.message);
      if (error.status === 409 && ofertaPostulantes) {
        verPostulantes(ofertaPostulantes);
      }
    } finally {
      setPostulacionEnProceso(null);
    }
  };

  const postulacionesPendientes = postulacionesEmpresa.filter(p => p.estado === 'Pendiente' && p.puede_decidir !== false);
  const ofertasConPostulantes = new Set(postulacionesEmpresa.map(p => p.oferta_id)).size;
  const ofertasCaducadas = ofertas.filter(esOfertaCaducada);
  const postulacionesCaducadas = postulacionesEmpresa.filter(esPostulacionCaducada);
  const totalCaducado = ofertasCaducadas.length + postulacionesCaducadas.length;
  const postulacionesVisibles = filtroPostulaciones === 'pendientes'
    ? postulacionesPendientes
    : postulacionesEmpresa;

  const abrirOfertaDesdeResumen = (ofertaId, tituloFallback) => {
    const oferta = ofertas.find(o => o.id === ofertaId) || { id: ofertaId, titulo: tituloFallback };
    verPostulantes(oferta);
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

        {/* Bloques interactivos de resumen superior */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: bloqueActivo ? '16px' : '28px' }}>
          <button
            type="button"
            onClick={() => setBloqueActivo(prev => (prev === 'postulaciones' ? null : 'postulaciones'))}
            aria-expanded={bloqueActivo === 'postulaciones'}
            style={{
              textAlign: 'left',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px 22px',
              border: bloqueActivo === 'postulaciones' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              boxShadow: bloqueActivo === 'postulaciones' ? '0 8px 20px -6px rgba(37, 99, 235, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: postulacionesPendientes.length > 0 ? '#eff6ff' : '#f1f5f9',
                color: postulacionesPendientes.length > 0 ? '#2563eb' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconUsers />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    Postulaciones recibidas
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    backgroundColor: postulacionesPendientes.length > 0 ? '#fef3c7' : '#dcfce7',
                    color: postulacionesPendientes.length > 0 ? '#92400e' : '#166534',
                    border: `1px solid ${postulacionesPendientes.length > 0 ? '#fde68a' : '#bbf7d0'}`
                  }}>
                    {cargandoResumen
                      ? 'Cargando...'
                      : postulacionesPendientes.length > 0
                        ? `${postulacionesPendientes.length} ${postulacionesPendientes.length === 1 ? 'pendiente' : 'pendientes'}`
                        : 'Sin pendientes'}
                  </span>
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                  {cargandoResumen
                    ? 'Consultando postulaciones...'
                    : postulacionesEmpresa.length === 0
                      ? 'Aún nadie ha postulado a tus ofertas'
                      : `${postulacionesEmpresa.length} ${postulacionesEmpresa.length === 1 ? 'postulación' : 'postulaciones'} en ${ofertasConPostulantes} ${ofertasConPostulantes === 1 ? 'práctica' : 'prácticas'}`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '0.82rem', fontWeight: '700', flexShrink: 0 }}>
              <span>{bloqueActivo === 'postulaciones' ? 'Ocultar' : 'Ver detalle'}</span>
              <IconChevronDown rotated={bloqueActivo === 'postulaciones'} />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setBloqueActivo(prev => (prev === 'caducidad' ? null : 'caducidad'))}
            aria-expanded={bloqueActivo === 'caducidad'}
            style={{
              textAlign: 'left',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px 22px',
              border: bloqueActivo === 'caducidad' ? '2px solid #0f172a' : '1px solid #e2e8f0',
              boxShadow: bloqueActivo === 'caducidad' ? '0 8px 20px -6px rgba(15, 23, 42, 0.16)' : '0 4px 6px -1px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: totalCaducado > 0 ? '#fef2f2' : '#f0fdf4',
                color: totalCaducado > 0 ? '#dc2626' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {totalCaducado > 0 ? <IconAlertTriangle /> : <IconCheckCircle />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                    Estado de caducidad
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    backgroundColor: totalCaducado > 0 ? '#fee2e2' : '#dcfce7',
                    color: totalCaducado > 0 ? '#991b1b' : '#166534',
                    border: `1px solid ${totalCaducado > 0 ? '#fecaca' : '#bbf7d0'}`
                  }}>
                    {cargandoResumen
                      ? 'Cargando...'
                      : totalCaducado > 0
                        ? `${totalCaducado} ${totalCaducado === 1 ? 'alerta' : 'alertas'}`
                        : 'Todo vigente'}
                  </span>
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                  {cargandoResumen
                    ? 'Revisando vigencias...'
                    : totalCaducado === 0
                      ? 'No hay ofertas ni postulaciones caducadas'
                      : `${ofertasCaducadas.length} ${ofertasCaducadas.length === 1 ? 'oferta caducada' : 'ofertas caducadas'} • ${postulacionesCaducadas.length} ${postulacionesCaducadas.length === 1 ? 'postulación vencida' : 'postulaciones vencidas'}`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.82rem', fontWeight: '700', flexShrink: 0 }}>
              <span>{bloqueActivo === 'caducidad' ? 'Ocultar' : 'Ver detalle'}</span>
              <IconChevronDown rotated={bloqueActivo === 'caducidad'} />
            </div>
          </button>
        </div>

        {/* Panel desplegable del bloque seleccionado */}
        {bloqueActivo === 'postulaciones' && (
          <section style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '22px', marginBottom: '28px', boxShadow: '0 10px 25px -10px rgba(15, 23, 42, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>
                  Quién ha postulado y a qué práctica
                </h4>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Haz clic en «Revisar» para abrir al postulante dentro de la oferta y aceptar o rechazar.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFiltroPostulaciones('todas')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: filtroPostulaciones === 'todas' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: filtroPostulaciones === 'todas' ? '#eff6ff' : 'white',
                    color: filtroPostulaciones === 'todas' ? '#1d4ed8' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Todas ({postulacionesEmpresa.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroPostulaciones('pendientes')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: filtroPostulaciones === 'pendientes' ? '1px solid #d97706' : '1px solid #cbd5e1',
                    backgroundColor: filtroPostulaciones === 'pendientes' ? '#fef3c7' : 'white',
                    color: filtroPostulaciones === 'pendientes' ? '#92400e' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Pendientes ({postulacionesPendientes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBloqueActivo(null)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            {postulacionesVisibles.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem' }}>
                {filtroPostulaciones === 'pendientes'
                  ? 'No tienes postulaciones pendientes por revisar.'
                  : 'Todavía no hay postulaciones registradas en tus ofertas.'}
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {postulacionesVisibles.map(p => {
                  const badge = obtenerEstiloEstadoPost(p.estado);
                  const nombreEstudiante = [p.nombres, p.apellidos].filter(Boolean).join(' ') || 'Estudiante';
                  return (
                    <div
                      key={p.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <div style={{ minWidth: '220px', flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.94rem' }}>
                          {nombreEstudiante}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                          Práctica: <strong style={{ color: '#1e293b' }}>{p.oferta_titulo}</strong> • Postulado el {formatearFechaSoloDia(p.fecha_postulacion)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          {p.estado}
                        </span>
                        <button
                          type="button"
                          onClick={() => abrirOfertaDesdeResumen(p.oferta_id, p.oferta_titulo)}
                          style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: 'white', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Revisar en oferta
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {bloqueActivo === 'caducidad' && (
          <section style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '22px', marginBottom: '28px', boxShadow: '0 10px 25px -10px rgba(15, 23, 42, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>
                  Detalle de ofertas y postulaciones caducadas
                </h4>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Revisa prácticas cerradas por fecha límite, desactivadas o postulaciones cuyo plazo expiró.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBloqueActivo(null)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>

            {totalCaducado === 0 ? (
              <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9rem', fontWeight: '600' }}>
                Todo está vigente: no tienes ofertas caducadas ni postulaciones con plazo vencido.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '18px' }}>
                {ofertasCaducadas.length > 0 && (
                  <div>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '700', color: '#991b1b' }}>
                      Ofertas caducadas o cerradas ({ofertasCaducadas.length})
                    </h5>
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                      {ofertasCaducadas.map(o => {
                        const fechaVencida = esFechaVencida(o.fecha_cierre);
                        const desactivada = o.activa === false;
                        const motivo = fechaVencida && desactivada
                          ? 'Fecha límite vencida y desactivada'
                          : fechaVencida
                            ? 'Fecha límite vencida'
                            : 'Desactivada';
                        return (
                          <div
                            key={o.id}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '11px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
                          >
                            <div>
                              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>{o.titulo}</div>
                              <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '2px' }}>
                                {motivo} • Cierre: {formatearFechaSoloDia(o.fecha_cierre)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => verPostulantes(o)}
                              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: 'white', color: '#991b1b', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Ver postulantes
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {postulacionesCaducadas.length > 0 && (
                  <div>
                    <h5 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '700', color: '#9a3412' }}>
                      Postulaciones caducadas o sin respuesta ({postulacionesCaducadas.length})
                    </h5>
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {postulacionesCaducadas.map(p => (
                        <div
                          key={p.id}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '11px 14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}
                        >
                          <div>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>
                              {[p.nombres, p.apellidos].filter(Boolean).join(' ') || 'Estudiante'} — {p.oferta_titulo}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#9a3412', marginTop: '2px' }}>
                              Estado: <strong>{p.estado}</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => abrirOfertaDesdeResumen(p.oferta_id, p.oferta_titulo)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fed7aa', backgroundColor: 'white', color: '#9a3412', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Ver oferta
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

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
              const cerrada = esOfertaCaducada(o);
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
                      <span>Cierre de postulaciones: <strong style={{ color: '#334155' }}>{formatearFechaSoloDia(o.fecha_cierre)}</strong></span>
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
                  <div style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => verPostulantes(o)}
                      style={{ width: '100%', padding: '10px 16px', backgroundColor: 'white', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      Ver postulantes
                    </button>
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

      {ofertaPostulantes && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <section style={{ width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', backgroundColor: 'white', borderRadius: '16px', padding: '26px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>Postulantes</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b' }}>{ofertaPostulantes.titulo}</p>
              </div>
              <button onClick={() => setOfertaPostulantes(null)} aria-label="Cerrar" style={{ border: 0, background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            {cargandoPostulantes ? <p style={{ color: '#64748b' }}>Cargando postulantes...</p> : errorPostulantes ? <p role="alert" style={{ color: '#b91c1c' }}>{errorPostulantes}</p> : postulantes.length === 0 ? <p style={{ color: '#64748b' }}>Esta oferta aún no tiene postulantes.</p> : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {postulantes.map((postulante) => (
                  <article key={postulante.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                    <strong style={{ color: '#0f172a' }}>{[postulante.nombres, postulante.apellidos].filter(Boolean).join(' ') || 'Estudiante'}</strong>
                    <p style={{ margin: '8px 0 0', color: '#475569' }}>Correo: <a href={`mailto:${postulante.correo_contacto}`}>{postulante.correo_contacto}</a></p>
                    <p style={{ margin: '4px 0', color: '#475569' }}>Teléfono: <a href={`tel:${postulante.telefono}`}>{postulante.telefono}</a></p>
                    {postulante.cv_path ? (
                      <p style={{ margin: '4px 0 8px' }}><a href={getFileUrl(postulante.cv_path)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600' }}>Abrir currículum (PDF)</a></p>
                    ) : <p style={{ margin: '4px 0 8px', color: '#64748b' }}>Sin CV adjunto</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <small style={{ color: '#64748b' }}>Estado: {postulante.estado}</small>
                      {postulante.estado === 'Pendiente' && postulante.puede_decidir !== false && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            disabled={postulacionEnProceso === postulante.id}
                            onClick={() => decidirPostulacion(postulante, 'Aceptado')}
                            style={{ padding: '7px 12px', backgroundColor: '#15803d', color: 'white', border: 0, borderRadius: '6px', fontWeight: '600', cursor: postulacionEnProceso === postulante.id ? 'wait' : 'pointer', opacity: postulacionEnProceso === postulante.id ? 0.65 : 1 }}
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            disabled={postulacionEnProceso === postulante.id}
                            onClick={() => decidirPostulacion(postulante, 'Rechazado')}
                            style={{ padding: '7px 12px', backgroundColor: '#b91c1c', color: 'white', border: 0, borderRadius: '6px', fontWeight: '600', cursor: postulacionEnProceso === postulante.id ? 'wait' : 'pointer', opacity: postulacionEnProceso === postulante.id ? 0.65 : 1 }}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                      {postulante.estado === 'Pendiente' && postulante.puede_decidir === false && (
                        <small style={{ color: '#b45309' }}>El plazo de decisión terminó; el estado se actualizará automáticamente.</small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

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
