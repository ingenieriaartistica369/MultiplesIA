// api-proxy/index.js
// Backend Proxy para MultiplesIA
// Desplegar en Vercel, Netlify o Railway

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'https://ingenieriaartistica369.github.io',
        'https://*.github.io'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Verificación de API Keys
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    // Para desarrollo, aceptar sin key
    if (process.env.NODE_ENV === 'development' && !apiKey) {
        return next();
    }
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    // Verificar key (en producción, usar base de datos)
    const validKeys = [
        process.env.OPENROUTER_API_KEY,
        process.env.GEMINI_API_KEY,
        process.env.DEEPSEEK_API_KEY
    ].filter(Boolean);
    
    if (!validKeys.includes(apiKey)) {
        return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
};

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2025.1.0'
    });
});

// ===== OPENROUTER (DeepSeek & Qwen) =====
app.post('/api/openrouter', validateApiKey, async (req, res) => {
    try {
        const { model, messages, temperature = 0.7, max_tokens = 2000 } = req.body;
        
        if (!model || !messages) {
            return res.status(400).json({ error: 'Model and messages are required' });
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': req.headers.origin || 'https://ingenieriaartistica369.github.io',
                'X-Title': 'MultiplesIA Portal'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
                stream: false
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || `OpenRouter error: ${response.status}`);
        }
        
        res.json({
            success: true,
            ...data
        });
        
    } catch (error) {
        console.error('OpenRouter Proxy Error:', error);
        res.status(500).json({ 
            error: error.message,
            note: 'Check your OpenRouter API key in environment variables'
        });
    }
});

// ===== GOOGLE GEMINI =====
app.post('/api/gemini', validateApiKey, async (req, res) => {
    try {
        const { model, contents, generationConfig } = req.body;
        
        if (!model || !contents) {
            return res.status(400).json({ error: 'Model and contents are required' });
        }
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents,
                    generationConfig: generationConfig || {
                        temperature: 0.7,
                        maxOutputTokens: 2000
                    }
                })
            }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || `Gemini error: ${response.status}`);
        }
        
        res.json({
            success: true,
            ...data
        });
        
    } catch (error) {
        console.error('Gemini Proxy Error:', error);
        res.status(500).json({ 
            error: error.message,
            note: 'Check your Google AI Studio API key'
        });
    }
});

// ===== DEEPSEEK DIRECT API =====
app.post('/api/deepseek', validateApiKey, async (req, res) => {
    try {
        const { model = 'deepseek-chat', messages, temperature = 0.7, max_tokens = 2000 } = req.body;
        
        if (!messages) {
            return res.status(400).json({ error: 'Messages are required' });
        }
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
                stream: false
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || `DeepSeek error: ${response.status}`);
        }
        
        res.json({
            success: true,
            ...data
        });
        
    } catch (error) {
        console.error('DeepSeek Proxy Error:', error);
        res.status(500).json({ 
            error: error.message,
            note: 'Check your DeepSeek API key at https://platform.deepseek.com/api_keys'
        });
    }
});

// ===== KREA AI (Requiere Google Auth) =====
app.post('/api/krea', async (req, res) => {
    try {
        // Verificar autenticación Google
        const idToken = req.headers.authorization?.replace('Bearer ', '');
        
        if (!idToken) {
            return res.status(401).json({ error: 'Google authentication required' });
        }
        
        // Verificar token con Google (simplificado)
        // En producción, usar google-auth-library
        const { action, prompt, model } = req.body;
        
        if (!action || !prompt) {
            return res.status(400).json({ error: 'Action and prompt are required' });
        }
        
        // Simular respuesta de Krea (en producción, conectar a API real)
        const mockResponse = {
            success: true,
            result: {
                url: `https://via.placeholder.com/512x512/3b82f6/ffffff?text=${encodeURIComponent(prompt.substring(0, 30))}`,
                prompt: prompt,
                model: model || 'krea-image-v1'
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                estimatedTokens: prompt.length / 4,
                requiresAuth: true
            }
        };
        
        res.json(mockResponse);
        
    } catch (error) {
        console.error('Krea Proxy Error:', error);
        res.status(500).json({ 
            error: error.message,
            note: 'Krea AI integration requires proper OAuth setup'
        });
    }
});

// ===== GOOGLE TOKEN VERIFICATION =====
app.post('/api/verify-google', async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({ error: 'ID token required' });
        }
        
        // En producción, usar google-auth-library para verificar
        // const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        // const payload = ticket.getPayload();
        
        // Por ahora, simular verificación exitosa
        res.json({
            verified: true,
            timestamp: new Date().toISOString(),
            note: 'Token verification simulated. In production, use google-auth-library.'
        });
        
    } catch (error) {
        console.error('Google Token Verification Error:', error);
        res.status(500).json({ 
            error: error.message,
            note: 'Google token verification failed'
        });
    }
});

// ===== API KEYS MANAGEMENT =====
app.post('/api/keys/validate', validateApiKey, async (req, res) => {
    try {
        const { provider, key } = req.body;
        
        if (!provider || !key) {
            return res.status(400).json({ error: 'Provider and key are required' });
        }
        
        let isValid = false;
        let message = '';
        
        // Validar key según el provider
        switch(provider) {
            case 'openrouter':
                // Test con una solicitud simple
                const testResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                isValid = testResponse.ok;
                message = isValid ? 'OpenRouter key is valid' : 'Invalid OpenRouter key';
                break;
                
            case 'gemini':
                // Test con Gemini
                const geminiTest = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${key}`
                );
                isValid = geminiTest.ok;
                message = isValid ? 'Gemini key is valid' : 'Invalid Gemini key';
                break;
                
            default:
                return res.status(400).json({ error: 'Unsupported provider' });
        }
        
        res.json({
            valid: isValid,
            message: message,
            provider: provider,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Key Validation Error:', error);
        res.status(500).json({ 
            error: error.message,
            valid: false
        });
    }
});

// ===== STATISTICS =====
app.get('/api/stats', (req, res) => {
    res.json({
        status: 'operational',
        apis: {
            openrouter: !!process.env.OPENROUTER_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY,
            deepseek: !!process.env.DEEPSEEK_API_KEY
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'POST /api/openrouter',
            'POST /api/gemini',
            'POST /api/deepseek',
            'POST /api/krea',
            'POST /api/verify-google',
            'GET /api/health',
            'GET /api/stats'
        ]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║     MultiplesIA Backend Proxy            ║
║         v2025.1.0                        ║
║                                          ║
║  🚀 Server running on port ${PORT}           ║
║  📡 Environment: ${process.env.NODE_ENV || 'development'}                ║
║  🔐 APIs Available:                      ║
║     • OpenRouter: ${!!process.env.OPENROUTER_API_KEY ? '✅' : '❌'}      ║
║     • Gemini: ${!!process.env.GEMINI_API_KEY ? '✅' : '❌'}              ║
║     • DeepSeek: ${!!process.env.DEEPSEEK_API_KEY ? '✅' : '❌'}          ║
╚══════════════════════════════════════════╝
    `);
});

export default app;