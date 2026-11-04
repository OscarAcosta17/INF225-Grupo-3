// Configuración base de la API
// En desarrollo local, VITE_API_URL no está definido, por lo que API_BASE_URL es '' y se usan rutas relativas (/api) con el proxy de Vite o Docker.
// En producción (Render), VITE_API_URL apunta a la URL del backend (ej: https://chambahub-backend.onrender.com).
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const getFileUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE_URL || 'http://localhost:4000';
  return `${base}${cleanPath}`;
};
