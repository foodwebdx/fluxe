// Frontend/src/config/api.js

// Detectar entorno
const isDevelopment = import.meta.env.MODE === 'development';

// URL base del API
export const API_BASE_URL = isDevelopment
    ? 'http://localhost:3000'
    : import.meta.env.VITE_API_URL || '';

// Helper para construir URLs
export const apiUrl = (path) => {
    // Asegurar que path empiece con /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // En producción, las rutas son relativas (mismo dominio)
    if (!isDevelopment) {
        return normalizedPath;
    }

    // En desarrollo, usar localhost
    return `${API_BASE_URL}${normalizedPath}`;
};

// Exportar por defecto
export default {
    baseURL: API_BASE_URL,
    url: apiUrl,
};
