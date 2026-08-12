// Variáveis globais
let pacotes = [];
let pacoteEditando = null;
let servicosDisponiveis = [];

// Abrir modal de pacotes
function openPacotesModal() {
    document.getElementById('modalPacotes').classList.add('active');
    loadPacotes();
}

// Carregar pacotes
async function loadPacotes() {
    try {
        console.log('🔌 Carregando pacotes...');
        pacotes = await pacotesAPI.listar();
        console.log('📊 Pacotes carregados:', pacotes);
        renderPacotes();
    } catch (error) {
        console.error('❌ Erro ao carregar pacotes:', error);
        document.getElementById('pacotesList').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar pacotes: ${error.message}</p>
            </div>
        `;
    }
}

// Renderizar lista de pacotes
function renderPacotes() {
    const pacotesList = document.getElementById('pacotesList');
    
    if (pacotes.length === 0) {
        pacotesList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum pacote cadastrado ainda.</p>
                <p>Clique em "Novo Pacote" para começar.</p>
            </div>
        `;
        return;
    }
    
    pacotesList.innerHTML = pacotes.map(pacote => `
        <div class="pacote-card">
            <div class="pacote-info">
                <h4>${pacote.nome}</h4>
                <p class="pacote-servico">Serviço: ${pacote.servico_nome || 'N/A'}</p>
                <p class="pacote-sessoes">Sessões: ${pacote.numero_sessoes}</p>
                <p class="pacote-valor">R$ ${parseFloat(pacote.valor).toFixed(2)}</p>
                ${pacote.descricao ? `<p class="pacote-descricao">${pacote.descricao}</p>` : ''}
            </div>
            <div class="pacote-actions">
                <button class="btn-edit" onclick="editarPacote(${pacote.id})">✏️</button>
                <button class="btn-delete" onclick="desativarPacote(${pacote.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Abrir modal para novo pacote
async function openNovoPacote() {
    pacoteEditando = null;
    document.getElementById('pacoteModalTitle').textContent = 'Novo Pacote';
    document.getElementById('pacoteForm').reset();
    
    // Carregar serviços disponíveis
    await carregarServicosParaPacote();
    
    document.getElementById('modalPacote').classList.add('active');
}

// Carregar serviços para o select do pacote
async function carregarServicosParaPacote() {
    try {
        servicosDisponiveis = await servicosAPI.listar();
        
        const select = document.getElementById('pacoteServico');
        select.innerHTML = '<option value="">Selecione um serviço</option>';
        
        servicosDisponiveis.forEach(servico => {
            select.innerHTML += `<option value="${servico.id}">${servico.nome} - R$ ${parseFloat(servico.valor_medio).toFixed(2)}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Editar pacote
async function editarPacote(id) {
    const pacote = pacotes.find(p => p.id === id);
    if (!pacote) return;
    
    pacoteEditando = pacote;
    document.getElementById('pacoteModalTitle').textContent = 'Editar Pacote';
    
    // Carregar serviços disponíveis
    await carregarServicosParaPacote();
    
    document.getElementById('pacoteNome').value = pacote.nome;
    document.getElementById('pacoteServico').value = pacote.servico_id;
    document.getElementById('pacoteSessoes').value = pacote.numero_sessoes;
    document.getElementById('pacoteValor').value = pacote.valor;
    document.getElementById('pacoteDescricao').value = pacote.descricao || '';
    
    document.getElementById('modalPacote').classList.add('active');
}

// Desativar pacote
async function desativarPacote(id) {
    if (!confirm('Tem certeza que deseja desativar este pacote?')) return;
    
    try {
        await pacotesAPI.excluir(id);
        await loadPacotes();
    } catch (error) {
        console.error('Erro ao desativar pacote:', error);
        alert('Erro ao desativar pacote. Tente novamente.');
    }
}

// Lidar com envio do formulário de pacote
async function handlePacoteSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const pacote = {
        nome: formData.get('pacoteNome'),
        servicoId: parseInt(formData.get('pacoteServico')),
        numeroSessoes: parseInt(formData.get('pacoteSessoes')),
        valor: parseFloat(formData.get('pacoteValor')),
        descricao: formData.get('pacoteDescricao') || null
    };
    
    try {
        if (pacoteEditando) {
            await pacotesAPI.atualizar(pacoteEditando.id, pacote);
        } else {
            await pacotesAPI.criar(pacote);
        }
        
        closeModal('modalPacote');
        await loadPacotes();
    } catch (error) {
        console.error('Erro ao salvar pacote:', error);
        alert('Erro ao salvar pacote. Tente novamente.');
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Configurar formulário de pacote
document.addEventListener('DOMContentLoaded', () => {
    const pacoteForm = document.getElementById('pacoteForm');
    if (pacoteForm) {
        pacoteForm.addEventListener('submit', handlePacoteSubmit);
    }
});