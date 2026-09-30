import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconBriefcase = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

export default function Login() {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
  
        if (data.usuario.rol === 'empresa') {
          navigate('/mis-ofertas');
        } else if (data.usuario.perfil_configurado === false) {
          navigate('/configurar-perfil'); 
        } else {
          navigate('/perfil'); 
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body {
          margin: 0; padding: 0;
          overflow: hidden;
          background-color: #f8fafc;
        }
        * { box-sizing: border-box; }
        
        .login-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          font-family: sans-serif;
          overflow: hidden;
        }
        
        .login-left {
          flex: 1.2;
          background-color: #0f172a;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8%;
          position: relative;
          overflow: hidden;
          background-image: radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 100% 100%, #172554 0px, transparent 50%);
        }
        
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow-y: auto;
          background-color: #f8fafc;
        }

        .login-form-card {
          width: 100%;
          max-width: 440px;
          background-color: white;
          padding: 50px;
          border-radius: 24px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        
        /* Ocultar el panel izquierdo en pantallas pequeñas para que el form quepa sin hacer scroll general */
        @media (max-width: 900px) {
          .login-left {
            display: none;
          }
          .login-right {
            padding: 20px;
            /* Si es muy chico, permitimos scroll interno solo dentro del lado derecho para no romper, pero el body sigue hidden */
          }
          .login-form-card {
            padding: 30px 20px;
          }
        }
      `}</style>
      
      <div className="login-container">
        
        {/* Panel Izquierdo - Ilustración o Marca */}
        <div className="login-left">
          {/* Elementos decorativos */}
          <div style={{ position: 'absolute', top: '15%', right: '15%', width: '150px', height: '150px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
          <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: '200px', height: '200px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
          
          <div style={{ zIndex: 1, maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '100px', width: 'fit-content', backdropFilter: 'blur(10px)' }}>
              <span style={{ color: '#60a5fa' }}><IconBriefcase /></span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#e2e8f0' }}>Portal de Prácticas USM</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', lineHeight: '1.1', margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Despega tu <br/>
              <span style={{ color: '#3b82f6', backgroundImage: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>carrera profesional.</span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: '1.7', margin: 0, fontWeight: '400', maxWidth: '90%' }}>
              Conéctate con las empresas líderes, descubre oportunidades personalizadas para tu perfil y da el salto al mundo laboral impulsado por nuestro algoritmo inteligente.
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Match Inteligente</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Postulación Rápida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="login-right">
          <div className="login-form-card">
            
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' }}>Bienvenido de vuelta</h2>
            <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '1rem' }}>Ingresa tus credenciales para acceder al portal.</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <IconMail />
                  </div>
                  <input 
                    name="correo" 
                    type="email" 
                    placeholder="ejemplo@usm.cl" 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', color: '#334155', backgroundColor: '#f8fafc', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <IconLock />
                  </div>
                  <input 
                    name="contrasena" 
                    type="password" 
                    placeholder="••••••••" 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', color: '#334155', backgroundColor: '#f8fafc', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)' }}
                onMouseOver={(e) => { if(!loading) { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseOut={(e) => { if(!loading) { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                {loading ? 'Iniciando sesión...' : 'Entrar al Portal'}
              </button>
            </form>
            
            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                ¿Aún no tienes cuenta?{' '}
                <Link to="/registro" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>
                  Regístrate como empresa
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
