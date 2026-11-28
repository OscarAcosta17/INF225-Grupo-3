import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiUrl, getFileUrl } from '../config/api';

const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBriefcase = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconAward = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const IconCheckCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const IconAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconHistory = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><path d="M12 7v5l4 2"></path></svg>;

const CRITERIOS_LABELS = {
  capacidad: 'Capacidad',
  confianza: 'Confianza',
  aplicacion_esfuerzo: 'Aplicación y esfuerzo',
  adaptabilidad: 'Adaptabilidad',
  iniciativa: 'Iniciativa',
  trabajo_equipo: 'Trabajo en equipo',
  conocimientos: 'Conocimientos técnicos',
  asistencia_puntualidad: 'Asistencia y puntualidad',
  resultados: 'Resultados obtenidos',
  comunicacion_efectiva: 'Comunicación efectiva',
  manejo_tic: 'Manejo de TIC'
};

const FORM_A_INICIAL = {
  tipo_practica: 'industrial',
  empresa_nombre: '',
  empresa_rut: '',
  empresa_direccion: '',
  supervisor_nombre: '',
  supervisor_correo: '',
  supervisor_telefono: '',
  modalidad: 'Presencial',
  fecha_inicio: '',
  fecha_fin: '',
  horas_comprometidas: 360
};

export default function Convalidacion() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [tramites, setTramites] = useState([]);
  const [bitacoraStats, setBitacoraStats] = useState({ horas_acumuladas: 0, dias_registrados: 0 });
  const [practicasAceptadas, setPracticasAceptadas] = useState([]);
  const [postulacionSeleccionadaId, setPostulacionSeleccionadaId] = useState('');
  const [loading, setLoading] = useState(true);

  const [vistaFormulario, setVistaFormulario] = useState('selector');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Controla qué trámite del historial tiene sus detalles desplegados
  const [historialExpandidoId, setHistorialExpandidoId] = useState(null);

  // Formulario Práctica Nueva
  const [formA, setFormA] = useState(FORM_A_INICIAL);

  // Formulario Convalidación Experiencia Previa
  const [formB, setFormB] = useState({
    tipo_practica: 'industrial',
    tipo_experiencia: 'trabajo_profesional',
    empresa_nombre: '',
    empresa_rut: '',
    empresa_direccion: '',
    empresa_unica: false,
    supervisor_nombre: '',
    supervisor_correo: '',
    supervisor_telefono: '',
    modalidad: 'Presencial',
    fecha_inicio: '',
    fecha_fin: '',
    meses_a_convalidar: 2
  });
  const [pdfActividades, setPdfActividades] = useState(null);

  // Estados para acciones dentro del seguimiento
  const [pdfInformeFinal, setPdfInformeFinal] = useState(null);
  const [mostrarApelacion, setMostrarApelacion] = useState(false);
  const [apelacionMotivo, setApelacionMotivo] = useState('');
  const [pdfApelacion, setPdfApelacion] = useState(null);
  const [flujoPendienteConfirmacion, setFlujoPendienteConfirmacion] = useState(null);

  const handleIntentarNuevoTramite = (destinoFlujo) => {
    setErrorMsg('');
    if (tramiteActual?.estado === 'Rechazada' && !tramiteActual?.apelacion_estado) {
      setFlujoPendienteConfirmacion(destinoFlujo);
      return;
    }
    setVistaFormulario(destinoFlujo);
  };

  const handleSeleccionarPracticaAceptada = (postulacionId, listaPracticas = practicasAceptadas) => {
    setPostulacionSeleccionadaId(postulacionId);
    if (!postulacionId) {
      setFormA((prev) => ({
        ...prev,
        empresa_nombre: '',
        supervisor_correo: '',
        modalidad: 'Presencial',
        horas_comprometidas: 360
      }));
      return;
    }

    const seleccionada = listaPracticas.find(
      (p) => String(p.postulacion_id) === String(postulacionId)
    );
    if (!seleccionada) return;

    const modalidadRaw = String(seleccionada.modalidad || '').trim();
    const modalidadNormalizada =
      modalidadRaw === 'Híbrido' || modalidadRaw === 'Hibrido'
        ? 'Hibrido'
        : modalidadRaw === 'Remoto'
          ? 'Remoto'
          : 'Presencial';

    const matchMeses = String(seleccionada.duracion || '').match(/(\d+)/);
    const horasEstimadas = matchMeses
      ? Math.min(720, Math.max(180, Number(matchMeses[1]) * 180))
      : 360;

    setFormA((prev) => ({
      ...prev,
      empresa_nombre: seleccionada.empresa_nombre || prev.empresa_nombre,
      supervisor_correo: seleccionada.supervisor_correo || prev.supervisor_correo,
      modalidad: modalidadNormalizada,
      horas_comprometidas: horasEstimadas
    }));
  };

  const handleIniciarDesdeAceptada = (postulacionId, listaPracticas = practicasAceptadas, listaTramites = tramites) => {
    setErrorMsg('');
    handleSeleccionarPracticaAceptada(String(postulacionId), listaPracticas);
    const ultimoTramite = listaTramites.length > 0 ? listaTramites[0] : null;
    if (ultimoTramite?.estado === 'Rechazada' && !ultimoTramite?.apelacion_estado) {
      setFlujoPendienteConfirmacion('flujoA');
      return;
    }
    setVistaFormulario('flujoA');
  };

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const aplicarDatosConvalidacion = (data) => {
    const listaTramites = data.tramites || [];
    const listaAceptadas = data.practicas_aceptadas || [];
    setTramites(listaTramites);
    setBitacoraStats(data.bitacora_actual || { horas_acumuladas: 0, dias_registrados: 0 });
    setPracticasAceptadas(listaAceptadas);

    const postulacionIdParam = searchParams.get('postulacionId');
    if (postulacionIdParam) {
      const tramiteMasReciente = listaTramites.length > 0 ? listaTramites[0] : null;
      const permiteNuevo = !tramiteMasReciente ||
        tramiteMasReciente.estado === 'Aprobada' || (
          tramiteMasReciente.estado === 'Rechazada' &&
          (!tramiteMasReciente.apelacion_estado || tramiteMasReciente.apelacion_estado === 'Resuelta')
        );
      const encontrada = listaAceptadas.some(
        (p) => String(p.postulacion_id) === String(postulacionIdParam)
      );
      if (permiteNuevo && encontrada) {
        handleIniciarDesdeAceptada(postulacionIdParam, listaAceptadas, listaTramites);
      }
      setSearchParams({}, { replace: true });
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/convalidacion/estudiante/${usuario.id}`));
      if (res.ok) {
        aplicarDatosConvalidacion(await res.json());
      }
    } catch (err) {
      console.error('Error cargando datos de convalidación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario || usuario.rol !== 'estudiante') {
      navigate('/login');
      return;
    }

    let activo = true;
    fetch(apiUrl(`/api/convalidacion/estudiante/${usuario.id}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (activo && data) aplicarDatosConvalidacion(data);
      })
      .catch((err) => {
        console.error('Error cargando datos de convalidación:', err);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // Trámite principal más reciente e historial de anteriores
  const tramiteActual = tramites.length > 0 ? tramites[0] : null;
  const tramitesAnteriores = tramites.length > 1 ? tramites.slice(1) : [];

  const estadoActual = tramiteActual?.estado;
  const usuarioId = usuario?.id;
  useEffect(() => {
    if (!usuarioId) return;
    if (estadoActual !== 'En revisión por encargado' && estadoActual !== 'Apelación en revisión') {
      return;
    }

    let activo = true;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(apiUrl(`/api/convalidacion/estudiante/${usuarioId}`));
        if (!res.ok || !activo) return;
        const data = await res.json();
        if (!activo) return;
        setTramites(data.tramites || []);
        setBitacoraStats(data.bitacora_actual || { horas_acumuladas: 0, dias_registrados: 0 });
        setPracticasAceptadas(data.practicas_aceptadas || []);
      } catch {
        // Silencioso durante polling automático
      }
    }, 4000);

    return () => {
      activo = false;
      clearInterval(timer);
    };
  }, [estadoActual, usuarioId]);

  const bitacoraHabilitada = tramiteActual?.tipo_flujo === 'practica_nueva' && tramiteActual?.estado === 'Práctica confirmada / en curso';
  const puedeIniciarNuevo = !tramiteActual ||
    tramiteActual.estado === 'Aprobada' || (
      tramiteActual.estado === 'Rechazada' &&
      (!tramiteActual.apelacion_estado || tramiteActual.apelacion_estado === 'Resuelta')
    );

  // Cálculo en vivo de regla del triple
  const calcularMesesEnVivo = () => {
    if (!formB.fecha_inicio || !formB.fecha_fin) return 0;
    const d1 = new Date(formB.fecha_inicio);
    const d2 = new Date(formB.fecha_fin);
    if (d2 <= d1) return 0;
    return Number(((d2 - d1) / (1000 * 60 * 60 * 24 * 30)).toFixed(1));
  };

  const mesesRealesB = calcularMesesEnVivo();
  const mesesMinimosExigidos = Number(formB.meses_a_convalidar || 0) * 3;
  const cumpleTripleDuracion = mesesRealesB >= mesesMinimosExigidos && mesesMinimosExigidos > 0;

  // Enviar Práctica Nueva
  const handleEnviarFlujoA = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formA.fecha_fin <= formA.fecha_inicio) {
      setErrorMsg('La fecha de término debe ser posterior a la fecha de inicio.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(apiUrl('/api/convalidacion/practica-nueva'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: usuario.id,
          postulacion_id: postulacionSeleccionadaId || null,
          ...formA
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al registrar la práctica.');
      } else {
        setSuccessMsg(data.mensaje);
        setPostulacionSeleccionadaId('');
        setFormA(FORM_A_INICIAL);
        setVistaFormulario('selector');
        cargarDatos();
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  // Enviar Convalidación Experiencia Previa
  const handleEnviarFlujoB = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formB.fecha_fin > hoyStr) {
      setErrorMsg('Para convalidar experiencia previa, la fecha de término debe ser anterior o igual a hoy.');
      return;
    }
    if (formB.fecha_fin <= formB.fecha_inicio) {
      setErrorMsg('La fecha de término debe ser posterior a la fecha de inicio.');
      return;
    }
    if (!formB.empresa_unica) {
      setErrorMsg('Debes confirmar que la experiencia se realizó en una sola empresa o institución.');
      return;
    }
    if (!cumpleTripleDuracion) {
      setErrorMsg(`La duración debe ser al menos el triple (${mesesMinimosExigidos} meses) del período a convalidar.`);
      return;
    }
    if (!pdfActividades) {
      setErrorMsg('Debes adjuntar el PDF con el detalle de las actividades realizadas.');
      return;
    }

    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('estudiante_id', usuario.id);
      Object.entries(formB).forEach(([k, v]) => fd.append(k, v));
      fd.append('pdf_actividades', pdfActividades);

      const res = await fetch(apiUrl('/api/convalidacion/experiencia-previa'), {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al enviar la solicitud de convalidación.');
      } else {
        setSuccessMsg(data.mensaje);
        setVistaFormulario('selector');
        cargarDatos();
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  // Subir Informe Final
  const handleSubirInformeFinal = async (e) => {
    e.preventDefault();
    if (!pdfInformeFinal || !tramiteActual) return;
    setErrorMsg('');
    setSuccessMsg('');
    setEnviando(true);

    try {
      const fd = new FormData();
      fd.append('estudiante_id', usuario.id);
      fd.append('pdf_informe', pdfInformeFinal);

      const res = await fetch(apiUrl(`/api/convalidacion/${tramiteActual.id}/informe-final`), {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al entregar el informe final.');
      } else {
        setSuccessMsg(data.mensaje);
        setPdfInformeFinal(null);
        cargarDatos();
      }
    } catch {
      setErrorMsg('Error de conexión al subir el informe.');
    } finally {
      setEnviando(false);
    }
  };

  // Enviar Apelación
  const handleEnviarApelacion = async (e) => {
    e.preventDefault();
    if (!apelacionMotivo.trim() || !tramiteActual) return;
    setErrorMsg('');
    setSuccessMsg('');
    setEnviando(true);

    try {
      const fd = new FormData();
      fd.append('estudiante_id', usuario.id);
      fd.append('apelacion_motivo', apelacionMotivo);
      if (pdfApelacion) fd.append('pdf_apelacion', pdfApelacion);

      const res = await fetch(apiUrl(`/api/convalidacion/${tramiteActual.id}/apelar`), {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al enviar la apelación.');
      } else {
        setSuccessMsg(data.mensaje);
        setMostrarApelacion(false);
        setApelacionMotivo('');
        setPdfApelacion(null);
        cargarDatos();
      }
    } catch {
      setErrorMsg('Error de conexión al enviar apelación.');
    } finally {
      setEnviando(false);
    }
  };

  // Helper de color según estado del trámite
  const getEstadoBadge = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    if (estado.includes('Apelación')) return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
    return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.92rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.84rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px'
  };

  const cancelButtonStyle = {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.88rem'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* Barra Superior */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 30px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/perfil')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}
            >
              <IconArrowLeft /> Volver al Perfil
            </button>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: '800' }}>
              Práctica y Convalidación
            </h1>
          </div>
            
          {(bitacoraHabilitada || bitacoraStats.dias_registrados > 0) && (
            <button
              onClick={() => navigate('/bitacora')}
              style={{ padding: '9px 16px', backgroundColor: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Ir a mi Bitácora ({bitacoraStats.horas_acumuladas} hrs)
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '28px auto', padding: '0 20px' }}>
        
        {/* Alertas Globales */}
        {errorMsg && (
          <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
            <IconAlert /> <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            <IconCheckCircle /> <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Cargando estado del trámite...</div>
        ) : (
          <>
            {/* Recuadro de prácticas aceptadas disponibles */}
            {vistaFormulario === 'selector' && practicasAceptadas.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #bbf7d0', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)', padding: '22px 26px', marginBottom: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '800', fontSize: '1.08rem' }}>
                      <IconCheckCircle />
                      <span>Tienes prácticas aceptadas listas para iniciar</span>
                    </div>
                    <p style={{ margin: '5px 0 0', fontSize: '0.88rem', color: '#475569' }}>
                      Una empresa ya aceptó tu postulación en ChambaHub. Completa los datos del supervisor y fechas para activarla y habilitar tu Bitácora Diaria de inmediato.
                    </p>
                  </div>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                    {practicasAceptadas.length} {practicasAceptadas.length === 1 ? 'disponible' : 'disponibles'}
                  </span>
                </div>

                {!puedeIniciarNuevo && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.84rem', color: '#475569', marginBottom: '14px' }}>
                    Ya tienes un trámite en curso. Cuando finalice podrás iniciar otra práctica aceptada.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {practicasAceptadas.map((p) => (
                    <div
                      key={p.postulacion_id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.98rem' }}>
                          {p.oferta_titulo}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '3px' }}>
                          <strong>{p.empresa_nombre}</strong> • {p.modalidad} • {p.duracion} • {p.localidad}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!puedeIniciarNuevo}
                        onClick={() => handleIniciarDesdeAceptada(String(p.postulacion_id))}
                        style={{
                          padding: '9px 16px',
                          backgroundColor: puedeIniciarNuevo ? '#16a34a' : '#cbd5e1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '0.84rem',
                          cursor: puedeIniciarNuevo ? 'pointer' : 'not-allowed',
                          boxShadow: puedeIniciarNuevo ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none'
                        }}
                      >
                        Completar supervisor e iniciar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seguimiento */}
            {tramiteActual && vistaFormulario === 'selector' && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '28px' }}>
                
                {/* Cabecera del Trámite */}
                <div style={{ backgroundColor: '#3b82f6', padding: '20px 26px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700', opacity: 0.95, letterSpacing: '0.5px', color: 'white' }}>
                      {tramiteActual.tipo_flujo === 'practica_nueva' ? 'Práctica Nueva' : 'Convalidación de Experiencia'} • {tramiteActual.tipo_practica}
                    </span>
                    <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>
                      {tramiteActual.empresa_nombre}
                    </h2>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      backgroundColor: getEstadoBadge(tramiteActual.estado).bg,
                      color: getEstadoBadge(tramiteActual.estado).color,
                      border: `1px solid ${getEstadoBadge(tramiteActual.estado).border}`
                    }}>
                      {tramiteActual.estado}
                    </span>
                    <div style={{ fontSize: '0.8rem', marginTop: '6px', opacity: 0.95, color: 'white' }}>
                      Tiempo estimado de gestión: <strong>{tramiteActual.tiempo_estimado_dias} días hábiles</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '26px' }}>
                  
                  {/* Grilla de Antecedentes Registrados */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Empresa / Institución</div>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{tramiteActual.empresa_nombre}</div>
                      {tramiteActual.empresa_rut && <div style={{ fontSize: '0.85rem', color: '#475569' }}>RUT: {tramiteActual.empresa_rut}</div>}
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>{tramiteActual.empresa_direccion}</div>
                    </div>

                    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Supervisor Asignado</div>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{tramiteActual.supervisor_nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>{tramiteActual.supervisor_correo}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>Tel: {tramiteActual.supervisor_telefono}</div>
                    </div>

                    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Período y Modalidad</div>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>{tramiteActual.modalidad}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>Desde: {tramiteActual.fecha_inicio_fmt}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>Hasta: {tramiteActual.fecha_fin_fmt}</div>
                    </div>
                  </div>

                  {/* Progreso de horas */}
                  {tramiteActual.tipo_flujo === 'practica_nueva' && (
                    <div style={{ padding: '18px 20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>
                            Progreso en Bitácora Diaria
                          </span>
                          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                            {bitacoraStats.horas_acumuladas} / {tramiteActual.horas_comprometidas} horas acumuladas
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginLeft: '8px' }}>
                              ({bitacoraStats.dias_registrados} jornadas)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/bitacora')}
                          disabled={!bitacoraHabilitada}
                          title={!bitacoraHabilitada ? 'Disponible solo cuando la práctica esté confirmada y en curso' : ''}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: bitacoraHabilitada ? '#3b82f6' : '#94a3b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: bitacoraHabilitada ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {bitacoraHabilitada ? 'Registrar Jornada en Bitácora' : 'Bitácora bloqueada (Requiere confirmación)'}
                        </button>
                      </div>

                      <div style={{ width: '100%', height: '8px', backgroundColor: '#dbeafe', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, Math.round((bitacoraStats.horas_acumuladas / (tramiteActual.horas_comprometidas || 360)) * 100))}%`,
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Informe final */}
                  {tramiteActual.tipo_flujo === 'practica_nueva' && tramiteActual.estado === 'Práctica confirmada / en curso' && (
                    <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #94a3b8', marginBottom: '24px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>
                        Entrega de Informe Final y Cierre de Bitácora
                      </h3>
                      <p style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#475569' }}>
                        Al completar tu práctica, adjunta tu Informe Final en PDF. El sistema anexará automáticamente el resumen oficial de tus <strong>{bitacoraStats.horas_acumuladas} horas</strong> registradas en tu bitácora y solicitará la evaluación a tu supervisor.
                      </p>

                      {bitacoraStats.horas_acumuladas < tramiteActual.horas_comprometidas && (
                        <div style={{ padding: '10px 12px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '12px' }}>
                          Aviso: Actualmente llevas {bitacoraStats.horas_acumuladas} hrs de las {tramiteActual.horas_comprometidas} hrs comprometidas. Asegúrate de haber registrado todas tus jornadas antes de cerrar.
                        </div>
                      )}

                      <form onSubmit={handleSubirInformeFinal} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          accept="application/pdf"
                          required
                          onChange={(e) => setPdfInformeFinal(e.target.files[0])}
                          style={{ flex: 1, minWidth: '220px', padding: '8px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                        <button
                          type="submit"
                          disabled={enviando}
                          style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          {enviando ? 'Enviando...' : 'Entregar Informe Final y Solicitar Evaluación'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Documentos */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {tramiteActual.pdf_actividades_path && (
                      <a
                        href={getFileUrl(tramiteActual.pdf_actividades_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                      >
                        <IconFileText /> Ver PDF de Actividades Adjunto
                      </a>
                    )}
                    {tramiteActual.pdf_informe_final_path && (
                      <a
                        href={getFileUrl(tramiteActual.pdf_informe_final_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                      >
                        <IconFileText /> Ver Informe Final Entregado
                      </a>
                    )}
                  </div>

                  {/* Aviso de evaluación IA en curso */}
                  {(tramiteActual.estado === 'En revisión por encargado' || tramiteActual.estado === 'Apelación en revisión') && (
                    <div style={{ padding: '14px 18px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', color: '#1e40af', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                      <IconHistory />
                      <span>
                        <strong>Evaluación automática en curso:</strong> el asistente IA está revisando los antecedentes y generando la planilla oficial. Esta vista se actualizará automáticamente en unos segundos.
                      </span>
                    </div>
                  )}

                  {/* EVALUACIÓN DEL SUPERVISOR */}
                  {tramiteActual.evaluacion_supervisor && (
                    <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                      <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>
                        Evaluación del Supervisor Registrada
                      </h3>
                      <p style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#334155' }}>
                        <strong>Resumen de tareas:</strong> {tramiteActual.evaluacion_supervisor.resumen_tareas}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                        {Object.entries(CRITERIOS_LABELS).map(([key, label]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.83rem' }}>
                            <span style={{ color: '#475569' }}>{label}</span>
                            <strong style={{ color: '#3b82f6' }}>{tramiteActual.evaluacion_supervisor[key]} / 5</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolución encargado */}
                  {(tramiteActual.acta_numero || tramiteActual.observaciones_encargado || tramiteActual.estado === 'Aprobada' || tramiteActual.estado === 'Rechazada') && (
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      backgroundColor: tramiteActual.estado === 'Aprobada' ? '#f0fdf4' : (tramiteActual.estado === 'Rechazada' ? '#fef2f2' : '#f8fafc'),
                      border: `1px solid ${tramiteActual.estado === 'Aprobada' ? '#bbf7d0' : (tramiteActual.estado === 'Rechazada' ? '#fecaca' : '#cbd5e1')}`,
                      marginBottom: '20px'
                    }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '1.08rem', color: '#0f172a', fontWeight: '800' }}>
                        Resolución y Acta Oficial {tramiteActual.acta_numero ? `(Acta N° ${tramiteActual.acta_numero})` : ''}
                      </h3>
                      {tramiteActual.acta_detalle && (
                        <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: '#1e293b' }}>{tramiteActual.acta_detalle}</p>
                      )}
                      {tramiteActual.observaciones_encargado && (
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                          <strong>Observaciones del encargado:</strong> {tramiteActual.observaciones_encargado}
                        </p>
                      )}
                      {tramiteActual.apelacion_resolucion && (
                        <p style={{ margin: '10px 0 0', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a' }}>
                          <strong>Resolución de Apelación:</strong> {tramiteActual.apelacion_resolucion}
                        </p>
                      )}
                      {tramiteActual.decision_ia_json && (
                        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Resolución emitida por el asistente IA convalidador a partir de la planilla estandarizada de tu trámite.
                        </p>
                      )}
                      {tramiteActual.planilla_path && (
                        <a
                          href={apiUrl(tramiteActual.planilla_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '8px 14px', backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                        >
                          <IconFileText /> Descargar planilla de convalidación (Excel)
                        </a>
                      )}
                    </div>
                  )}

                  {/* Apelar */}
                  {tramiteActual.estado === 'Rechazada' && !tramiteActual.apelacion_estado && (
                    <div style={{ marginTop: '16px' }}>
                      {!mostrarApelacion ? (
                        <button
                          onClick={() => setMostrarApelacion(true)}
                          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)' }}
                        >
                          Presentar Apelación a esta Resolución
                        </button>
                      ) : (
                        <form onSubmit={handleEnviarApelacion} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h4 style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '800' }}>Formulario de Apelación</h4>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Fundamentos y descargos de la apelación *</label>
                            <textarea
                              required
                              rows="3"
                              placeholder="Explica los motivos por los cuales solicitas reconsiderar el rechazo..."
                              value={apelacionMotivo}
                              onChange={(e) => setApelacionMotivo(e.target.value)}
                              style={inputStyle}
                            />
                          </div>
                          <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Documento PDF de respaldo adicional (Opcional)</label>
                            <input type="file" accept="application/pdf" onChange={(e) => setPdfApelacion(e.target.files[0])} />
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={enviando} style={{ padding: '9px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                              {enviando ? 'Enviando...' : 'Enviar Apelación'}
                            </button>
                            <button type="button" onClick={() => setMostrarApelacion(false)} style={cancelButtonStyle}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Botón para iniciar otro trámite si el anterior ya cerró definitivamente */}
                  {puedeIniciarNuevo && (
                    <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleIntentarNuevoTramite('flujoA')}
                          style={{ padding: '10px 18px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          + Iniciar Nueva Práctica
                        </button>
                        <button
                          onClick={() => handleIntentarNuevoTramite('flujoB')}
                          style={{ padding: '10px 18px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          + Solicitar Nueva Convalidación
                        </button>
                      </div>

                      {tramiteActual.estado === 'Rechazada' && !tramiteActual.apelacion_estado && (
                        <div style={{ marginTop: '14px', padding: '11px 15px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ marginTop: '2px', flexShrink: 0, color: '#3b82f6' }}><IconAlert /></span>
                          <span>
                            <strong style={{ color: '#0f172a' }}>Nota:</strong> Si inicias una nueva práctica o solicitud de convalidación sin apelar esta resolución, <strong style={{ color: '#0f172a' }}>renunciarás a la opción de apelar este rechazo</strong> y el trámite pasará cerrado a tu historial.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historial trámites anteriores */}
            {tramitesAnteriores.length > 0 && vistaFormulario === 'selector' && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', padding: '24px 26px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b' }}><IconHistory /></span> Historial de Trámites Anteriores
                  </h3>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {tramitesAnteriores.length} {tramitesAnteriores.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {tramitesAnteriores.map((item) => {
                    const badge = getEstadoBadge(item.estado);
                    const estaExpandido = historialExpandidoId === item.id;

                    return (
                      <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                        {/* Fila Resumen */}
                        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                              {item.tipo_flujo === 'practica_nueva' ? 'Práctica Nueva' : 'Convalidación de Experiencia'} • {item.tipo_practica}
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                              {item.empresa_nombre}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '2px' }}>
                              {item.fecha_inicio_fmt} al {item.fecha_fin_fmt} • {item.modalidad}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '5px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`
                            }}>
                              {item.estado}
                            </span>

                            <button
                              type="button"
                              onClick={() => setHistorialExpandidoId(estaExpandido ? null : item.id)}
                              style={{
                                padding: '7px 14px',
                                backgroundColor: 'white',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              {estaExpandido ? 'Ocultar detalles' : 'Ver detalles'}
                            </button>
                          </div>
                        </div>

                        {/* Detalles Desplegables */}
                        {estaExpandido && (
                          <div style={{ padding: '18px 20px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px', fontSize: '0.86rem' }}>
                              <div>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>Empresa / Dirección:</span>
                                <div style={{ color: '#0f172a', marginTop: '2px' }}>
                                  {item.empresa_nombre} {item.empresa_rut ? `(${item.empresa_rut})` : ''} — {item.empresa_direccion}
                                </div>
                              </div>
                              <div>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>Supervisor:</span>
                                <div style={{ color: '#0f172a', marginTop: '2px' }}>
                                  {item.supervisor_nombre} ({item.supervisor_correo})
                                </div>
                              </div>
                            </div>

                            {/* Resolución, Acta y Observaciones */}
                            {(item.acta_numero || item.observaciones_encargado || item.apelacion_motivo || item.apelacion_resolucion) && (
                              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '0.88rem' }}>
                                {item.acta_numero && (
                                  <p style={{ margin: '0 0 6px', color: '#0f172a' }}>
                                    <strong>Acta N° {item.acta_numero}:</strong> {item.acta_detalle || ''}
                                  </p>
                                )}
                                {item.observaciones_encargado && (
                                  <p style={{ margin: '0 0 6px', color: '#334155' }}>
                                    <strong>Observaciones del encargado:</strong> {item.observaciones_encargado}
                                  </p>
                                )}
                                {item.apelacion_motivo && (
                                  <p style={{ margin: '0 0 6px', color: '#334155' }}>
                                    <strong>Apelación presentada:</strong> {item.apelacion_motivo}
                                  </p>
                                )}
                                {item.apelacion_resolucion && (
                                  <p style={{ margin: 0, color: '#0f172a' }}>
                                    <strong>Resolución de apelación:</strong> {item.apelacion_resolucion}
                                  </p>
                                )}
                              </div>
                            )}

                            {item.estado === 'Rechazada' && !item.apelacion_estado && (
                              <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                                Este trámite quedó cerrado sin apelación al iniciarse una nueva solicitud.
                              </p>
                            )}

                            {/* Documentos PDF del trámite anterior */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              {item.pdf_actividades_path && (
                                <a
                                  href={getFileUrl(item.pdf_actividades_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                                >
                                  <IconFileText /> PDF de Actividades
                                </a>
                              )}
                              {item.pdf_informe_final_path && (
                                <a
                                  href={getFileUrl(item.pdf_informe_final_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                                >
                                  <IconFileText /> Informe Final
                                </a>
                              )}
                              {(item.apelacion_pdf_path || item.pdf_apelacion_path) && (
                                <a
                                  href={getFileUrl(item.apelacion_pdf_path || item.pdf_apelacion_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                                >
                                  <IconFileText /> Respaldo de Apelación
                                </a>
                              )}
                              {item.planilla_path && (
                                <a
                                  href={apiUrl(item.planilla_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', border: '1px solid #cbd5e1' }}
                                >
                                  <IconFileText /> Planilla (Excel)
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector */}
            {!tramiteActual && vistaFormulario === 'selector' && (
              <div>
                <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 30px' }}>
                  <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>
                    Selecciona la modalidad de tu trámite
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                    Puedes inscribir una práctica nueva para llevar tu bitácora diaria, o convalidar una experiencia laboral o investigativa previa.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  {/* Tarjeta Práctica Nueva */}
                  <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <IconBriefcase />
                      </div>
                      <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
                        Iniciar una Práctica Nueva
                      </h3>
                      <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                        Inscribe una práctica industrial o profesional que vas a realizar. Requiere confirmación del supervisor, registro diario en tu bitácora, informe final y evaluación.
                      </p>
                    </div>
                    <button
                      onClick={() => { setErrorMsg(''); setVistaFormulario('flujoA'); }}
                      style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      Iniciar Práctica Nueva
                    </button>
                  </div>

                  {/* Tarjeta Convalidar Experiencia Previa */}
                  <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <IconAward />
                      </div>
                      <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
                        Convalidar Experiencia Previa
                      </h3>
                      <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                        Solicita reconocer un trabajo profesional, investigación, trabajo social o emprendimiento ya realizado en una sola institución por al menos el triple del tiempo a convalidar.
                      </p>
                    </div>
                    <button
                      onClick={() => { setErrorMsg(''); setVistaFormulario('flujoB'); }}
                      style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      Convalidar Experiencia
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Práctica nueva */}
            {vistaFormulario === 'flujoA' && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: '800' }}>
                    Solicitud de Práctica Nueva
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setPostulacionSeleccionadaId('');
                      setFormA(FORM_A_INICIAL);
                      setVistaFormulario('selector');
                    }}
                    style={cancelButtonStyle}
                  >
                    Cancelar
                  </button>
                </div>

                {/* Bloque de autocompletado desde prácticas aceptadas o aviso de ingreso manual */}
                {practicasAceptadas.length > 0 ? (
                  <div style={{ padding: '16px 18px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', marginBottom: '22px' }}>
                    <label style={{ ...labelStyle, color: '#1d4ed8', marginBottom: '8px' }}>
                      Autocompletar desde una práctica en la que fuiste aceptado ({practicasAceptadas.length} disponible{practicasAceptadas.length > 1 ? 's' : ''}):
                    </label>
                    <select
                      style={{ ...inputStyle, backgroundColor: 'white' }}
                      value={postulacionSeleccionadaId}
                      onChange={(e) => handleSeleccionarPracticaAceptada(e.target.value)}
                    >
                      <option value="">-- Selecciona una práctica aceptada (o ingresa una empresa externa) --</option>
                      {practicasAceptadas.map((p) => (
                        <option key={p.postulacion_id} value={p.postulacion_id}>
                          {p.empresa_nombre} — {p.oferta_titulo} ({p.modalidad}, {p.duracion})
                        </option>
                      ))}
                    </select>
                    {postulacionSeleccionadaId && (
                      <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#1e40af' }}>
                        Se precargaron la empresa, modalidad, horas y correo de contacto. Completa el RUT, dirección, datos de tu supervisor y fechas: al enviar, la práctica quedará en curso y se habilitará de inmediato <strong>Mi Bitácora Diaria</strong>.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '22px', fontSize: '0.86rem', color: '#475569' }}>
                    Si conseguiste tu práctica por fuera del portal, completa los antecedentes manualmente. Si postulaste en la plataforma, aparecerá aquí para autocompletarse una vez que la empresa acepte tu postulación.
                  </div>
                )}

                <form onSubmit={handleEnviarFlujoA}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Tipo de Práctica *</label>
                      <select style={inputStyle} value={formA.tipo_practica} onChange={(e) => setFormA({ ...formA, tipo_practica: e.target.value })}>
                        <option value="industrial">Práctica Industrial</option>
                        <option value="profesional">Práctica Profesional</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Modalidad *</label>
                      <select style={inputStyle} value={formA.modalidad} onChange={(e) => setFormA({ ...formA, modalidad: e.target.value })}>
                        <option value="Presencial">Presencial</option>
                        <option value="Hibrido">Híbrido</option>
                        <option value="Remoto">Remoto</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Horas Comprometidas *</label>
                      <input type="number" min="180" max="720" required style={inputStyle} value={formA.horas_comprometidas} onChange={(e) => setFormA({ ...formA, horas_comprometidas: e.target.value })} />
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase' }}>Datos de la Empresa</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Nombre de la Empresa *</label>
                      <input type="text" required placeholder="Ej: TechCorp Chile S.A." style={inputStyle} value={formA.empresa_nombre} onChange={(e) => setFormA({ ...formA, empresa_nombre: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>RUT Empresa *</label>
                      <input type="text" required placeholder="Ej: 76.123.456-7" style={inputStyle} value={formA.empresa_rut} onChange={(e) => setFormA({ ...formA, empresa_rut: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Dirección *</label>
                      <input type="text" required placeholder="Ej: Av. Vicuña Mackenna 3939, Santiago" style={inputStyle} value={formA.empresa_direccion} onChange={(e) => setFormA({ ...formA, empresa_direccion: e.target.value })} />
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase' }}>Datos del Supervisor</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Nombre Completo *</label>
                      <input type="text" required placeholder="Ej: María González" style={inputStyle} value={formA.supervisor_nombre} onChange={(e) => setFormA({ ...formA, supervisor_nombre: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Correo Corporativo *</label>
                      <input type="email" required placeholder="supervisor@empresa.cl" style={inputStyle} value={formA.supervisor_correo} onChange={(e) => setFormA({ ...formA, supervisor_correo: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono de Contacto *</label>
                      <input type="text" required placeholder="+56 9 1234 5678" style={inputStyle} value={formA.supervisor_telefono} onChange={(e) => setFormA({ ...formA, supervisor_telefono: e.target.value })} />
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase' }}>Fechas Estimadas</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '26px' }}>
                    <div>
                      <label style={labelStyle}>Fecha de Inicio *</label>
                      <input type="date" required style={inputStyle} value={formA.fecha_inicio} onChange={(e) => setFormA({ ...formA, fecha_inicio: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Fecha de Término *</label>
                      <input type="date" required style={inputStyle} value={formA.fecha_fin} onChange={(e) => setFormA({ ...formA, fecha_fin: e.target.value })} />
                    </div>
                  </div>

                  <button type="submit" disabled={enviando} style={{ width: '100%', padding: '13px', backgroundColor: postulacionSeleccionadaId ? '#16a34a' : '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                    {enviando
                      ? 'Activando práctica...'
                      : postulacionSeleccionadaId
                        ? 'Activar Práctica y Habilitar Bitácora'
                        : 'Enviar Solicitud de Práctica Nueva'}
                  </button>
                </form>
              </div>
            )}

            {/* Convalidación experiencia previa */}
            {vistaFormulario === 'flujoB' && (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a', fontWeight: '800' }}>
                    Convalidar Experiencia Realizada
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setErrorMsg(''); setVistaFormulario('selector'); }}
                    style={cancelButtonStyle}
                  >
                    Cancelar
                  </button>
                </div>

                <form onSubmit={handleEnviarFlujoB}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Práctica a Convalidar *</label>
                      <select style={inputStyle} value={formB.tipo_practica} onChange={(e) => setFormB({ ...formB, tipo_practica: e.target.value })}>
                        <option value="industrial">Práctica Industrial</option>
                        <option value="profesional">Práctica Profesional</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tipo de Experiencia *</label>
                      <select style={inputStyle} value={formB.tipo_experiencia} onChange={(e) => setFormB({ ...formB, tipo_experiencia: e.target.value })}>
                        <option value="trabajo_profesional">Trabajo profesional en empresa/institución</option>
                        <option value="practica_investigativa">Práctica investigativa</option>
                        <option value="trabajo_social">Trabajo social</option>
                        <option value="emprendimiento">Emprendimiento</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Duración a Convalidar *</label>
                      <select
                        style={inputStyle}
                        value={formB.meses_a_convalidar}
                        onChange={(e) => setFormB({ ...formB, meses_a_convalidar: Number(e.target.value) })}
                      >
                        <option value={1}>1 mes (180 horas)</option>
                        <option value={2}>2 meses (360 horas)</option>
                        <option value={3}>3 meses (540 horas)</option>
                      </select>
                    </div>
                  </div>

                  {/* Período real + Validador automático de regla del triple de tiempo */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Modalidad *</label>
                      <select style={inputStyle} value={formB.modalidad} onChange={(e) => setFormB({ ...formB, modalidad: e.target.value })}>
                        <option value="Presencial">Presencial</option>
                        <option value="Hibrido">Híbrido</option>
                        <option value="Remoto">Remoto</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Fecha Inicio Experiencia *</label>
                      <input type="date" max={hoyStr} required style={inputStyle} value={formB.fecha_inicio} onChange={(e) => setFormB({ ...formB, fecha_inicio: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Fecha Término Experiencia *</label>
                      <input type="date" max={hoyStr} required style={inputStyle} value={formB.fecha_fin} onChange={(e) => setFormB({ ...formB, fecha_fin: e.target.value })} />
                    </div>
                  </div>

                  {/* Indicador regla del triple de tiempo */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: cumpleTripleDuracion ? '#f0fdf4' : '#fef3c7',
                    border: `1px solid ${cumpleTripleDuracion ? '#bbf7d0' : '#fde68a'}`,
                    color: cumpleTripleDuracion ? '#166534' : '#92400e',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}>
                    Duración mínima exigida (3x): Período acreditado = <strong>{mesesRealesB} meses</strong> | Mínimo requerido = <strong>{mesesMinimosExigidos} meses</strong>.
                  </div>

                  <h4 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase' }}>Empresa o Institución Única</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Nombre Empresa / Institución *</label>
                      <input type="text" required style={inputStyle} value={formB.empresa_nombre} onChange={(e) => setFormB({ ...formB, empresa_nombre: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>RUT (Si corresponde)</label>
                      <input type="text" style={inputStyle} value={formB.empresa_rut} onChange={(e) => setFormB({ ...formB, empresa_rut: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Dirección *</label>
                      <input type="text" required style={inputStyle} value={formB.empresa_direccion} onChange={(e) => setFormB({ ...formB, empresa_direccion: e.target.value })} />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formB.empresa_unica}
                      onChange={(e) => setFormB({ ...formB, empresa_unica: e.target.checked })}
                      style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                    />
                    <span>Declaro que toda esta experiencia se realizó en una sola empresa o institución.</span>
                  </label>

                  <h4 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '0.9rem', textTransform: 'uppercase' }}>Datos del Supervisor / Evaluador</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Nombre Completo *</label>
                      <input type="text" required style={inputStyle} value={formB.supervisor_nombre} onChange={(e) => setFormB({ ...formB, supervisor_nombre: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Correo Electrónico *</label>
                      <input type="email" required style={inputStyle} value={formB.supervisor_correo} onChange={(e) => setFormB({ ...formB, supervisor_correo: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono *</label>
                      <input type="text" required style={inputStyle} value={formB.supervisor_telefono} onChange={(e) => setFormB({ ...formB, supervisor_telefono: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '26px' }}>
                    <label style={labelStyle}>Documento PDF de Actividades Realizadas *</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      required
                      onChange={(e) => setPdfActividades(e.target.files[0])}
                      style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button type="submit" disabled={enviando || !cumpleTripleDuracion} style={{ width: '100%', padding: '13px', backgroundColor: cumpleTripleDuracion ? '#0f172a' : '#94a3b8', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: cumpleTripleDuracion ? 'pointer' : 'not-allowed' }}>
                    {enviando ? 'Enviando solicitud...' : 'Enviar Solicitud de Convalidación'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de advertencia al iniciar nuevo trámite sin apelar */}
      {flujoPendienteConfirmacion && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', marginBottom: '12px' }}>
              <IconAlert />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                ¿Iniciar nuevo trámite sin apelar?
              </h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '0.92rem', color: '#475569', lineHeight: '1.6' }}>
              Tu solicitud en <strong>{tramiteActual?.empresa_nombre}</strong> fue rechazada y aún no has enviado una apelación. Si continúas con un nuevo trámite, <strong>perderás la posibilidad de apelar esa resolución</strong> y quedará archivada definitivamente en tu historial.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setFlujoPendienteConfirmacion(null)}
                style={cancelButtonStyle}
              >
                Volver y revisar apelación
              </button>
              <button
                type="button"
                onClick={() => {
                  const destino = flujoPendienteConfirmacion;
                  setFlujoPendienteConfirmacion(null);
                  setVistaFormulario(destino);
                }}
                style={{ padding: '9px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)' }}
              >
                Entiendo, iniciar nuevo trámite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}