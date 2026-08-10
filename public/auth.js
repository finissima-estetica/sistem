// Usuários de exemplo (em um sistema real, isso viria de um banco de dados)
const users = [
    { email: 'admin@clinica.com', password: 'admin123', name: 'Administrador' },
    { email: 'usuario@clinica.com', password: 'usuario123', name: 'Usuário' }
];

// Clientes (carregados do localStorage ou exemplos iniciais)
let clients = [];

// Função para carregar clientes do localStorage
function loadClientsFromStorage() {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
        clients = JSON.parse(storedClients);
    } else {
        // Clientes de exemplo iniciais
        clients = [
            { 
                id: 1, 
                nome: 'Maria Silva', 
                email: 'maria.silva@email.com', 
                telefone: '(11) 98765-4321', 
                status: 'Ativo',
                dataCadastro: new Date().toISOString()
            },
            { 
                id: 2, 
                nome: 'João Santos', 
                email: 'joao.santos@email.com', 
                telefone: '(11) 91234-5678', 
                status: 'Ativo',
                dataCadastro: new Date().toISOString()
            },
            { 
                id: 3, 
                nome: 'Ana Costa', 
                email: 'ana.costa@email.com', 
                telefone: '(11) 99876-5432', 
                status: 'Inativo',
                dataCadastro: new Date().toISOString()
            }
        ];
        localStorage.setItem('clients', JSON.stringify(clients));
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
window.addEventListener('load', () => {
    loadClientsFromStorage();
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showDashboard(currentUser);
    }
    
    // Se estiver na página dashboard, carregar clientes
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadClients();
    }
});

// Função de login
loginForm.addEventListener('submit', (e) => {
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
        showDashboard(user);
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
function showDashboard(user) {
    loginContainer.style.display = 'none';
    dashboardContainer.classList.add('active');
    userName.textContent = 'Bem-vindo, ' + user.name;
    loadClientsFromStorage();
    loadClients();
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
function loadClients() {
    if (!clientsList) return;
    
    if (clients.length === 0) {
        clientsList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum cliente cadastrado ainda.</p>
                <p>Clique em "Novo Cliente" para começar.</p>
            </div>
        `;
        return;
    }
    
    clientsList.innerHTML = clients.map(client => `
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

// Função para ver detalhes do cliente (placeholder)
function viewClient(id) {
    alert('Funcionalidade de visualização de detalhes será implementada em breve.');
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
