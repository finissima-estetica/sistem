// Configuração da API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Erro na requisição');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// API de Autenticação
const authAPI = {
    async login(email, senha) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
    }
};

// API de Clientes
const clientesAPI = {
    async listar() {
        return apiRequest('/clientes');
    },
    
    async buscar(id) {
        return apiRequest(`/clientes/${id}`);
    },
    
    async criar(cliente) {
        return apiRequest('/clientes', {
            method: 'POST',
            body: JSON.stringify(cliente)
        });
    },
    
    async atualizar(id, cliente) {
        return apiRequest(`/clientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cliente)
        });
    },
    
    async excluir(id) {
        return apiRequest(`/clientes/${id}`, {
            method: 'DELETE'
        });
    },
    
    async buscarAtendimentos(clienteId) {
        return apiRequest(`/clientes/${clientId}/atendimentos`);
    },
    
    async buscarPlanos(clienteId) {
        return apiRequest(`/clientes/${clientId}/planos`);
    }
};

// API de Atendimentos
const atendimentosAPI = {
    async criar(atendimento) {
        return apiRequest('/atendimentos', {
            method: 'POST',
            body: JSON.stringify(atendimento)
        });
    }
};

// API de Planos
const planosAPI = {
    async criar(plano) {
        return apiRequest('/planos', {
            method: 'POST',
            body: JSON.stringify(plano)
        });
    }
};

// API de Banco de Dados
const databaseAPI = {
    async inicializar() {
        return apiRequest('/database/init', {
            method: 'POST'
        });
    },
    
    async healthCheck() {
        return apiRequest('/health');
    }
};

// Verificar se API está disponível
async function isApiAvailable() {
    try {
        await databaseAPI.healthCheck();
        return true;
    } catch (error) {
        console.log('API não disponível, usando localStorage');
        return false;
    }
}

// Tornar funções globais
window.authAPI = authAPI;
window.clientesAPI = clientesAPI;
window.atendimentosAPI = atendimentosAPI;
window.planosAPI = planosAPI;
window.databaseAPI = databaseAPI;
window.isApiAvailable = isApiAvailable;