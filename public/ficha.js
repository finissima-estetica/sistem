// Variáveis globais
let currentClientId = null;
let currentClient = null;
let currentClientAtendimentos = [];
let currentClientPlanos = [];

// Planos disponíveis (6 meses para cada produto)
const planosDisponiveis = [
    {
        id: 'plano_limpeza',
        nome: 'Plano Limpeza de Pele',
        descricao: '6 meses de limpeza de pele mensal',
        duracao: 6,
        preco: 1200,
        procedimentos: ['limpeza_pele']
    },
    {
        id: 'plano_peeling',
        nome: 'Plano Peeling Químico',
        descricao: '6 meses de peeling químico mensal',
        duracao: 6,
        preco: 1800,
        procedimentos: ['peeling']
    },
    {
        id: 'plano_botox',
        nome: 'Plano Botox',
        descricao: '6 meses de botox trimestral',
        duracao: 6,
        preco: 3600,
        procedimentos: ['botox']
    },
    {
        id: 'plano_preenchimento',
        nome: 'Plano Preenchimento Facial',
        descricao: '6 meses de preenchimento facial trimestral',
        duracao: 6,
        preco: 4200,
        procedimentos: ['preenchimento']
    },
    {
        id: 'plano_laser',
        nome: 'Plano Laser',
        descricao: '6 meses de laser mensal',
        duracao: 6,
        preco: 2400,
        procedimentos: ['laser']
    },
    {
        id: 'plano_drenagem',
        nome: 'Plano Drenagem Linfática',
        descricao: '6 meses de drenagem linfática semanal',
        duracao: 6,
        preco: 1800,
        procedimentos: ['drenagem']
    },
    {
        id: 'plano_massagem',
        nome: 'Plano Massagem',
        descricao: '6 meses de massagem semanal',
        duracao: 6,
        preco: 1500,
        procedimentos: ['massagem']
    },
    {
        id: 'plano_carboxiterapia',
        nome: 'Plano Carboxiterapia',
        descricao: '6 meses de carboxiterapia semanal',
        duracao: 6,
        preco: 2000,
        procedimentos: ['carboxiterapia']
    },
    {
        id: 'plano_microneedling',
        nome: 'Plano Microneedling',
        descricao: '6 meses de microneedling mensal',
        duracao: 6,
        preco: 2200,
        procedimentos: ['microneedling']
    },
    {
        id: 'plano_completo',
        nome: 'Plano Completo',
        descricao: '6 meses com todos os procedimentos disponíveis',
        duracao: 6,
        preco: 6000,
        procedimentos: ['limpeza_pele', 'peeling', 'botox', 'preenchimento', 'laser', 'drenagem', 'massagem', 'carboxiterapia', 'microneedling']
    }
];

// Mapeamento de procedimentos para nomes
const procedimentosNomes = {
    'limpeza_pele': 'Limpeza de Pele',
    'peeling': 'Peeling Químico',
    'botox': 'Botox',
    'preenchimento': 'Preenchimento Facial',
    'laser': 'Laser',
    'drenagem': 'Drenagem Linfática',
    'massagem': 'Massagem',
    'carboxiterapia': 'Carboxiterapia',
    'microneedling': 'Microneedling',
    'outros': 'Outros'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Só executar se estiver na página ficha.html
    if (window.location.pathname.includes('ficha.html')) {
        loadClientData();
        setupTabs();
        setupForms();
    }
});

// Carregar dados do cliente
function loadClientData() {
    const urlParams = new URLSearchParams(window.location.search);
    currentClientId = urlParams.get('id');
    
    if (!currentClientId) {
        alert('Cliente não encontrado. Redirecionando para o dashboard.');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar clientes do localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    currentClient = clients.find(c => c.id == currentClientId);
    
    if (!currentClient) {
        alert('Cliente não encontrado. Redirecionando para o dashboard.');
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar atendimentos do cliente
    const atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
    currentClientAtendimentos = atendimentos.filter(a => a.clienteId == currentClientId);
    
    // Carregar planos do cliente
    const planos = JSON.parse(localStorage.getItem('planos') || '[]');
    currentClientPlanos = planos.filter(p => p.clienteId == currentClientId);
    
    // Atualizar UI
    updateClientInfo();
    loadAtendimentos();
    loadPlanos();
    loadDadosCompletos();
}

// Atualizar informações do cliente na UI
function updateClientInfo() {
    const nome = currentClient.nome || currentClient.name || 'Nome não informado';
    const email = currentClient.email || 'Email não informado';
    const telefone = currentClient.telefone || currentClient.phone || 'Telefone não informado';
    const dataCadastro = currentClient.dataCadastro || new Date().toISOString();
    
    // Atualizar avatar com iniciais
    const initials = nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('clientInitials').textContent = initials;
    
    // Atualizar informações
    document.getElementById('clientName').textContent = nome;
    document.getElementById('clientContact').textContent = `${email} | ${telefone}`;
    
    // Atualizar data de cadastro
    const dataFormatada = new Date(dataCadastro).toLocaleDateString('pt-BR');
    document.getElementById('clientSince').textContent = `Cliente desde: ${dataFormatada}`;
    
    // Atualizar status de plano
    const planosAtivos = currentClientPlanos.filter(p => isPlanoAtivo(p));
    if (planosAtivos.length > 0) {
        document.getElementById('planStatus').textContent = `${planosAtivos.length} Plano(s) Ativo(s)`;
        document.getElementById('planStatus').classList.add('ativo');
    } else {
        document.getElementById('planStatus').textContent = 'Sem Plano';
        document.getElementById('planStatus').classList.remove('ativo');
    }
    
    // Atualizar estatísticas
    document.getElementById('totalAtendimentos').textContent = currentClientAtendimentos.length;
    document.getElementById('planosAtivos').textContent = planosAtivos.length;
    
    if (currentClientAtendimentos.length > 0) {
        const ultimoAtendimento = currentClientAtendimentos[currentClientAtendimentos.length - 1];
        document.getElementById('ultimoAtendimento').textContent = new Date(ultimoAtendimento.data).toLocaleDateString('pt-BR');
    } else {
        document.getElementById('ultimoAtendimento').textContent = '--';
    }
}

// Verificar se plano está ativo
function isPlanoAtivo(plano) {
    const hoje = new Date();
    const dataFim = new Date(plano.dataFim);
    return dataFim >= hoje;
}

// Configurar abas
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remover classe active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Adicionar classe active ao clicado
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Carregar dados específicos da aba
            if (tabId === 'desempenho') {
                loadDesempenho();
            }
        });
    });
}

// Configurar formulários
function setupForms() {
    // Formulário de atendimento
    const atendimentoForm = document.getElementById('atendimentoForm');
    atendimentoForm.addEventListener('submit', handleAtendimentoSubmit);
    
    // Formulário de plano
    const planoForm = document.getElementById('planoForm');
    planoForm.addEventListener('submit', handlePlanoSubmit);
    
    // Configurar data de início como hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInicio').value = hoje;
    document.getElementById('dataAtendimento').value = hoje;
    
    // Carregar planos disponíveis
    loadPlanosDisponiveis();
    
    // Carregar planos do cliente no select
    loadPlanosSelect();
}

// Carregar atendimentos
function loadAtendimentos() {
    const atendimentosList = document.getElementById('atendimentosList');
    
    if (currentClientAtendimentos.length === 0) {
        atendimentosList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum atendimento registrado ainda.</p>
                <p>Clique em "Novo Atendimento" para começar.</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const atendimentosOrdenados = [...currentClientAtendimentos].sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    );
    
    atendimentosList.innerHTML = atendimentosOrdenados.map(atendimento => {
        const dataFormatada = new Date(atendimento.data).toLocaleDateString('pt-BR');
        const procedimentoNome = procedimentosNomes[atendimento.tipo] || atendimento.tipo;
        const planoVinculado = atendimento.planoId ? currentClientPlanos.find(p => p.id == atendimento.planoId) : null;
        
        return `
            <div class="atendimento-card">
                <div class="atendimento-header">
                    <span class="atendimento-date">${dataFormatada}</span>
                    <span class="atendimento-type">${procedimentoNome}</span>
                    ${planoVinculado ? '<span class="plano-badge">Plano</span>' : ''}
                </div>
                <div class="atendimento-details">
                    ${atendimento.peso ? `<div class="atendimento-detail"><label>Peso:</label><span>${atendimento.peso} kg</span></div>` : ''}
                    ${atendimento.cintura ? `<div class="atendimento-detail"><label>Cintura:</label><span>${atendimento.cintura} cm</span></div>` : ''}
                    ${atendimento.quadril ? `<div class="atendimento-detail"><label>Quadril:</label><span>${atendimento.quadril} cm</span></div>` : ''}
                </div>
                ${atendimento.observacoes ? `<div class="atendimento-obs"><strong>Observações:</strong> ${atendimento.observacoes}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Carregar planos
function loadPlanos() {
    const planosList = document.getElementById('planosList');
    
    if (currentClientPlanos.length === 0) {
        planosList.innerHTML = `
            <div class="empty-state">
                <p>Nenhum plano vinculado a este cliente.</p>
                <p>Clique em "Adicionar Plano" para vincular.</p>
            </div>
        `;
        return;
    }
    
    planosList.innerHTML = currentClientPlanos.map(plano => {
        const planoInfo = planosDisponiveis.find(p => p.id == plano.planoId);
        const nomePlano = planoInfo ? planoInfo.nome : plano.planoId;
        const dataInicio = new Date(plano.dataInicio).toLocaleDateString('pt-BR');
        const dataFim = new Date(plano.dataFim).toLocaleDateString('pt-BR');
        const ativo = isPlanoAtivo(plano);
        
        return `
            <div class="plano-card">
                <div class="plano-header">
                    <span class="plano-name">${nomePlano}</span>
                    <span class="plano-status">${ativo ? 'Ativo' : 'Expirado'}</span>
                </div>
                <div class="plano-details">
                    <div class="plano-detail"><label>Início:</label><span>${dataInicio}</span></div>
                    <div class="plano-detail"><label>Término:</label><span>${dataFim}</span></div>
                    <div class="plano-detail"><label>Duração:</label><span>${planoInfo ? planoInfo.duracao : 6} meses</span></div>
                </div>
            </div>
        `;
    }).join('');
}

// Carregar dados completos
function loadDadosCompletos() {
    const dadosCompletos = document.getElementById('dadosCompletos');
    
    const dados = {
        'Dados Pessoais': {
            'Nome': currentClient.nome || currentClient.name || '--',
            'CPF': currentClient.cpf || '--',
            'Data de Nascimento': currentClient.dataNascimento ? new Date(currentClient.dataNascimento).toLocaleDateString('pt-BR') : '--',
            'Telefone': currentClient.telefone || currentClient.phone || '--',
            'Email': currentClient.email || '--'
        },
        'Endereço': {
            'Endereço': currentClient.endereco || '--',
            'Cidade': currentClient.cidade || '--',
            'Estado': currentClient.estado || '--'
        },
        'Anamnese': {
            'Doenças Crônicas': currentClient.doencasCronicas || 'Não informado',
            'Medicamentos': currentClient.medicamentos || 'Não informado',
            'Cirurgias': currentClient.cirurgias || 'Não informado',
            'Alergias': currentClient.alergias || 'Não informado',
            'Fumante': currentClient.fumante || 'Não informado',
            'Álcool': currentClient.alcool || 'Não informado',
            'Atividade Física': currentClient.atividadeFisica || 'Não informado'
        },
        'Medidas Iniciais': {
            'Peso': currentClient.peso ? `${currentClient.peso} kg` : '--',
            'Altura': currentClient.altura ? `${currentClient.altura} cm` : '--',
            'Braço Direito': currentClient.bracoDireito ? `${currentClient.bracoDireito} cm` : '--',
            'Braço Esquerdo': currentClient.bracoEsquerdo ? `${currentClient.bracoEsquerdo} cm` : '--',
            'Tórax': currentClient.torax ? `${currentClient.torax} cm` : '--',
            'Cintura': currentClient.cintura ? `${currentClient.cintura} cm` : '--',
            'Abdômen': currentClient.abdomen ? `${currentClient.abdomen} cm` : '--',
            'Quadril': currentClient.quadril ? `${currentClient.quadril} cm` : '--'
        }
    };
    
    let html = '';
    for (const [section, items] of Object.entries(dados)) {
        html += `
            <div class="dados-section">
                <h4>${section}</h4>
                <div class="dados-grid">
                    ${Object.entries(items).map(([label, value]) => `
                        <div class="dado-item">
                            <label>${label}:</label>
                            <span>${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    dadosCompletos.innerHTML = html;
}

// Carregar desempenho
// Função para carregar aba de desempenho
async function loadDesempenho() {
    try {
        // Buscar dados do cliente
        if (typeof isApiAvailable === 'function' && await isApiAvailable()) {
            const clienteData = await clientesAPI.buscar(currentClientId);
            const atendimentosData = await clientesAPI.buscarAtendimentos(currentClientId);
            currentClient = clienteData;
            currentAtendimentos = atendimentosData;
        } else {
            // Fallback para localStorage
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
            currentClient = clients.find(c => c.id == currentClientId);
            currentAtendimentos = atendimentos.filter(a => a.clienteId == currentClientId);
        }
        
        // Gerar visualização do corpo
        generateBodyVisualization();
        
        // Gerar detalhes das zonas
        generateZonesDetails();
        
        // Calcular métricas gerais
        calculateMetrics();
        
    } catch (error) {
        console.error('Erro ao carregar aba de desempenho:', error);
    }
}
    updateMedidasTable(atendimentosPeriodo);
}

// Atualizar gráficos (placeholder)
function updateCharts(atendimentos) {
    const pesoChart = document.getElementById('pesoChart');
    const cinturaChart = document.getElementById('cinturaChart');
    
    if (atendimentos.length === 0) {
        pesoChart.innerHTML = '<p>Sem dados suficientes para análise.</p>';
        cinturaChart.innerHTML = '<p>Sem dados suficientes para análise.</p>';
        return;
    }
    
    // Ordenar por data
    const atendimentosOrdenados = [...atendimentos].sort((a, b) => 
        new Date(a.data) - new Date(b.data)
    );
    
    // Criar dados para gráfico de peso
    const pesos = atendimentosOrdenados.filter(a => a.peso).map(a => ({
        data: new Date(a.data).toLocaleDateString('pt-BR'),
        valor: a.peso
    }));
    
    // Criar dados para gráfico de cintura
    const cinturas = atendimentosOrdenados.filter(a => a.cintura).map(a => ({
        data: new Date(a.data).toLocaleDateString('pt-BR'),
        valor: a.cintura
    }));
    
    // Placeholder - em produção seria implementado com Chart.js ou similar
    if (pesos.length > 0) {
        pesoChart.innerHTML = `
            <div style="text-align: left;">
                <p><strong>Evolução do Peso:</strong></p>
                ${pesos.map(p => `<p>${p.data}: ${p.valor} kg</p>`).join('')}
            </div>
        `;
    } else {
        pesoChart.innerHTML = '<p>Sem dados de peso registrados.</p>';
    }
    
    if (cinturas.length > 0) {
        cinturaChart.innerHTML = `
            <div style="text-align: left;">
                <p><strong>Evolução da Cintura:</strong></p>
                ${cinturas.map(c => `<p>${c.data}: ${c.valor} cm</p>`).join('')}
            </div>
        `;
    } else {
        cinturaChart.innerHTML = '<p>Sem dados de cintura registrados.</p>';
    }
}

// Atualizar tabela de medidas
function updateMedidasTable(atendimentos) {
    const medidasTable = document.getElementById('medidasTable');
    
    if (atendimentos.length === 0) {
        medidasTable.innerHTML = '<p>Sem dados de medidas registrados no período selecionado.</p>';
        return;
    }
    
    // Calcular variações
    const primeiro = atendimentos[0];
    const ultimo = atendimentos[atendimentos.length - 1];
    
    const variacoes = {};
    const medidas = ['peso', 'cintura', 'quadril', 'abdomen', 'bracoDireito', 'bracoEsquerdo'];
    
    medidas.forEach(medida => {
        if (primeiro[medida] && ultimo[medida]) {
            const variacao = ultimo[medida] - primeiro[medida];
            const sinal = variacao > 0 ? '+' : '';
            variacoes[medida] = `${sinal}${variacao.toFixed(1)}`;
        }
    });
    
    medidasTable.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Medida</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Inicial</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Atual</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Variação</th>
                </tr>
            </thead>
            <tbody>
                ${medidas.filter(m => primeiro[m] || ultimo[m]).map(medida => `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${medida.charAt(0).toUpperCase() + medida.slice(1)}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${primeiro[medida] || '--'}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${ultimo[medida] || '--'}</td>
                        <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: ${variacoes[medida] && variacoes[medida].includes('-') ? 'green' : 'red'};">${variacoes[medida] || '--'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Carregar planos disponíveis
function loadPlanosDisponiveis() {
    const planosContainer = document.getElementById('planosDisponiveis');
    
    planosContainer.innerHTML = planosDisponiveis.map(plano => `
        <div class="plano-option" onclick="selectPlano('${plano.id}')">
            <input type="radio" name="planoSelecionado" value="${plano.id}" id="plano_${plano.id}">
            <h4>${plano.nome}</h4>
            <p>${plano.descricao}</p>
            <p><strong>Duração:</strong> ${plano.duracao} meses | <strong>Preço:</strong> R$ ${plano.preco.toFixed(2)}</p>
        </div>
    `).join('');
}

// Selecionar plano
function selectPlano(planoId) {
    document.querySelectorAll('.plano-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`#plano_${planoId}`).parentElement;
    selectedOption.classList.add('selected');
    document.querySelector(`#plano_${planoId}`).checked = true;
    
    // Atualizar data de término
    const planoInfo = planosDisponiveis.find(p => p.id == planoId);
    const dataInicio = new Date(document.getElementById('dataInicio').value);
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + planoInfo.duracao);
    
    document.getElementById('dataFim').value = dataFim.toISOString().split('T')[0];
}

// Carregar planos do cliente no select
function loadPlanosSelect() {
    const select = document.getElementById('planoVinculado');
    
    // Manter opção de atendimento único
    select.innerHTML = '<option value="">Atendimento Único (Fora de Plano)</option>';
    
    // Adicionar planos ativos
    const planosAtivos = currentClientPlanos.filter(p => isPlanoAtivo(p));
    planosAtivos.forEach(plano => {
        const planoInfo = planosDisponiveis.find(p => p.id == plano.planoId);
        const nomePlano = planoInfo ? planoInfo.nome : plano.planoId;
        select.innerHTML += `<option value="${plano.id}">${nomePlano}</option>`;
    });
}

// Abrir modal de novo atendimento
function openNovoAtendimento() {
    document.getElementById('modalAtendimento').classList.add('active');
}

// Abrir modal de novo plano
function openNovoPlano() {
    document.getElementById('modalPlano').classList.add('active');
}

// Fechar modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Lidar com envio de atendimento
function handleAtendimentoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const atendimento = {
        id: Date.now(),
        clienteId: currentClientId,
        data: formData.get('dataAtendimento'),
        tipo: formData.get('tipoAtendimento'),
        planoId: formData.get('planoVinculado') || null,
        observacoes: formData.get('observacoes'),
        peso: formData.get('pesoAtual') || null,
        bracoDireito: formData.get('bracoDireitoAtual') || null,
        bracoEsquerdo: formData.get('bracoEsquerdoAtual') || null,
        torax: formData.get('toraxAtual') || null,
        cintura: formData.get('cinturaAtual') || null,
        abdomen: formData.get('abdomenAtual') || null,
        quadril: formData.get('quadrilAtual') || null,
        coxaDireita: formData.get('coxaDireitaAtual') || null,
        coxaEsquerda: formData.get('coxaEsquerdaAtual') || null
    };
    
    // Salvar no localStorage
    const atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
    atendimentos.push(atendimento);
    localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
    
    // Atualizar lista local
    currentClientAtendimentos.push(atendimento);
    
    // Atualizar UI
    loadAtendimentos();
    updateClientInfo();
    
    // Fechar modal e limpar formulário
    closeModal('modalAtendimento');
    e.target.reset();
    
    alert('Atendimento registrado com sucesso!');
}

// Lidar com envio de plano
function handlePlanoSubmit(e) {
    e.preventDefault();
    
    const planoSelecionado = document.querySelector('input[name="planoSelecionado"]:checked');
    if (!planoSelecionado) {
        alert('Selecione um plano para vincular.');
        return;
    }
    
    const formData = new FormData(e.target);
    const plano = {
        id: Date.now(),
        clienteId: currentClientId,
        planoId: planoSelecionado.value,
        dataInicio: formData.get('dataInicio'),
        dataFim: formData.get('dataFim'),
        observacoes: formData.get('observacoesPlano')
    };
    
    // Salvar no localStorage
    const planos = JSON.parse(localStorage.getItem('planos') || '[]');
    planos.push(plano);
    localStorage.setItem('planos', JSON.stringify(planos));
    
    // Atualizar lista local
    currentClientPlanos.push(plano);
    
    // Atualizar UI
    loadPlanos();
    updateClientInfo();
    loadPlanosSelect();
    
    // Fechar modal e limpar formulário
    closeModal('modalPlano');
    e.target.reset();
    
    alert('Plano vinculado com sucesso!');
}

// Voltar ao dashboard
function goBack() {
    window.location.href = 'index.html';
}

// Editar cliente (placeholder)
function editCliente() {
    alert('Funcionalidade de edição será implementada em breve.');
}

// Função para ativar/desativar cliente
async function toggleClientStatus() {
    const currentStatus = currentClient.status || 'Ativo';
    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    
    if (confirm(`Deseja alterar o status do cliente para ${newStatus}?`)) {
        try {
            // Tentar usar API primeiro
            if (typeof isApiAvailable === 'function' && await isApiAvailable()) {
                await clientesAPI.atualizar(currentClientId, { status: newStatus });
                currentClient.status = newStatus;
            } else {
                // Fallback para localStorage
                const clients = JSON.parse(localStorage.getItem('clients') || '[]');
                const clientIndex = clients.findIndex(c => c.id == currentClientId);
                if (clientIndex !== -1) {
                    clients[clientIndex].status = newStatus;
                    localStorage.setItem('clients', JSON.stringify(clients));
                    currentClient.status = newStatus;
                }
            }
            
            // Atualizar UI
            updateClientInfo();
            alert(`Cliente alterado para ${newStatus}`);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Erro ao alterar status do cliente');
        }
    }
}

// Função para excluir cliente
async function deleteClient() {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados serão perdidos.')) {
        if (confirm('Esta ação é irreversível. Confirma a exclusão do cliente?')) {
            try {
                // Tentar usar API primeiro
                if (typeof isApiAvailable === 'function' && await isApiAvailable()) {
                    // Excluir cliente no PostgreSQL
                    await clientesAPI.excluir(currentClientId);
                } else {
                    // Fallback para localStorage
                    let clients = JSON.parse(localStorage.getItem('clients') || '[]');
                    clients = clients.filter(c => c.id != currentClientId);
                    localStorage.setItem('clients', JSON.stringify(clients));
                    
                    // Excluir atendimentos e planos relacionados
                    let atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
                    atendimentos = atendimentos.filter(a => a.clienteId != currentClientId);
                    localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
                    
                    let planos = JSON.parse(localStorage.getItem('planos') || '[]');
                    planos = planos.filter(p => p.clienteId != currentClientId);
                    localStorage.setItem('planos', JSON.stringify(planos));
                }
                
                alert('Cliente excluído com sucesso!');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                alert('Erro ao excluir cliente');
            }
        }
    }
}

// Função para gerar visualização do corpo
function generateBodyVisualization() {
    const container = document.getElementById('bodyVisualization');
    if (!container) return;
    
    // Zonas do corpo com suas coordenadas no SVG
    const bodyZones = {
        'braco_direito': { path: 'M80,50 L85,120 L90,120 L85,50 Z', label: 'Braço Direito' },
        'braco_esquerdo': { path: 'M120,50 L115,120 L110,120 L115,50 Z', label: 'Braço Esquerdo' },
        'torax': { path: 'M85,120 L90,120 L90,180 L85,180 Z', label: 'Tórax' },
        'cintura': { path: 'M85,180 L90,180 L90,220 L85,220 Z', label: 'Cintura' },
        'abdomen': { path: 'M85,220 L90,220 L90,260 L85,260 Z', label: 'Abdômen' },
        'quadril': { path: 'M85,260 L90,260 L90,300 L85,300 Z', label: 'Quadril' },
        'coxa_direita': { path: 'M85,300 L90,300 L92,360 L87,360 Z', label: 'Coxa Direita' },
        'coxa_esquerda': { path: 'M83,300 L88,300 L90,360 L85,360 Z', label: 'Coxa Esquerda' },
        'panturrilha_direita': { path: 'M87,360 L92,360 L92,400 L87,400 Z', label: 'Panturrilha Direita' },
        'panturrilha_esquerda': { path: 'M85,360 L90,360 L90,400 L85,400 Z', label: 'Panturrilha Esquerda' }
    };
    
    // Criar SVG do corpo
    let svg = `
        <svg viewBox="0 0 200 450" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
            <!-- Cabeça -->
            <ellipse cx="100" cy="35" rx="20" ry="25" fill="#e9ecef" stroke="#6c757d" stroke-width="2"/>
            
            <!-- Pescoço -->
            <rect x="90" y="55" width="20" height="15" fill="#e9ecef" stroke="#6c757d" stroke-width="2"/>
            
            <!-- Ombros -->
            <line x1="70" y1="70" x2="130" y2="70" stroke="#6c757d" stroke-width="3"/>
    `;
    
    // Adicionar zonas com cores baseadas na análise
    Object.keys(bodyZones).forEach(zoneKey => {
        const zone = bodyZones[zoneKey];
        const analysis = analyzeZone(zoneKey);
        const color = analysis.color;
        
        svg += `
            <path d="${zone.path}" fill="${color}" stroke="#6c757d" stroke-width="1" opacity="0.7"/>
            <text x="100" y="${zone.label === 'Tórax' ? 150 : zone.label === 'Cintura' ? 200 : zone.label === 'Abdômen' ? 240 : zone.label === 'Quadril' ? 280 : 100}" 
                  text-anchor="middle" font-size="8" fill="#333">${zone.label}</text>
        `;
    });
    
    svg += '</svg>';
    container.innerHTML = svg;
}

// Função para analisar uma zona específica
function analyzeZone(zoneKey) {
    if (!currentAtendimentos || currentAtendimentos.length < 2) {
        return { color: '#6c757d', change: 0, percentage: 0, current: '--', previous: '--' };
    }
    
    // Pegar primeiro e último atendimento
    const firstAtendimento = currentAtendimentos[currentAtendimentos.length - 1];
    const lastAtendimento = currentAtendimentos[0];
    
    // Mapear zona para o campo correto
    const zoneMapping = {
        'braco_direito': 'bracoDireito',
        'braco_esquerdo': 'bracoEsquerdo',
        'torax': 'torax',
        'cintura': 'cintura',
        'abdomen': 'abdomen',
        'quadril': 'quadril',
        'coxa_direita': 'coxaDireito',
        'coxa_esquerda': 'coxaEsquerdo',
        'panturrilha_direita': 'panturrilhaDireita',
        'panturrilha_esquerda': 'panturrilhaEsquerda'
    };
    
    const field = zoneMapping[zoneKey];
    const current = parseFloat(lastAtendimento[field]) || 0;
    const previous = parseFloat(firstAtendimento[field]) || 0;
    
    if (current === 0 || previous === 0) {
        return { color: '#6c757d', change: 0, percentage: 0, current: '--', previous: '--' };
    }
    
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    
    // Lógica de cores: verde para redução, vermelho para aumento
    // (para tratamentos estéticos, geralmente queremos redução)
    let color = '#6c757d';
    if (change < 0) {
        color = '#28a745'; // Verde - redução
    } else if (change > 0) {
        color = '#dc3545'; // Vermelho - aumento
    }
    
    return {
        color,
        change: change.toFixed(1),
        percentage,
        current: current.toFixed(1),
        previous: previous.toFixed(1)
    };
}

// Função para gerar detalhes das zonas
function generateZonesDetails() {
    const container = document.getElementById('zonesDetails');
    if (!container) return;
    
    const zones = [
        { key: 'braco_direito', label: 'Braço Direito' },
        { key: 'braco_esquerdo', label: 'Braço Esquerdo' },
        { key: 'torax', label: 'Tórax' },
        { key: 'cintura', label: 'Cintura' },
        { key: 'abdomen', label: 'Abdômen' },
        { key: 'quadril', label: 'Quadril' },
        { key: 'coxa_direita', label: 'Coxa Direita' },
        { key: 'coxa_esquerda', label: 'Coxa Esquerda' },
        { key: 'panturrilha_direita', label: 'Panturrilha Direita' },
        { key: 'panturrilha_esquerda', label: 'Panturrilha Esquerda' }
    ];
    
    let html = '';
    zones.forEach(zone => {
        const analysis = analyzeZone(zone.key);
        const changeClass = analysis.change < 0 ? 'green' : analysis.change > 0 ? 'red' : '';
        const changeText = analysis.change !== 0 ? `${analysis.change > 0 ? '+' : ''}${analysis.change} cm (${analysis.percentage}%)` : 'Sem alteração';
        
        html += `
            <div class="zone-card ${changeClass}">
                <h4>${zone.label}</h4>
                <div class="zone-measurements">
                    <span>Inicial: ${analysis.previous} cm</span>
                    <span>Atual: ${analysis.current} cm</span>
                </div>
                <div class="zone-change ${changeClass}">${changeText}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Função para calcular métricas gerais
function calculateMetrics() {
    if (!currentAtendimentos || currentAtendimentos.length < 1) return;
    
    const firstAtendimento = currentAtendimentos[currentAtendimentos.length - 1];
    const lastAtendimento = currentAtendimentos[0];
    
    // Peso
    const pesoAtual = parseFloat(lastAtendimento.peso) || 0;
    const pesoInicial = parseFloat(firstAtendimento.peso) || 0;
    const pesoChange = pesoAtual - pesoInicial;
    const pesoPercentage = pesoInicial > 0 ? ((pesoChange / pesoInicial) * 100).toFixed(1) : 0;
    
    const pesoMetric = document.getElementById('pesoMetric');
    if (pesoMetric) {
        pesoMetric.querySelector('.metric-value').textContent = pesoAtual > 0 ? `${pesoAtual} kg` : '--';
        const pesoChangeClass = pesoChange < 0 ? 'green' : pesoChange > 0 ? 'red' : '';
        pesoMetric.querySelector('.metric-change').className = `metric-change ${pesoChangeClass}`;
        pesoMetric.querySelector('.metric-change').textContent = pesoChange !== 0 ? `${pesoChange > 0 ? '+' : ''}${pesoChange} kg (${pesoPercentage}%)` : 'Sem alteração';
    }
    
    // Altura
    const alturaAtual = parseFloat(currentClient.altura) || 0;
    const alturaMetric = document.getElementById('alturaMetric');
    if (alturaMetric) {
        alturaMetric.querySelector('.metric-value').textContent = alturaAtual > 0 ? `${alturaAtual} cm` : '--';
        alturaMetric.querySelector('.metric-change').textContent = 'Altura fixa';
    }
    
    // IMC
    if (alturaAtual > 0 && pesoAtual > 0) {
        const alturaM = alturaAtual / 100;
        const imc = (pesoAtual / (alturaM * alturaM)).toFixed(1);
        const imcMetric = document.getElementById('imcMetric');
        if (imcMetric) {
            imcMetric.querySelector('.metric-value').textContent = imc;
            
            let imcClass = '';
            let imcStatus = '';
            if (imc < 18.5) {
                imcClass = 'red';
                imcStatus = 'Abaixo do peso';
            } else if (imc < 25) {
                imcClass = 'green';
                imcStatus = 'Peso normal';
            } else if (imc < 30) {
                imcClass = 'red';
                imcStatus = 'Sobrepeso';
            } else {
                imcClass = 'red';
                imcStatus = 'Obesidade';
            }
            
            imcMetric.querySelector('.metric-change').className = `metric-change ${imcClass}`;
            imcMetric.querySelector('.metric-change').textContent = imcStatus;
        }
    }
}

// Tornar funções globais
window.goBack = goBack;
window.openNovoAtendimento = openNovoAtendimento;
window.openNovoPlano = openNovoPlano;
window.closeModal = closeModal;
window.selectPlano = selectPlano;
window.editCliente = editCliente;