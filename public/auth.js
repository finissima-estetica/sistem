// Usuários de exemplo (em um sistema real, isso viria de um banco de dados)
const users = [
    { email: 'admin@clinica.com', password: 'admin123', name: 'Administrador' },
    { email: 'usuario@clinica.com', password: 'usuario123', name: 'Usuário' }
];

// Clientes (carregados APENAS da API - sem localStorage)
let clients = [];
let useLocalStorage = false; // SEMPRE usar API, nunca localStorage

// Função para carregar clientes da API
async function loadClientsFromStorage() {
    // SEMPRE usar API, nunca localStorage
    try {
        // Tentar carregar diretamente da API sem verificar health
        useLocalStorage = false;
        const clientesData = await clientesAPI.listar();
        // Mapear campos do banco para o formato esperado
        clients = clientesData.map(client => ({
            id: client.id, // Usar ID do banco de dados
            nome: client.nome,
            email: client.email,
            telefone: client.telefone,
            status: client.status,
            dataCadastro: client.data_cadastro
        }));
        console.log('✅ Clientes carregados do PostgreSQL:', clients.length);
        return;
    } catch (error) {
        console.error('❌ Erro ao carregar clientes da API:', error);
        console.log('⚠️ API não disponível ainda, aguardando deploy...');
        // Tentar novamente após um delay mais longo (deploy pode demorar)
        setTimeout(loadClientsFromStorage, 5000);
    }
}

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginContainer = document.querySelector('.login-container');
const dashboardContainer = document.querySelector('.dashboard-container');
const userName = document.getElementById('userName');
const clientsList = document.getElementById('clientsList');

// Verificar se já está logado ao carregar a página
window.addEventListener('load', async () => {
    loadClientsFromStorage();
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showDashboard(currentUser);
    }
    
    // Se estiver na página dashboard, carregar clientes
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        // Verificar se deve recarregar (flag reload=true)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reload') === 'true') {
            // Remover o parâmetro da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Recarregar clientes do storage e esperar completar
            await loadClientsFromStorage();
        } else {
            // Carregar clientes normalmente
            await loadClientsFromStorage();
        }
        loadClients();
    }
});

// Função de login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Verificar credenciais
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Salvar estado de login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Mostrar dashboard
        await showDashboard(user);
    } else {
        // Mostrar erro
        errorMessage.textContent = 'E-mail ou senha incorretos';
        errorMessage.classList.add('show');
        
        // Remover erro após 3 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
});

// Função para mostrar dashboard
async function showDashboard(user) {
    loginContainer.style.display = 'none';
    dashboardContainer.classList.add('active');
    userName.textContent = 'Bem-vindo, ' + user.name;
    await loadClientsFromStorage();
    await loadClients();
}

// Função de logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    dashboardContainer.classList.remove('active');
    loginContainer.style.display = 'flex';
    loginForm.reset();
}

// Função para ir para página de cadastro
function goToCadastro() {
    window.location.href = 'cadastro.html';
}

// Função para carregar lista de clientes
async function loadClients() {
    if (!clientsList) return;
    
    // Recarregar do storage se não estiver usando API
    if (useLocalStorage) {
        const storedClients = localStorage.getItem('clients');
        if (storedClients) {
            clients = JSON.parse(storedClients);
        }
    }
    
    if (clients.length === 0) {
        clientsList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum cliente cadastrado ainda.</p>
                <p>Clique em "Novo Cliente" para começar.</p>
            </div>
        `;
        return;
    }
    
    // Carregar planos para verificar status
    let planos = [];
    if (useLocalStorage) {
        planos = JSON.parse(localStorage.getItem('planos') || '[]');
    } else {
        try {
            // Tenta carregar planos da API
            // Por enquanto, vamos usar localStorage para planos
            planos = JSON.parse(localStorage.getItem('planos') || '[]');
        } catch (error) {
            console.log('Erro ao carregar planos da API:', error);
            planos = JSON.parse(localStorage.getItem('planos') || '[]');
        }
    }
    
    clientsList.innerHTML = clients.map(client => {
        const clientePlanos = planos.filter(p => p.clienteId == client.id);
        const planosAtivos = clientePlanos.filter(p => {
            const dataFim = new Date(p.dataFim);
            return dataFim >= new Date();
        });
        
        const planoBadge = planosAtivos.length > 0 
            ? `<span class="plano-badge">Plano Ativo</span>` 
            : `<span class="no-plano-badge">Sem Plano</span>`;
        
        return `
            <div class="client-card">
                <div class="client-info">
                    <h3>${client.nome || client.name}</h3>
                    <p><strong>Email:</strong> ${client.email}</p>
                    <p><strong>Telefone:</strong> ${client.telefone || client.phone}</p>
                    <p><strong>Cadastro:</strong> ${formatDate(client.dataCadastro)}</p>
                    <div class="client-badges">
                        <span class="status-badge ${client.status ? client.status.toLowerCase() : 'ativo'}">${client.status || 'Ativo'}</span>
                        ${planoBadge}
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-view" onclick="viewClient(${client.id})">Ver Ficha</button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para formatar data
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para pesquisar clientes
function searchClients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        loadClients();
        return;
    }
    
    const filteredClients = clients.filter(client => 
        (client.nome || client.name || '').toLowerCase().includes(searchTerm) ||
        (client.email || '').toLowerCase().includes(searchTerm) ||
        (client.telefone || client.phone || '').includes(searchTerm) ||
        (client.cpf || '').includes(searchTerm)
    );
    
    if (filteredClients.length === 0) {
        clientsList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum cliente encontrado com o termo "${searchTerm}".</p>
            </div>
        `;
        return;
    }
    
    clientsList.innerHTML = filteredClients.map(client => `
        <div class="client-card">
            <div class="client-info">
                <h3>${client.nome || client.name}</h3>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Telefone:</strong> ${client.telefone || client.phone}</p>
                <p><strong>Cadastro:</strong> ${formatDate(client.dataCadastro)}</p>
                <span class="status-badge ${client.status ? client.status.toLowerCase() : 'ativo'}">${client.status || 'Ativo'}</span>
            </div>
            <div class="client-actions">
                <button class="btn-view" onclick="viewClient(${client.id})">Ver Detalhes</button>
                <button class="btn-edit" onclick="editClient(${client.id})">Editar</button>
            </div>
        </div>
    `).join('');
}

// Função para atualizar lista de clientes (chamada pelo cadastro.js)
function updateClientsList() {
    loadClientsFromStorage();
    loadClients();
}

// Função para ver detalhes do cliente
function viewClient(id) {
    window.location.href = `ficha.html?id=${id}`;
}

// Função para editar cliente (placeholder)
function editClient(id) {
    alert('Funcionalidade de edição será implementada em breve.');
}

// Tornar funções globais
window.logout = logout;
window.goToCadastro = goToCadastro;
window.searchClients = searchClients;
window.viewClient = viewClient;
window.editClient = editClient;
window.updateClientsList = updateClientsList;
