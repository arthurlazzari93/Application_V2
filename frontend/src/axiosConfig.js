// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manipular baseURL e adicionar token
axiosInstance.interceptors.request.use(
  (config) => {
    // Adicione o token se disponível
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Defina baseURL com base na rota do request
    // Exemplo: se a URL começa com 'api/', use um baseURL específico
    if (config.url.startsWith('api/')) {
      config.baseURL = 'http://localhost:8000/';
    } else {
      config.baseURL = 'http://localhost:8000/api/';
    }
    
    // Observação: No exemplo acima ambas as condições usam o mesmo baseURL,
    // mas você pode ajustar conforme necessário, por exemplo:
    // if (config.url.startsWith('api/')) { config.baseURL = 'http://localhost:8000/api/'; } else { config.baseURL = 'http://localhost:8000/'; }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
