// config.example.js - MultiplesIA
// Renombra a config.js y configura tus claves

const CONFIG = {
    // Google OAuth 2.0 Client ID
    // Obtén en: https://console.cloud.google.com/apis/credentials
    GOOGLE_CLIENT_ID: 'TU_CLIENT_ID.apps.googleusercontent.com',
    
    // Backend Proxy URL
    // Despliega api-proxy/ en Vercel, Netlify o Railway
    BACKEND_URL: 'https://tu-proxy.vercel.app/api',
    
    // API Keys (se gestionan en el backend)
    // Estas son solo para referencia frontend
    API_KEYS: {
        // OpenRouter API Key (para DeepSeek y Qwen)[citation:2]
        // Regístrate en: https://openrouter.ai
        OPENROUTER: 'sk-or-...',
        
        // Google AI Studio API Key (para Gemini)
        // Obtén en: https://makersuite.google.com/app/apikey
        GEMINI: 'AIza...',
        
        // DeepSeek API Key directa (opcional)[citation:7][citation:9]
        // Obtén en: https://platform.deepseek.com/api_keys
        DEEPSEEK: 'sk-...'
    },
    
    // Configuración de APIs
    APIS: {
        DEEPSEEK: {
            BASE_URL: 'https://api.openrouter.ai/v1',
            MODELS: {
                CHAT: 'deepseek/deepseek-chat:free',
                REASONER: 'deepseek/deepseek-reasoner:free',
                R1: 'deepseek/deepseek-r1:free'
            },
            FREE_LIMIT: 50 // requests por día[citation:2]
        },
        
        GEMINI: {
            BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
            MODELS: {
                FLASH: 'gemini-1.5-flash',
                PRO: 'gemini-1.5-pro'
            }
        },
        
        QWEN: {
            BASE_URL: 'https://api.openrouter.ai/v1',
            MODELS: {
                PLUS: 'qwen/qwen-plus:free',
                TURBO: 'qwen/qwen-turbo:free'
            }
        },
        
        KREA: {
            BASE_URL: 'https://api.krea.ai/v1',
            REQUIRES_AUTH: true,
            ENDPOINTS: {
                IMAGES: '/images/generations',
                VIDEO: '/video/generations',
                UPSCALE: '/images/upscale'
            }
        }
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'MultiplesIA',
        VERSION: '2025.1.0',
        AUTHOR: 'ingenieriaartistica369',
        CREATED: '2025',
        THEME: {
            PRIMARY: '#3b82f6',
            SECONDARY: '#8b5cf6',
            ACCENT: '#06b6d4'
        }
    },
    
    // Características
    FEATURES: {
        GOOGLE_AUTH: true,
        REAL_APIS: true,
        MULTIPLE_PROVIDERS: true,
        RESPONSIVE: true,
        PWA: false, // Habilitar para Progressive Web App
        OFFLINE: false
    },
    
    // Límites y configuraciones
    LIMITS: {
        MAX_TOKENS: 4000,
        REQUEST_TIMEOUT: 30000,
        MAX_REQUESTS_PER_MINUTE: 10,
        CACHE_TTL: 3600000 // 1 hora
    },
    
    // URLs importantes
    URLS: {
        OPENROUTER: 'https://openrouter.ai',
        DEEPSEEK_DOCS: 'https://api-docs.deepseek.com/[citation:7]',
        GEMINI_DOCS: 'https://ai.google.dev/',
        KREA_DOCS: 'https://docs.krea.ai/',
        GITHUB_REPO: 'https://github.com/ingenieriaartistica369/MultiplesIA'
    },
    
    // Mensajes y textos
    MESSAGES: {
        WELCOME: 'Bienvenido a MultiplesIA - APIs Reales de IA',
        API_ERROR: 'Error conectando con la API. Verifica tu configuración.',
        AUTH_REQUIRED: 'Esta función requiere autenticación con Google.',
        RATE_LIMIT: 'Límite de solicitudes alcanzado. Intenta más tarde.'
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

console.log(`
╔══════════════════════════════════════════╗
║     MultiplesIA Configuration Loaded     ║
║               v2025.1.0                  ║
║                                          ║
║  Recuerda:                               ║
║  1. Renombra a config.js                 ║
║  2. Configura tus API Keys               ║
║  3. Despliega el backend proxy           ║
║  4. Actualiza BACKEND_URL                ║
╚══════════════════════════════════════════╝
`);