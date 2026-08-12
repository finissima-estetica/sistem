// API de Serviços - usar a API já definida em api.js
// Apenas funções de UI específicas para o dashboard

// Variáveis globais
let servicos = [];
let servicoEditando = null;

// Abrir modal de serviços
function openServicosModal() {
    document.getElementById('modalServicos').classList.add('active');
    loadServicos();
}

// Carregar serviços
async function loadServicos() {
    try {
        console.log('🔌 Carregando serviços...');
        servicos = await servicosAPI.listar();
        console.log('📊 Serviços carregados:', servicos);
        renderServicos();
    } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error);
        document.getElementById('servicosList').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar serviços: ${error.message}</p>
            </div>
        `;
    }
}

// Renderizar lista de serviços
function renderServicos() {
    const servicosList = document.getElementById('servicosList');
    
    if (servicos.length === 0) {
        servicosList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum serviço cadastrado ainda.</p>
                <p>Clique em "Novo Serviço" para começar.</p>
            </div>
        `;
        return;
    }
    
    servicosList.innerHTML = servicos.map(servico => `
        <div class="servico-card">
            <div class="servico-info">
                <h4>${servico.nome}</h4>
                <p class="servico-valor">R$ ${parseFloat(servico.valor_medio).toFixed(2)}</p>
                ${servico.descricao ? `<p class="servico-descricao">${servico.descricao}</p>` : ''}
            </div>
            <div class="servico-actions">
                <button class="btn-edit" onclick="editarServico(${servico.id})">✏️</button>
                <button class="btn-delete" onclick="desativarServico(${servico.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Abrir modal para novo serviço
function openNovoServico() {
    servicoEditando = null;
    document.getElementById('servicoModalTitle').textContent = 'Novo Serviço';
    document.getElementById('servicoForm').reset();
    document.getElementById('modalServico').classList.add('active');
}

// Editar serviço
function editarServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (!servico) return;
    
    servicoEditando = servico;
    document.getElementById('servicoModalTitle').textContent = 'Editar Serviço';
    document.getElementById('servicoNome').value = servico.nome;
    document.getElementById('servicoValor').value = servico.valor_medio;
    document.getElementById('servicoDescricao').value = servico.descricao || '';
    document.getElementById('modalServico').classList.add('active');
}

// Desativar serviço
async function desativarServico(id) {
    if (!confirm('Tem certeza que deseja desativar este serviço?')) return;
    
    try {
        await servicosAPI.excluir(id);
        await loadServicos();
    } catch (error) {
        console.error('Erro ao desativar serviço:', error);
        alert('Erro ao desativar serviço. Tente novamente.');
    }
}

// Lidar com envio do formulário de serviço
async function handleServicoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const servico = {
        nome: formData.get('servicoNome'),
        valor_medio: parseFloat(formData.get('servicoValor')),
        descricao: formData.get('servicoDescricao') || null
    };
    
    try {
        if (servicoEditando) {
            await servicosAPI.atualizar(servicoEditando.id, servico);
        } else {
            await servicosAPI.criar(servico);
        }
        
        closeModal('modalServico');
        await loadServicos();
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        alert('Erro ao salvar serviço. Tente novamente.');
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Tornar funções globais
window.openServicosModal = openServicosModal;
window.openNovoServico = openNovoServico;
window.editarServico = editarServico;
window.desativarServico = desativarServico;
window.handleServicoSubmit = handleServicoSubmit;
window.closeModal = closeModal;

// Configurar formulário ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const servicoForm = document.getElementById('servicoForm');
    if (servicoForm) {
        servicoForm.addEventListener('submit', handleServicoSubmit);
    }
});
