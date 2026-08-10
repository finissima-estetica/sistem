// Usuários de exemplo (em um sistema real, isso viria de um banco de dados)
const users = [
    { email: 'admin@clinica.com', password: 'admin123', name: 'Administrador' },
    { email: 'usuario@clinica.com', password: 'usuario123', name: 'Usuário' }
];

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginContainer = document.querySelector('.login-container');
const dashboardContainer = document.querySelector('.dashboard-container');
const userName = document.getElementById('userName');

// Verificar se já está logado ao carregar a página
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showDashboard(currentUser);
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
}

// Função de logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    dashboardContainer.classList.remove('active');
    loginContainer.style.display = 'flex';
    loginForm.reset();
}

// Tornar função logout global
window.logout = logout;
