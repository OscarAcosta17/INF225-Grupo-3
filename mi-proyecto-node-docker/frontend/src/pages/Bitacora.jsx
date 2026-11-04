import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconChevronLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconPrinter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default function Bitacora() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [bitacoras, setBitacoras] = useState([]);
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalDias, setTotalDias] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fecha seleccionada actual (YYYY-MM-DD)
  const hoy = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr);
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  // Estado del Modal de Edición / Creación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [form, setForm] = useState({
    fecha: hoyStr,
    hora_inicio: '09:00',
    hora_fin: '18:00',
    actividades: '',
    actividades_pendientes: '',
    observaciones: ''
  });

  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'estudiante') {
      navigate('/login');
      return;
    }
    cargarBitacoras();
  }, []);

  const cargarBitacoras = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bitacora/estudiante/${usuario.id}`);
      if (res.ok) {
        const data = await res.json();
        setBitacoras(data.bitacoras || []);
        setTotalHoras(data.total_horas || 0);
        setTotalDias(data.total_dias || 0);
      }
    } catch (err) {
      console.error("Error cargando bitácoras:", err);
    } finally {
      setLoading(false);
    }
  };

  const mesesNombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const mesesCortos = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const diasSemanaNombres = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const diasSemanaCortos = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const cabecerasDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const cambiarMes = (offset) => {
    let nuevoMes = mesActual + offset;
    let nuevoAnio = anioActual;
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    }
    setMesActual(nuevoMes);
    setAnioActual(nuevoAnio);
  };

  // Mapa rápido de bitácoras por fecha
  const bitacorasPorFecha = bitacoras.reduce((acc, b) => {
    acc[b.fecha_formato] = b;
    return acc;
  }, {});

  const entradaActual = bitacorasPorFecha[fechaSeleccionada];

  // Cálculo en vivo de horas para el modal
  const calcularHorasVista = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const minInicio = h1 * 60 + m1;
    const minFin = h2 * 60 + m2;
    if (minFin <= minInicio) return 0;
    return Number(((minFin - minInicio) / 60).toFixed(2));
  };

  const horasEnVivo = calcularHorasVista(form.hora_inicio, form.hora_fin);

  // Formato para los encabezados basados en la fecha seleccionada
  const obtenerInfoFecha = (fechaStr) => {
    if (!fechaStr) return { anio: '', cabeceraCorta: '', cabeceraCompleta: '' };
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fechaObj = new Date(y, m - 1, d);
    const diaSemCorto = diasSemanaCortos[fechaObj.getDay()];
    const diaSemLargo = diasSemanaNombres[fechaObj.getDay()];
    const mesCorto = mesesCortos[fechaObj.getMonth()];
    const mesLargo = mesesNombres[fechaObj.getMonth()];

    return {
      anio: y,
      cabeceraCorta: `${diaSemCorto}, ${d} ${mesCorto}`,
      cabeceraCompleta: `Bitácora ${diaSemLargo}, ${d} de ${mesLargo}, ${y}`
    };
  };

  const infoFechaActual = obtenerInfoFecha(fechaSeleccionada);

  // Abrir Modal para Crear
  const handleAbrirCrear = () => {
    setFormError('');
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      fecha: fechaSeleccionada,
      hora_inicio: '09:00',
      hora_fin: '18:00',
      actividades: '',
      actividades_pendientes: '',
      observaciones: ''
    });
    setModalAbierto(true);
  };

  // Abrir Modal para Editar
  const handleAbrirEditar = (registro) => {
    setFormError('');
    setModoEdicion(true);
    setIdEditando(registro.id);
    setForm({
      fecha: registro.fecha_formato,
      hora_inicio: registro.hora_inicio,
      hora_fin: registro.hora_fin,
      actividades: registro.actividades,
      actividades_pendientes: registro.actividades_pendientes || '',
      observaciones: registro.observaciones || ''
    });
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setFormError('');

    if (horasEnVivo <= 0) {
      setFormError('La hora de término debe ser estrictamente posterior a la hora de inicio.');
      return;
    }
    if (!form.actividades.trim()) {
      setFormError('La descripción de actividades es obligatoria.');
      return;
    }

    setGuardando(true);
    try {
      const url = modoEdicion ? `/api/bitacora/${idEditando}` : '/api/bitacora';
      const method = modoEdicion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: usuario.id,
          ...form
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Error al guardar la jornada.');
        return;
      }

      setModalAbierto(false);
      cargarBitacoras();
    } catch (err) {
      setFormError('Error de comunicación con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!entradaActual) return;
    if (!window.confirm('¿Seguro que deseas eliminar el registro de este día?')) return;

    try {
      const res = await fetch(`/api/bitacora/${entradaActual.id}?estudiante_id=${usuario.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        cargarBitacoras();
      } else {
        const data = await res.json();
        alert(data.error || 'No se pudo eliminar el registro.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar.');
    }
  };

  // Generador de días del calendario
  const generarDiasCalendario = () => {
    const primerDiaMes = new Date(anioActual, mesActual, 1);
    const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0);

    let diaInicioSemana = primerDiaMes.getDay() - 1;
    if (diaInicioSemana === -1) diaInicioSemana = 6;

    const totalDiasMes = ultimoDiaMes.getDate();
    const celdas = [];

    for (let i = 0; i < diaInicioSemana; i++) {
      celdas.push({ tipo: 'vacio', key: `prev-${i}` });
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fechaStr = `${anioActual}-${pad(mesActual + 1)}-${pad(dia)}`;
      const registro = bitacorasPorFecha[fechaStr];
      const esHoy = hoyStr === fechaStr;
      const esSeleccionado = fechaSeleccionada === fechaStr;

      celdas.push({
        tipo: 'dia',
        key: fechaStr,
        dia,
        fechaStr,
        registro,
        esHoy,
        esSeleccionado
      });
    }

    return celdas;
  };

  const celdasCalendario = generarDiasCalendario();
  const porcentajeAvance = Math.min(100, Math.round((totalHoras / 360) * 100));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* Estilos para impresión en PDF */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
        @media (min-width: 900px) {
          .bitacora-grid {
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 24px;
            align-items: start;
          }
        }
        @media (max-width: 899px) {
          .bitacora-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>

      {/* Resumen Oficial para Impresión PDF */}
      <div className="print-only" style={{ padding: '30px', borderBottom: '2px solid #0f172a' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: '1.6rem', color: '#0f172a' }}>Bitácora de Práctica Profesional — Resumen Oficial</h1>
        <p style={{ margin: '4px 0', color: '#334155' }}><strong>Estudiante:</strong> {usuario?.nombres} {usuario?.apellidos} ({usuario?.correo})</p>
        <p style={{ margin: '4px 0', color: '#334155' }}><strong>Total horas acumuladas:</strong> {totalHoras} hrs | <strong>Jornadas registradas:</strong> {totalDias}</p>
        <hr style={{ margin: '20px 0' }} />
        {bitacoras.map(b => (
          <div key={b.id} style={{ marginBottom: '18px', pageBreakInside: 'avoid' }}>
            <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>{b.fecha_formato} | {b.hora_inicio} - {b.hora_fin} ({b.horas_trabajadas} hrs)</h4>
            <p style={{ margin: '0 0 4px', color: '#334155' }}><strong>Actividades:</strong> {b.actividades}</p>
            {b.actividades_pendientes && <p style={{ margin: '0 0 4px', color: '#64748b' }}><strong>Pendientes:</strong> {b.actividades_pendientes}</p>}
          </div>
        ))}
      </div>

      {/* Barra Superior de Navegación */}
      <header className="no-print" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => navigate('/perfil')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}
            >
              <IconArrowLeft /> Volver al Perfil
            </button>
            <h1 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: '800' }}>Bitácora de Práctica</h1>
          </div>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: 'white', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <IconPrinter /> Imprimir Resumen PDF
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="no-print" style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>
        
        {/* Barra de Avance Semestral */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.5px' }}>Horas Acumuladas</span>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>
                {totalHoras} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>/ 360 horas</span>
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: porcentajeAvance >= 100 ? '#10b981' : '#2563eb' }}>{porcentajeAvance}%</span>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{totalDias} días registrados</p>
            </div>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
            <div style={{ width: `${porcentajeAvance}%`, height: '100%', backgroundColor: porcentajeAvance >= 100 ? '#10b981' : '#2563eb', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Estructura de 2 Columnas (Calendario Compacto + Panel de Detalle) */}
        <div className="bitacora-grid">
          
          {/* ========================================================
              COLUMNA IZQUIERDA: CALENDARIO COMPACTO TIPO USM
              ======================================================== */}
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              
              {/* Cabecera del Calendario con Fecha Seleccionada */}
              <div style={{ backgroundColor: '#2563eb', padding: '18px 20px', color: 'white' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.9 }}>{infoFechaActual.anio}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: '800', textTransform: 'lowercase', marginTop: '2px' }}>
                  {infoFechaActual.cabeceraCorta}
                </div>
              </div>

              {/* Barra de Navegación del Mes */}
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => cambiarMes(-1)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0f172a' }}
                  title="Mes anterior"
                >
                  <IconChevronLeft />
                </button>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                  {mesesNombres[mesActual]} de {anioActual}
                </span>
                <button
                  onClick={() => cambiarMes(1)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0f172a' }}
                  title="Mes siguiente"
                >
                  <IconChevronRight />
                </button>
              </div>

              {/* Nombres de Días de la Semana: L M X J V S D */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', padding: '10px 14px 4px' }}>
                {cabecerasDias.map(d => (
                  <span key={d} style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Grilla de Días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', padding: '6px 14px 18px', textAlign: 'center' }}>
                {celdasCalendario.map(c => {
                  if (c.tipo === 'vacio') {
                    return <div key={c.key} style={{ height: '38px' }} />;
                  }

                  const tieneRegistro = Boolean(c.registro);

                  return (
                    <button
                      key={c.key}
                      onClick={() => setFechaSeleccionada(c.fechaStr)}
                      style={{
                        height: '38px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: c.esSeleccionado ? '#2563eb' : (c.esHoy ? '#eff6ff' : 'transparent'),
                        color: c.esSeleccionado ? 'white' : (c.esHoy ? '#2563eb' : '#1e293b'),
                        border: c.esHoy && !c.esSeleccionado ? '1.5px solid #2563eb' : 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontWeight: c.esSeleccionado || tieneRegistro || c.esHoy ? '700' : '500',
                        fontSize: '0.88rem',
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                      title={`${c.fechaStr}${tieneRegistro ? ` (${c.registro.horas_trabajadas} hrs)` : ''}`}
                    >
                      <span>{c.dia}</span>

                      {/* Punto Indicador Verde para Días con Registro */}
                      {tieneRegistro && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            width: '5px',
                            height: '5px',
                            backgroundColor: c.esSeleccionado ? 'white' : '#10b981',
                            borderRadius: '50%'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón Destacado: Descargar Bitácoras en PDF */}
            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '13px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 3px 8px rgba(37,99,235,0.25)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
            >
              <IconPrinter /> DESCARGAR BITÁCORAS EN PDF
            </button>
          </div>

          {/* ========================================================
              COLUMNA DERECHA: PANEL DE DETALLE DE LA ACTIVIDAD
              ======================================================== */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            
            {/* Banner de Cabecera */}
            <div style={{ backgroundColor: '#2563eb', padding: '16px 24px', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                {infoFechaActual.cabeceraCompleta}
              </h3>
            </div>

            <div style={{ padding: '26px' }}>
              {entradaActual ? (
                <div>
                  {/* Rango Horario Centrado */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 24px', gap: '15px' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', padding: '4px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      {entradaActual.hora_inicio} a {entradaActual.hora_fin} ({entradaActual.horas_trabajadas} hrs)
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  </div>

                  {/* Sección: Actividad desarrollada */}
                  <div style={{ marginBottom: '22px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Actividad desarrollada:
                    </h4>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', color: '#0f172a', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {entradaActual.actividades}
                    </div>
                  </div>

                  {/* Sección: Actividad Pendiente */}
                  <div style={{ marginBottom: '26px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Actividad Pendiente:
                    </h4>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', color: entradaActual.actividades_pendientes ? '#0f172a' : '#94a3b8', fontSize: '0.95rem', fontStyle: entradaActual.actividades_pendientes ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {entradaActual.actividades_pendientes || 'No hay actividades pendientes.'}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={handleEliminar}
                      style={{ padding: '9px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <IconTrash /> Eliminar Registro
                    </button>
                    <button
                      onClick={() => handleAbrirEditar(entradaActual)}
                      style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}
                    >
                      <IconEdit /> Modificar Entrada
                    </button>
                  </div>
                </div>
              ) : (
                /* Estado cuando el día no tiene registro */
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2563eb' }}>
                    <IconClock />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>
                    Sin jornada registrada
                  </h4>
                  <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' }}>
                    No hay actividades anotadas para el {infoFechaActual.cabeceraCorta}.
                  </p>
                  <button
                    onClick={handleAbrirCrear}
                    style={{ padding: '11px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 3px 8px rgba(37,99,235,0.25)' }}
                  >
                    <IconPlus /> Registrar Actividades para este Día
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          MODAL DE REGISTRO / EDICIÓN CON CÁLCULO EN VIVO
          ======================================================== */}
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '580px', borderRadius: '16px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>
                  {modoEdicion ? 'Editar Jornada Trabajada' : 'Registrar Jornada de Práctica'}
                </h3>
                <p style={{ margin: '4px 0 0', color: '#2563eb', fontWeight: '700', fontSize: '0.88rem' }}>
                  Fecha seleccionada: {form.fecha}
                </p>
              </div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '16px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleGuardar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Hora de Inicio *</label>
                  <input
                    type="time"
                    required
                    value={form.hora_inicio}
                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Hora de Término *</label>
                  <input
                    type="time"
                    required
                    value={form.hora_fin}
                    onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Recuadro de Horas Calculadas en Tiempo Real */}
              <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: '#1e40af', fontWeight: '600' }}>Horas calculadas para el día:</span>
                <span style={{ fontSize: '1.15rem', color: '#1d4ed8', fontWeight: '800' }}>{horasEnVivo} hrs</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Actividades Realizadas *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe las tareas, funciones o desarrollos efectuados..."
                  value={form.actividades}
                  onChange={(e) => setForm({ ...form, actividades: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Actividades Pendientes (Opcional)</label>
                <input
                  type="text"
                  placeholder="Tareas que quedaron pendientes para continuar..."
                  value={form.actividades_pendientes}
                  onChange={(e) => setForm({ ...form, actividades_pendientes: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Observaciones Adicionales (Opcional)</label>
                <input
                  type="text"
                  placeholder="Modalidad presencial/remota, feedback del tutor, etc."
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{ padding: '10px 22px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconCheck /> {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Jornada' : 'Guardar Jornada')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}