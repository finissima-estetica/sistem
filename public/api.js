// Configuração da API
const API_BASE_URL = '/api';

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
            // Tentar fazer parse do JSON apenas se houver conteúdo
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const error = await response.json();
                    throw new Error(error.error || error.message || 'Erro na requisição');
                } catch (jsonError) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
            } else {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
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
        return apiRequest(`/clientes/${clienteId}/atendimentos`);
    },
    
    async buscarPlanos(clienteId) {
        return apiRequest(`/clientes/${clienteId}/planos`);
    },
    
    async criarAtendimento(atendimento) {
        return apiRequest('/atendimentos', {
            method: 'POST',
            body: JSON.stringify(atendimento)
        });
    },
    
    async criarPlano(plano) {
        return apiRequest('/planos', {
            method: 'POST',
            body: JSON.stringify(plano)
        });
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

// API de Pacotes
const pacotesAPI = {
    async listar() {
        return apiRequest('/pacotes');
    },
    
    async buscar(id) {
        return apiRequest(`/pacotes/${id}`);
    },
    
    async criar(pacote) {
        return apiRequest('/pacotes', {
            method: 'POST',
            body: JSON.stringify(pacote)
        });
    },
    
    async atualizar(id, pacote) {
        return apiRequest(`/pacotes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pacote)
        });
    },
    
    async excluir(id) {
        return apiRequest(`/pacotes/${id}`, {
            method: 'DELETE'
        });
    },
    
    async buscarPorCliente(clienteId) {
        return apiRequest(`/clientes/${clientId}/pacotes`);
    },
    
    async vincularAoCliente(clienteId, pacoteData) {
        return apiRequest(`/clientes/${clientId}/pacotes`, {
            method: 'POST',
            body: JSON.stringify(pacoteData)
        });
    },
    
    async atualizarSessoes(clientePacoteId, decrementar) {
        return apiRequest(`/cliente_pacotes/${clientePacoteId}`, {
            method: 'PUT',
            body: JSON.stringify({ decrementar })
        });
    }
};

// API de Serviços
const servicosAPI = {
    async listar() {
        return apiRequest('/servicos');
    },
    
    async buscar(id) {
        return apiRequest(`/servicos/${id}`);
    },
    
    async criar(servico) {
        return apiRequest('/servicos', {
            method: 'POST',
            body: JSON.stringify(servico)
        });
    },
    
    async atualizar(id, servico) {
        return apiRequest(`/servicos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(servico)
        });
    },
    
    async excluir(id) {
        return apiRequest(`/servicos/${id}`, {
            method: 'DELETE'
        });
    },
    
    async buscarPorCliente(clienteId) {
        return apiRequest(`/clientes/${clienteId}/servicos`);
    },
    
    async vincularAoCliente(clienteId, servicoIds) {
        return apiRequest(`/clientes/${clienteId}/servicos`, {
            method: 'POST',
            body: JSON.stringify({ servicoIds })
        });
    },
    
    async buscarPorAtendimento(atendimentoId) {
        return apiRequest(`/atendimentos/${atendimentoId}/servicos`);
    },
    
    async vincularAoAtendimento(atendimentoId, servicoIds) {
        return apiRequest(`/atendimentos/${atendimentoId}/servicos`, {
            method: 'POST',
            body: JSON.stringify({ servicoIds })
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
window.pacotesAPI = pacotesAPI;
window.servicosAPI = servicosAPI;
window.databaseAPI = databaseAPI;
window.isApiAvailable = isApiAvailable;