// MultiplesIA - Script Principal con APIs Reales
// Versión 2025 - Con Google Sign-In y APIs funcionales

// Configuración Global
const CONFIG = {
    BACKEND_URL: 'https://your-proxy.vercel.app/api', // Cambiar al desplegar
    ENABLE_GOOGLE_AUTH: true,
    CURRENT_USER: null,
    API_KEYS: {
        OPENROUTER: null,
        GEMINI: null,
        DEEPSEEK: null
    }
};

// Estado de la Aplicación
let currentTheme = localStorage.getItem('theme') || 'light';
let currentAPI = 'deepseek';
let currentModel = 'deepseek-chat';
let isAuthenticated = false;
let apiCallInProgress = false;

document.addEventListener('DOMContentLoaded', function() {
    initMultiplesIA();
    loadConfig();
    initGoogleAuth();
    initAPIPlayground();
    initDemos();
    initThemeToggle();
    initMobileMenu();
    initNeuralNetwork();
    initParticles();
    initCounters();
    
    setTimeout(() => {
        document.querySelector('.preloader').classList.add('fade-out');
    }, 1500);
});

// ===== INICIALIZACIÓN =====
function initMultiplesIA() {
    console.log('%c🚀 MultiplesIA v2025 - APIs Reales', 'color: #3b82f6; font-size: 24px; font-weight: bold;');
    
    // Configurar Google Client ID
    if (CONFIG.GOOGLE_CLIENT_ID) {
        const meta = document.createElement('meta');
        meta.name = 'google-signin-client_id';
        meta.content = CONFIG.GOOGLE_CLIENT_ID + '.apps.googleusercontent.com';
        document.head.appendChild(meta);
    }
    
    // Event Listeners globales
    document.getElementById('quickSignIn')?.addEventListener('click', triggerGoogleSignIn);
    document.getElementById('signOutButton')?.addEventListener('click', signOut);
    
    // Actualizar estado de APIs
    updateAPIStatus();
}

// ===== CONFIGURACIÓN =====
function loadConfig() {
    // Cargar configuración desde config.js
    if (window.CONFIG) {
        Object.assign(CONFIG, window.CONFIG);
    }
    
    // Cargar API Keys del localStorage
    try {
        const savedKeys = localStorage.getItem('multiplesia_api_keys');
        if (savedKeys) {
            CONFIG.API_KEYS = JSON.parse(savedKeys);
        }
    } catch (error) {
        console.error('Error cargando API keys:', error);
    }
    
    // Actualizar UI con configuración
    updateConfigUI();
}

function updateConfigUI() {
    // Mostrar estado de configuración
    const statusElements = {
        'deepseek': document.querySelector('[data-api="deepseek"] .api-badge'),
        'gemini': document.querySelector('[data-api="gemini"] .api-badge'),
        'google': document.getElementById('googleSignIn')
    };
    
    if (CONFIG.API_KEYS.OPENROUTER) {
        statusElements.deepseek?.classList.add('configured');
        statusElements.deepseek?.textContent = 'Configurado';
    }
    
    if (CONFIG.API_KEYS.GEMINI) {
        statusElements.gemini?.classList.add('configured');
        statusElements.gemini?.textContent = 'Configurado';
    }
}

// ===== AUTENTICACIÓN CON GOOGLE =====
function initGoogleAuth() {
    if (!CONFIG.ENABLE_GOOGLE_AUTH) return;
    
    // Verificar si ya hay una sesión activa
    const savedUser = localStorage.getItem('multiplesia_user');
    if (savedUser) {
        try {
            CONFIG.CURRENT_USER = JSON.parse(savedUser);
            updateUserUI(CONFIG.CURRENT_USER);
            isAuthenticated = true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('multiplesia_user');
        }
    }
}

function onGoogleSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();
    
    CONFIG.CURRENT_USER = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        idToken: authResponse.id_token,
        accessToken: authResponse.access_token,
        expiresAt: Date.now() + authResponse.expires_in * 1000
    };
    
    // Guardar en localStorage
    localStorage.setItem('multiplesia_user', JSON.stringify(CONFIG.CURRENT_USER));
    
    // Actualizar UI
    updateUserUI(CONFIG.CURRENT_USER);
    isAuthenticated = true;
    
    // Habilitar APIs que requieren autenticación
    enableAuthenticatedAPIs();
    
    // Enviar token al backend para verificación
    verifyGoogleToken(authResponse.id_token);
    
    showNotification(`¡Bienvenido, ${CONFIG.CURRENT_USER.name}!`, 'success');
}

function updateUserUI(user) {
    const googleSignIn = document.getElementById('googleSignIn');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const kreaTab = document.getElementById('kreaTab');
    
    if (googleSignIn) googleSignIn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (userAvatar) userAvatar.src = user.imageUrl;
    if (userName) userName.textContent = user.name;
    if (kreaTab) kreaTab.disabled = false;
}

function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
        auth2.signOut().then(() => {
            CONFIG.CURRENT_USER = null;
            isAuthenticated = false;
            localStorage.removeItem('multiplesia_user');
            
            // Actualizar UI
            document.getElementById('googleSignIn').style.display = 'block';
            document.getElementById('userProfile').style.display = 'none';
            document.getElementById('kreaTab').disabled = true;
            
            showNotification('Sesión cerrada correctamente', 'info');
        });
    }
}

function triggerGoogleSignIn() {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
        auth2.signIn({
            prompt: 'select_account'
        }).then(onGoogleSignIn);
    }
}

async function verifyGoogleToken(idToken) {
    try {
        const response = await fetch(CONFIG.BACKEND_URL + '/verify-google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idToken })
        });
        
        if (response.ok) {
            console.log('Token de Google verificado correctamente');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
    }
}

function enableAuthenticatedAPIs() {
    // Habilitar Krea AI y otras APIs que requieren autenticación
    const kreaTab = document.getElementById('kreaTab');
    if (kreaTab) {
        kreaTab.disabled = false;
        kreaTab.querySelector('.api-badge').textContent = 'Disponible';
        kreaTab.querySelector('.api-badge').classList.remove('auth');
        kreaTab.querySelector('.api-badge').classList.add('free');
    }
}

// ===== API PLAYGROUND REAL =====
function initAPIPlayground() {
    // Tabs de API
    const apiTabs = document.querySelectorAll('.api-tab:not(:disabled)');
    apiTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.disabled) return;
            
            apiTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentAPI = this.dataset.api;
            updateAPIDisplay();
        });
    });
    
    // Selector de Modelo
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            currentModel = this.value;
            updateModelInfo();
        });
    }
    
    // Contador de Tokens
    const promptTextarea = document.getElementById('realApiPrompt');
    if (promptTextarea) {
        promptTextarea.addEventListener('input', updateTokenCount);
    }
    
    // Botón de Enviar
    const sendButton = document.getElementById('sendRealRequest');
    if (sendButton) {
        sendButton.addEventListener('click', sendRealAPIRequest);
    }
    
    // Botones de utilidad
    document.getElementById('copyRealResponse')?.addEventListener('click', copyRealResponse);
    document.getElementById('clearResponse')?.addEventListener('click', clearResponse);
    
    // Permitir Ctrl+Enter
    if (promptTextarea) {
        promptTextarea.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                sendRealAPIRequest();
            }
        });
    }
    
    // Inicializar display
    updateAPIDisplay();
    updateTokenCount();
}

function updateAPIDisplay() {
    const apiConfigs = {
        'deepseek': {
            name: 'DeepSeek API',
            endpoint: 'https://api.openrouter.ai/v1/chat/completions',
            models: ['deepseek-chat', 'deepseek-reasoner', 'qwen-plus'],
            authType: 'OpenRouter Key',
            docs: 'https://api-docs.deepseek.com/[citation:7]'
        },
        'gemini': {
            name: 'Google Gemini API',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
            models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
            authType: 'Google API Key',
            docs: 'https://ai.google.dev/'
        },
        'qwen': {
            name: 'Qwen API',
            endpoint: 'https://api.openrouter.ai/v1/chat/completions',
            models: ['qwen-plus', 'qwen-turbo'],
            authType: 'OpenRouter Key',
            docs: 'https://openrouter.ai/models'
        },
        'krea': {
            name: 'Krea AI API',
            endpoint: 'https://api.krea.ai/v1',
            models: ['krea-image', 'krea-video'],
            authType: 'OAuth 2.0',
            docs: 'https://docs.krea.ai/'
        }
    };
    
    const config = apiConfigs[currentAPI];
    if (!config) return;
    
    // Actualizar nombre
    const nameElement = document.getElementById('currentApiName');
    if (nameElement) nameElement.textContent = config.name;
    
    // Actualizar endpoint
    const endpointElement = document.getElementById('apiEndpoint');
    if (endpointElement) endpointElement.textContent = config.endpoint;
    
    // Actualizar selector de modelo
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.innerHTML = '';
        config.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        currentModel = config.models[0];
        modelSelect.value = currentModel;
    }
    
    // Actualizar estado
    const statusElement = document.getElementById('apiStatusText');
    if (statusElement) {
        const hasKey = checkAPIKey(currentAPI);
        statusElement.textContent = hasKey ? 'Conectado' : 'Necesita API Key';
        statusElement.style.color = hasKey ? 'var(--success)' : 'var(--warning)';
    }
    
    updateModelInfo();
}

function updateModelInfo() {
    const modelInfo = {
        'deepseek-chat': {
            description: 'Modelo de chat general de DeepSeek[citation:7]',
            context: '64K tokens',
            free: true
        },
        'deepseek-reasoner': {
            description: 'Modelo con razonamiento paso a paso[citation:9]',
            context: '64K tokens',
            free: true
        },
        'gemini-1.5-flash': {
            description: 'Modelo rápido y eficiente de Google',
            context: '1M tokens',
            free: true
        },
        'qwen-plus': {
            description: 'Modelo avanzado de Qwen via OpenRouter',
            context: '32K tokens',
            free: true
        }
    };
    
    const info = modelInfo[currentModel];
    if (info) {
        // Puedes mostrar esta información en un tooltip o panel lateral
        console.log(`Modelo: ${currentModel} - ${info.description}`);
    }
}

function updateTokenCount() {
    const textarea = document.getElementById('realApiPrompt');
    const counter = document.getElementById('tokenCount');
    
    if (!textarea || !counter) return;
    
    const text = textarea.value;
    // Estimación simple: ~4 caracteres por token
    const tokenCount = Math.ceil(text.length / 4);
    counter.textContent = `${tokenCount} tokens`;
    
    // Cambiar color si se acerca al límite
    if (tokenCount > 4000) {
        counter.style.color = 'var(--warning)';
    } else if (tokenCount > 8000) {
        counter.style.color = 'var(--danger)';
    } else {
        counter.style.color = 'var(--text-muted)';
    }
}

function checkAPIKey(api) {
    switch(api) {
        case 'deepseek':
        case 'qwen':
            return !!CONFIG.API_KEYS.OPENROUTER;
        case 'gemini':
            return !!CONFIG.API_KEYS.GEMINI;
        case 'krea':
            return isAuthenticated;
        default:
            return false;
    }
}

async function sendRealAPIRequest() {
    if (apiCallInProgress) {
        showNotification('Ya hay una solicitud en proceso', 'warning');
        return;
    }
    
    const prompt = document.getElementById('realApiPrompt')?.value.trim();
    const responseElement = document.getElementById('realApiResponse');
    
    if (!prompt) {
        showNotification('Por favor, escribe un prompt', 'warning');
        return;
    }
    
    // Verificar autenticación para APIs que la requieren
    if (currentAPI === 'krea' && !isAuthenticated) {
        showNotification('Krea AI requiere inicio de sesión con Google', 'warning');
        triggerGoogleSignIn();
        return;
    }
    
    // Verificar API key
    if (!checkAPIKey(currentAPI) && currentAPI !== 'krea') {
        showNotification(`Necesitas configurar la API key para ${currentAPI}`, 'error');
        document.querySelector(`[data-api="${currentAPI}"]`).scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Configurar estado de carga
    apiCallInProgress = true;
    const sendButton = document.getElementById('sendRealRequest');
    const originalText = sendButton.innerHTML;
    
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    sendButton.disabled = true;
    
    // Mostrar estado de carga en respuesta
    const startTime = Date.now();
    responseElement.innerHTML = `
        <div class="loading-api">
            <div class="loading-spinner"></div>
            <p>Conectando con ${currentAPI}...</p>
            <p class="note">Esto puede tomar unos segundos</p>
        </div>
    `;
    
    try {
        // Preparar payload según la API
        const payload = prepareAPIPayload(currentAPI, prompt);
        
        // Determinar endpoint del backend
        let endpoint;
        switch(currentAPI) {
            case 'deepseek':
            case 'qwen':
                endpoint = '/openrouter';
                break;
            case 'gemini':
                endpoint = '/gemini';
                break;
            case 'krea':
                endpoint = '/krea';
                break;
            default:
                endpoint = '/openrouter';
        }
        
        // Enviar solicitud al backend proxy
        const response = await fetch(CONFIG.BACKEND_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': isAuthenticated && CONFIG.CURRENT_USER?.idToken 
                    ? `Bearer ${CONFIG.CURRENT_USER.idToken}` 
                    : ''
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Procesar respuesta según la API
        const processedResponse = processAPIResponse(currentAPI, data);
        
        // Mostrar respuesta
        displayAPIResponse(processedResponse, responseTime, data);
        
        // Actualizar metadata
        updateResponseMetadata(responseTime, data);
        
        showNotification('Respuesta recibida correctamente', 'success');
        
    } catch (error) {
        console.error('Error en API request:', error);
        
        responseElement.innerHTML = `
            <div class="error-api">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error de Conexión</h4>
                <p>${error.message}</p>
                <p class="note">Verifica tu conexión y configuración del backend</p>
                <button onclick="retryAPIRequest()" class="btn btn-outline btn-sm">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
        
        showNotification('Error en la conexión con la API', 'error');
    } finally {
        // Restaurar estado del botón
        apiCallInProgress = false;
        sendButton.innerHTML = originalText;
        sendButton.disabled = false;
    }
}

function prepareAPIPayload(api, prompt) {
    const basePayload = {
        model: currentModel,
        messages: [
            {
                role: 'system',
                content: 'Eres un asistente de IA útil y preciso. Responde en español a menos que se indique lo contrario.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
    };
    
    switch(api) {
        case 'deepseek':
        case 'qwen':
            return {
                ...basePayload,
                provider: 'openrouter'
            };
            
        case 'gemini':
            return {
                model: currentModel,
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            };
            
        case 'krea':
            return {
                action: 'generate',
                prompt: prompt,
                model: currentModel,
                userId: CONFIG.CURRENT_USER?.id
            };
            
        default:
            return basePayload;
    }
}

function processAPIResponse(api, data) {
    switch(api) {
        case 'deepseek':
        case 'qwen':
            // Formato OpenRouter/OpenAI
            if (data.choices && data.choices[0]?.message?.content) {
                return {
                    text: data.choices[0].message.content,
                    thinking: data.choices[0]?.message?.thinking,
                    usage: data.usage
                };
            }
            break;
            
        case 'gemini':
            // Formato Google Gemini
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return {
                    text: data.candidates[0].content.parts[0].text,
                    usage: data.usageMetadata
                };
            }
            break;
            
        case 'krea':
            // Formato Krea AI
            if (data.result && data.result.url) {
                return {
                    text: `Imagen generada: ${data.result.url}`,
                    imageUrl: data.result.url,
                    metadata: data.metadata
                };
            }
            break;
    }
    
    // Fallback: devolver datos crudos
    return {
        text: JSON.stringify(data, null, 2),
        raw: true
    };
}

function displayAPIResponse(response, responseTime, rawData) {
    const responseElement = document.getElementById('realApiResponse');
    
    let html = '';
    
    if (response.thinking) {
        html += `
            <div class="thinking">
                <strong>Razonamiento:</strong><br>
                ${escapeHtml(response.thinking)}
            </div>
        `;
    }
    
    if (response.imageUrl) {
        html += `
            <div class="image-response">
                <img src="${response.imageUrl}" alt="Imagen generada" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;">
                <p>${escapeHtml(response.text)}</p>
            </div>
        `;
    } else if (response.raw) {
        html += `<pre>${response.text}</pre>`;
    } else {
        html += `<div class="response-text">${formatResponse(response.text)}</div>`;
    }
    
    // Añadir información de uso si está disponible
    if (response.usage) {
        html += `
            <div class="usage-info">
                <hr>
                <small>
                    <strong>Uso:</strong> 
                    ${response.usage.prompt_tokens || '?'} tokens entrada • 
                    ${response.usage.completion_tokens || '?'} tokens salida • 
                    ${response.usage.total_tokens || '?'} tokens total
                </small>
            </div>
        `;
    }
    
    responseElement.innerHTML = html;
    
    // Resaltar código si hay
    if (window.Prism) {
        Prism.highlightAllUnder(responseElement);
    }
}

function updateResponseMetadata(responseTime, data) {
    document.getElementById('responseTime').innerHTML = 
        `<i class="fas fa-clock"></i> ${responseTime}ms`;
    
    if (data.usage) {
        document.getElementById('responseTokens').innerHTML = 
            `<i class="fas fa-database"></i> ${data.usage.total_tokens || '?'} tokens`;
    }
    
    document.getElementById('responseModel').innerHTML = 
        `<i class="fas fa-cube"></i> ${currentModel}`;
}

function copyRealResponse() {
    const responseElement = document.getElementById('realApiResponse');
    const text = responseElement.innerText;
    
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Respuesta copiada al portapapeles', 'success'))
        .catch(err => showNotification('Error al copiar', 'error'));
}

function clearResponse() {
    document.getElementById('realApiResponse').innerHTML = `
        <div class="response-placeholder">
            <i class="fas fa-satellite-dish"></i>
            <p>Las respuestas de las APIs reales aparecerán aquí.</p>
            <p class="note">Conectado a backend proxy seguro</p>
        </div>
    `;
    
    document.querySelectorAll('.response-metadata span').forEach(span => {
        span.innerHTML = span.innerHTML.replace(/[^<]*</, '--<');
    });
}

function retryAPIRequest() {
    sendRealAPIRequest();
}

// ===== FUNCIONES DE UTILIDAD =====
function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Implementación existente mejorada
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // ... (resto de la implementación existente)
}

function updateAPIStatus() {
    // Actualizar estado de todas las APIs
    const apis = ['deepseek', 'gemini', 'qwen', 'krea'];
    
    apis.forEach(api => {
        const element = document.querySelector(`[data-api="${api}"] .api-badge`);
        if (!element) return;
        
        if (checkAPIKey(api) || (api === 'krea' && isAuthenticated)) {
            element.classList.add('configured');
            element.textContent = 'Disponible';
        } else {
            element.classList.remove('configured');
            element.textContent = api === 'krea' ? 'Requiere Login' : 'Necesita Key';
        }
    });
}

// ===== DEMOS ACTUALIZADAS =====
function initDemos() {
    // Mantener las demos existentes pero actualizar para usar APIs reales
    const generateBtn = document.getElementById('generateCode');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateCodeWithAI);
    }
    
    // Actualizar chatbot para usar DeepSeek real
    const sendChatBtn = document.getElementById('sendChat');
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatWithAI);
    }
}

async function generateCodeWithAI() {
    const language = document.getElementById('codeLanguage').value;
    const prompt = document.getElementById('codePrompt').value.trim();
    
    if (!prompt) {
        showNotification('Describe el código que necesitas', 'warning');
        return;
    }
    
    // Usar DeepSeek para generación de código
    const codePrompt = `Genera código ${language} para: ${prompt}. Incluye comentarios explicativos en español.`;
    
    // Llamar a la API real
    const originalAPI = currentAPI;
    const originalModel = currentModel;
    
    currentAPI = 'deepseek';
    currentModel = language === 'python' ? 'deepseek-chat' : 'deepseek-reasoner';
    
    // Guardar el prompt original
    const originalPrompt = document.getElementById('realApiPrompt').value;
    document.getElementById('realApiPrompt').value = codePrompt;
    
    // Ejecutar la solicitud
    await sendRealAPIRequest();
    
    // Restaurar estado
    currentAPI = originalAPI;
    currentModel = originalModel;
    document.getElementById('realApiPrompt').value = originalPrompt;
}

async function sendChatWithAI() {
    const input = document.getElementById('chatInput').value.trim();
    
    if (!input) return;
    
    // Usar DeepSeek para el chat
    const chatPrompt = `Como asistente de chat amigable, responde a: ${input}`;
    
    // Similar a generateCodeWithAI pero para chat
    const originalAPI = currentAPI;
    const originalModel = currentModel;
    
    currentAPI = 'deepseek';
    currentModel = 'deepseek-chat';
    
    const originalPrompt = document.getElementById('realApiPrompt').value;
    document.getElementById('realApiPrompt').value = chatPrompt;
    
    await sendRealAPIRequest();
    
    // Procesar respuesta para el chat UI
    const responseElement = document.getElementById('realApiResponse');
    const responseText = responseElement.innerText;
    
    // Añadir al historial del chat (implementación existente)
    addMessageToChat('ai', responseText);
    
    // Restaurar estado
    currentAPI = originalAPI;
    currentModel = originalModel;
    document.getElementById('realApiPrompt').value = originalPrompt;
}

// ===== RESTANTES FUNCIONES EXISTENTES =====
// (Mantener todas las funciones existentes que no se han reemplazado:
// initThemeToggle, initMobileMenu, initNeuralNetwork, initParticles, 
// initCounters, animateCounter, etc.)
// Solo asegurarse de que llamen a las nuevas funciones donde sea necesario