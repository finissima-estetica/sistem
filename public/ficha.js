// Variáveis globais
let currentClientId = null;
let currentClient = null;
let currentClientAtendimentos = [];
let currentClientPlanos = [];
let currentAtendimentos = []; // Para a aba de desempenho

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
async function loadClientData() {
    const urlParams = new URLSearchParams(window.location.search);
    currentClientId = urlParams.get('id');
    
    console.log('Carregando cliente com ID:', currentClientId);
    
    if (!currentClientId) {
        alert('Cliente não encontrado. Redirecionando para o dashboard.');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Tentar usar API primeiro
        if (typeof isApiAvailable === 'function' && await isApiAvailable()) {
            console.log('Tentando buscar cliente via API...');
            const clienteData = await clientesAPI.buscar(currentClientId);
            const atendimentosData = await clientesAPI.buscarAtendimentos(currentClientId);
            const planosData = await clientesAPI.buscarPlanos(currentClientId);
            
            currentClient = clienteData;
            currentClientAtendimentos = atendimentosData;
            currentClientPlanos = planosData;
            currentAtendimentos = atendimentosData;
            
            console.log('Dados carregados da API:', currentClient);
        } else {
            console.log('API não disponível, usando localStorage...');
            // Fallback para localStorage
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const atendimentos = JSON.parse(localStorage.getItem('atendimentos') || '[]');
            const planos = JSON.parse(localStorage.getItem('planos') || '[]');
            
            currentClient = clients.find(c => c.id == currentClientId);
            currentClientAtendimentos = atendimentos.filter(a => a.clienteId == currentClientId);
            currentClientPlanos = planos.filter(p => p.clienteId == currentClientId);
            currentAtendimentos = currentClientAtendimentos;
            
            console.log('Dados carregados do localStorage:', currentClient);
        }
        
        if (!currentClient) {
            console.error('Cliente não encontrado com ID:', currentClientId);
            alert('Cliente não encontrado. Redirecionando para o dashboard.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Cliente encontrado, atualizando UI...');
        // Atualizar UI
        updateClientInfo();
        loadAtendimentos();
        loadPlanos();
        loadDadosCompletos();
        
    } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        alert('Erro ao carregar dados do cliente: ' + error.message);
    }
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
    const dataFormatada = formatarDataBrasil(dataCadastro);
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
        document.getElementById('ultimoAtendimento').textContent = formatarDataBrasil(ultimoAtendimento.data);
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

// Função auxiliar para formatar data com fuso horário de Brasília
function formatarDataBrasil(dataString) {
    if (!dataString) return '--';
    const dataObj = new Date(dataString);
    if (isNaN(dataObj.getTime())) return '--';
    const offsetBrasil = 3 * 60 * 60 * 1000;
    const dataBrasil = new Date(dataObj.getTime() + offsetBrasil);
    return dataBrasil.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
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
    
    // Ordenar por data (mais recente primeiro) - usando fuso horário de Brasília
    const atendimentosOrdenados = [...currentClientAtendimentos].sort((a, b) => {
        const dataA = new Date(a.data || a.data_atendimento || 0);
        const dataB = new Date(b.data || b.data_atendimento || 0);
        const offsetBrasil = 3 * 60 * 60 * 1000;
        const dataABrasil = new Date(dataA.getTime() + offsetBrasil);
        const dataBBrasil = new Date(dataB.getTime() + offsetBrasil);
        return dataBBrasil - dataABrasil;
    });
    
    atendimentosList.innerHTML = atendimentosOrdenados.map(atendimento => {
        // Formatar data considerando fuso horário de Brasília
        const dataObj = new Date(atendimento.data || atendimento.data_atendimento);
        const offsetBrasil = 3 * 60 * 60 * 1000;
        const dataBrasil = new Date(dataObj.getTime() + offsetBrasil);
        const dataFormatada = dataBrasil.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        
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
        const dataInicio = formatarDataBrasil(plano.dataInicio);
        const dataFim = formatarDataBrasil(plano.dataFim);
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
            'Data de Nascimento': currentClient.dataNascimento ? formatarDataBrasil(currentClient.dataNascimento) : '--',
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
        data: formatarDataBrasil(a.data),
        valor: a.peso
    }));
    
    // Criar dados para gráfico de cintura
    const cinturas = atendimentosOrdenados.filter(a => a.cintura).map(a => ({
        data: formatarDataBrasil(a.data),
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
    if (!currentClient) {
        alert('Dados do cliente não carregados. Tente novamente.');
        return;
    }
    
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
    if (!currentClient) {
        alert('Dados do cliente não carregados. Tente novamente.');
        return;
    }
    
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

// Função para gerar visualização do corpo com SVG do Figma
function generateBodyVisualization() {
    const container = document.getElementById('bodyVisualization');
    if (!container) return;
    
    console.log("Iniciando renderização do corpo SVG do Figma");
    
    // Análise das zonas disponíveis (dados reais do cadastro/atendimentos)
    const realZonesAnalysis = {
        'braco_direito': analyzeZone('braco_direito'),
        'braco_esquerdo': analyzeZone('braco_esquerdo'),
        'torax': analyzeZone('torax'),
        'cintura': analyzeZone('cintura'),
        'abdomen': analyzeZone('abdomen'),
        'quadril': analyzeZone('quadril'),
        'coxa_direita': analyzeZone('coxa_direita'),
        'coxa_esquerda': analyzeZone('coxa_esquerda'),
        'panturrilha_direita': analyzeZone('panturrilha_direita'),
        'panturrilha_esquerda': analyzeZone('panturrilha_esquerda')
    };
    
    console.log("Dados das zonas do banco:", Object.keys(realZonesAnalysis));
    
    // Mapeamento correto: dados do banco -> IDs do SVG (apenas 9 zonas existentes)
    const zoneMapping = {
        'braco_direito': ['zone-arm-r-upper'],
        'braco_esquerdo': ['zone-arm-l-upper'],
        'torax': ['zone-chest'],
        'cintura': ['zone-pelvis'],
        'abdomen': ['zone-ab-upper'],
        'quadril': ['zone-pelvis'],
        'coxa_direita': ['zone-thigh-r'],
        'coxa_esquerda': ['zone-thigh-l'],
        'panturrilha_direita': ['zone-shin-r'],
        'panturrilha_esquerda': ['zone-shin-l']
    };
    
    console.log("Mapeamento de zonas:", zoneMapping);
    
    // Função auxiliar para obter cor com fallback defensivo
    const getZoneColor = (zoneData) => {
        console.log("Obtendo cor para zona:", zoneData);
        const color = zoneData?.color || '#e0e0e0';
        console.log("Cor obtida:", color);
        return color;
    };
    
    // Mapear todas as zonas visuais para suas cores
    const zonesAnalysis = {};
    
    // Iterar sobre o mapeamento e atribuir cores
    Object.keys(zoneMapping).forEach(dataZone => {
        console.log("Processando zona do banco:", dataZone);
        const color = getZoneColor(realZonesAnalysis[dataZone]);
        zoneMapping[dataZone].forEach(svgZoneId => {
            console.log("Mapeando", dataZone, "->", svgZoneId, "com cor:", color);
            zonesAnalysis[svgZoneId] = color;
        });
    });
    
    console.log("Zonas Analysis final:", zonesAnalysis);
    
    // Adicionar fallback para as 9 zonas
    const allSvgZones = [
        'zone-chest', 'zone-ab-upper', 'zone-pelvis',
        'zone-arm-r-upper', 'zone-arm-l-upper',
        'zone-thigh-r', 'zone-thigh-l',
        'zone-shin-r', 'zone-shin-l'
    ];
    
    allSvgZones.forEach(zoneId => {
        if (!zonesAnalysis[zoneId]) {
            console.log("Zona sem mapeamento, usando fallback:", zoneId);
            zonesAnalysis[zoneId] = '#e0e0e0';
        }
    });
    
    console.log("Zonas Analysis final com fallbacks:", zonesAnalysis);
    
    // Função helper segura para obter cor do objeto
    const getSafeColor = (zoneId) => {
        const color = zonesAnalysis[zoneId] || '#e0e0e0';
        console.log("Renderizando zona:", zoneId, "com cor:", color);
        return color;
    };
    
    // SVG do corpo2.svg com IDs de zonas
    let svgContent = `<svg width="435" height="800" viewBox="0 0 435 800" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="corpo2 1" clip-path="url(#clip0_0_1)">
<g id="Group">
<path id="Vector" d="M0.266667 398.933L0 798.667H216.667C358.933 798.667 433.333 798.267 433.333 797.333C433.333 796.533 359.333 796.133 217.333 796.4L1.33333 796.667L0.933333 398L0.666667 -0.666687L0.266667 398.933Z" fill="none"/>
<path id="Vector_2" d="M431.067 395.867C431.333 783.067 431.333 791.733 428.8 791.2C427.467 790.933 426.8 791.2 427.2 791.733C427.733 792.267 428.667 792.667 429.067 792.667C429.6 792.667 430.8 793.2 431.6 793.733C432.933 794.533 433.333 713.867 433.333 397.467C433.333 133.733 432.933 -6.10352e-05 432 -6.10352e-05C431.067 -6.10352e-05 430.8 133.067 431.067 395.867Z" fill="none"/>
<path id="Vector_3" d="M126.267 11.5999C176.267 11.8666 258.4 11.8666 308.933 11.5999C359.333 11.4666 318.533 11.3333 218 11.3333C117.6 11.3333 76.2667 11.4666 126.267 11.5999Z" fill="none"/>
<path id="Vector_4" d="M235.333 44C234.933 44.8 235.467 44.9333 236.533 44.5333C238.933 43.6 239.333 42.6667 237.467 42.6667C236.667 42.6667 235.733 43.2 235.333 44Z" fill="none"/>
<path id="Vector_5" d="M7.33331 417.333C7.33331 622.267 7.46665 706.133 7.59998 603.6C7.86665 501.2 7.86665 333.467 7.59998 230.933C7.46665 128.533 7.33331 212.4 7.33331 417.333Z" fill="none"/>
<path id="Vector_6" d="M226 46.6667C225.6 47.4667 226.133 47.6 227.2 47.2C229.6 46.2667 230 45.3334 228.133 45.3334C227.333 45.3334 226.4 45.8667 226 46.6667Z" fill="none"/>
<path id="Vector_7" d="M237.333 47.8666C226.667 51.2 215.2 60.6666 209.867 70.8C206.4 77.3333 205.6 100.667 208.533 106.4C209.733 108.667 210.667 111.733 210.667 113.067C210.667 114.533 211.6 116.4 212.667 117.333C214.133 118.533 214.667 121.867 214.667 129.2C214.8 141.867 216.267 149.867 219.467 154.4C220.933 156.4 221.867 159.6 221.6 161.467C221.2 164.4 219.2 165.867 206.933 171.733C194.267 177.867 185.867 180.667 172.8 183.333C166.667 184.667 159.333 192.933 156.8 201.333C155.467 205.6 154 218 153.333 230.667C149.867 287.733 149.333 294.133 146.4 304C143.733 313.2 143.6 316.933 143.6 348.667C143.6 371.733 144.4 389.2 145.733 400.667C146.933 410.133 148.267 424.8 148.8 433.2C149.733 447.867 150 448.8 154.8 456.667C160.4 465.6 168.667 471.333 170.133 467.333C170.667 466.267 170.667 464.4 170.133 463.333C169.6 461.867 170.4 461.333 173.333 461.333H177.333V469.733C177.333 487.6 185.067 537.333 192.933 570.533C194.667 577.867 194.8 584.667 194.133 610.667C193.2 642.267 194.267 661.2 198.133 686.667C199.2 693.6 200.4 708.667 200.8 720L201.733 740.8L195.6 746.133C187.867 752.933 168 762.667 155.067 766.133C154.133 766.4 153.333 767.467 153.333 768.667C153.333 770.4 158.267 770.667 192.4 770.667C234.933 770.667 236.267 770.4 237.733 763.2C238.133 761.2 237.2 756.267 235.733 752.133C233.6 746 233.067 740.8 232.933 724C232.8 704.4 233.067 702.133 238 680.667C242.4 661.2 243.2 655.067 243.733 637.867C244.133 620.533 243.733 614.4 240.533 593.2C235.467 561.2 235.467 562.8 245.067 477.333L248.8 444.667L250.533 459.333C251.467 467.333 253.6 486.267 255.333 501.333C257.067 516.4 259.2 536.4 260 545.867C261.733 563.733 261.733 562.933 256.533 594.667C255.333 601.6 254.267 616.933 254 628.667C253.467 650.933 254.533 659.333 261.6 688.667C265.6 705.467 266.133 738.4 262.533 749.6C259.333 759.467 259.333 764.667 262.667 768C265.333 770.667 266.8 770.667 305.067 770.4C339.2 770 344.667 769.733 344.667 768C344.667 766.8 343.2 765.867 340.667 765.6C334.667 765.067 305.2 750 300.667 745.333L296.667 741.067L297.067 722.933C297.2 712.933 298.667 695.467 300.267 684C302.8 666.133 303.2 657.2 303.333 618.667C303.333 588.933 304 572.267 304.933 568.667C309.467 553.2 317.6 505.733 319.333 484.667C321.333 461.2 321.2 461.333 324.667 461.333C327.067 461.333 327.733 461.867 327.2 463.333C326.667 464.4 326.8 466.267 327.2 467.333C327.867 469.2 328.533 469.067 333.067 466.8C336.533 465.067 339.6 461.733 342.933 456.267C347.2 449.067 347.733 446.933 348.533 435.067C349.067 427.867 350.4 413.333 351.6 402.667C353.067 390 353.867 371.333 353.867 348.667C354 316.8 353.733 313.2 350.933 303.333C347.867 291.867 345.333 262.267 345.333 235.333C345.333 201.333 339.067 185.733 324.667 183.333C316.933 182.133 300.8 176.4 288.4 170.267C277.333 165.067 277.333 164.933 277.333 159.867C277.333 157.067 276.133 151.6 274.667 147.867L272.133 140.933L275.333 137.067C278.4 133.467 281.333 125.733 281.333 121.2C281.333 120 282.267 118.667 283.333 118.133C284.4 117.733 285.333 116.133 285.333 114.667C285.333 113.2 286.4 109.733 287.733 106.933C291.6 99.2 290.933 81.6 286.533 72C279.333 56.9333 263.867 46.5333 248.667 46.8C244.267 46.8 239.2 47.3333 237.333 47.8666ZM266 52.9333C274.533 57.2 277.867 60.2667 282.933 69.2C286.4 75.2 287.2 78.4 287.733 86.9333C288.267 96.8 288.267 97.3333 285.467 97.3333C283.2 97.3333 282.667 96.5333 282.667 93.4667C282.667 91.3333 282.267 88.6666 281.867 87.4667C281.333 85.8666 281.867 85.3333 283.867 85.3333C285.467 85.3333 286.667 84.8 286.667 84C286.667 83.3333 285.867 83.0667 284.8 83.4667C282.4 84.4 267.867 71.7333 269.467 70C271.6 67.8666 270.8 66.2667 268.533 68.1333C267.333 69.0667 264.267 70.1333 261.733 70.2667L257.067 70.5333L262.133 66.1333C265.067 63.6 266.933 61.2 266.4 60.6666C265.867 60.1333 263.6 61.8666 261.333 64.5333C257.333 68.9333 256.533 69.3333 249.467 69.3333C241.067 69.3333 238.8 68.1333 234.8 61.3333C233.2 58.8 232 57.6 232 58.6666C232 61.0667 235.6 66.6666 238.667 68.9333C240.267 70.1333 239.733 70.4 235.467 70.1333C231.867 69.7333 229.333 68.6666 227.733 66.6666C226.4 64.9333 224.8 64 224.267 64.5333C223.733 65.0667 224.8 66.6666 226.533 68.1333C230 70.9333 230 70.9333 225.733 73.2C224 74 222.667 75.3333 222.667 76.1333C222.667 76.9333 224.267 76.2667 226.267 74.6666C229.6 72.1333 231.333 71.8666 248.533 72.1333L267.2 72.2667L273.867 78.6666L280.667 85.2L280.4 103.467C280 129.6 276.533 137.867 263.733 143.2C261.067 144.4 258.533 145.867 258.133 146.533C256.267 149.467 246.933 149.6 240.933 146.8C237.6 145.2 234.267 144 233.6 144C232.933 144 229.867 142.133 226.933 140C223.867 137.733 221.333 136.533 221.333 137.2C221.333 138 222.133 139.067 223.2 139.6C224.667 140.4 224.933 142.133 224.4 146.4C222.8 158.4 220.933 148.933 220.267 125.333C219.733 102 219.733 101.067 222.133 101.867C226.133 102.933 238 103.2 239.733 102.133C241.6 101.067 239.467 96 237.2 96C236.4 96 236.4 96.9333 237.333 98.6666C238.533 100.8 238.4 101.333 236.667 101.333C235.6 101.333 234.667 100.267 234.667 98.8C234.667 95.8666 225.867 93.6 223.6 95.8666C221.333 98.1333 220.667 97.6 220.667 93.6C220.667 90.1333 221.2 89.7333 226 89.3333C233.867 88.8 235.067 88.8 238 90C240.4 91.0667 240.533 90.9333 238.667 88.8C237.2 86.8 235.333 86.5333 229.333 86.9333L221.867 87.4667L222.133 79.8666C222.133 75.7333 222.667 71.7333 223.2 70.9333C223.6 70.1333 223.467 69.2 222.8 68.8C222.133 68.2667 221.2 68.4 220.933 68.9333C218.667 72.6666 217.2 133.6 219.2 142.267C220 145.6 219.867 145.733 218.4 143.333C217.333 141.733 216.533 134.267 216.267 124.933C216 116.4 215.2 109.333 214.533 109.333C213.867 109.333 213.733 111.333 214 113.6C214.667 117.6 214.667 117.733 213.2 114.933C212 112.933 212 111.067 212.933 108.933C214.4 105.867 212.667 100 210.4 100C209.733 100 209.867 101.2 210.667 102.533C211.333 104 212 106 212 106.933C211.867 109.067 208.133 102.667 208 100.267C208 98.2667 212.267 98.1333 214.267 100.133C215.333 101.2 215.6 100 215.467 96.1333C215.333 90 215.333 90 212.8 92.2667C211.333 93.7333 211.333 94.2667 213.2 95.6C215.067 97.0667 214.8 97.2 211.6 97.3333H208L208.4 87.6C208.933 76 212.533 67.4667 219.867 60.4C232.267 48.2667 250.533 45.3333 266 52.9333ZM228 99.3333C228 101.467 225.733 101.867 221.733 100.4C219.6 99.6 219.733 99.3333 222.667 98.5333C227.733 97.0667 228 97.2 228 99.3333ZM288 101.867C288 106 286.133 107.2 284 104.667C282 102.267 283.2 98.6666 286 98.6666C287.2 98.6666 288 99.8666 288 101.867ZM284.533 111.733C284 113.733 283.067 115.867 282.267 116.667C281.467 117.6 281.333 116.667 281.867 114C282.4 111.733 282.8 109.333 282.933 108.4C283.067 107.467 283.6 107.067 284.267 107.467C284.8 107.867 284.933 109.733 284.533 111.733ZM230 150.933C229.6 157.333 225.333 164.4 223.333 162.4C222.933 162 223.467 157.467 224.667 152.267C226.267 145.2 227.333 143.067 228.667 143.6C230.133 144 230.4 146 230 150.933ZM272.8 147.333C273.867 150 275.067 154.8 275.6 158.133L276.4 164.267L272.933 162C270.533 160.533 269.333 158.533 269.333 156.133C269.333 154.267 268.8 150.8 268.133 148.4C266 141.2 269.867 140.267 272.8 147.333ZM241.6 148.8C246.267 151.2 254.533 151.2 257.2 148.8C258.4 147.867 260.667 146.533 262.4 146.133C265.467 145.067 265.867 146 265.333 153.733C265.2 156.267 266.267 158.533 269.2 161.2C277.2 168.667 308.133 181.867 327.2 186C333.2 187.333 337.733 193.2 340.533 203.467C342.533 210.8 343.2 220.267 344.133 250.667C344.933 282.133 345.6 290.4 347.867 299.067C353.6 320.8 354.267 345.2 350.533 390.667C346.133 445.467 345.867 447.067 341.333 455.2C337.733 461.467 332.133 466.667 328.667 466.667C326.933 466.667 328.267 463.6 331.333 460.667C336.8 455.733 340.4 443.733 339.333 434.4C338.8 430.133 338 426.667 337.333 426.667C336.267 426.667 330.667 443.6 330.667 447.067C330.667 450.267 328.267 454.667 326.533 454.667C325.867 454.667 325.6 453.333 326 451.6C326.267 450 326.8 441.6 327.2 432.933C327.733 418.267 328 416.533 332.133 408.4L336.533 399.733L330.8 382.533C320.933 352.667 319.867 346.4 319.467 318C319.2 296 318.533 289.467 314.667 268.667C312.267 255.467 310 242.667 309.733 240.267C308.4 231.867 307.067 234.933 307.733 244.667C308.4 255.867 306.667 270.267 301.867 290.933C297.333 310.8 297.6 315.733 304 332C308.4 343.067 314.667 364.267 314.667 368.267C314.667 368.933 284.933 369.333 248.667 369.333C212.4 369.333 182.667 369.067 182.667 368.667C182.667 364.8 189.067 340.267 192.267 331.733C197.733 317.467 198.267 308.933 194.8 291.867C190.4 269.467 188.933 256.533 189.6 245C190.267 233.467 190.667 221.733 190.133 210.267C189.6 198.8 188.667 187.333 187.333 176C186 164.667 183.333 152.933 180.267 141.733C177.2 130.667 173.6 119.467 169.733 108.8C165.867 98.4 161.733 88.1333 157.467 78.2667C153.2 68.6667 148.667 59.4667 144 50.6667C139.333 42.1333 134.533 34.1333 129.6 26.8C124.667 19.6 119.6 13.0667 114.533 7.46667C109.467 2 104.267 -2.66667 99.0667 -6.93333C93.8667 -11.0667 88.5333 -14.6667 83.2 -17.4667C77.8667 -20.1333 72.4 -22.1333 66.9333 -23.3333C61.4667 -24.4 56 -24.9333 50.5333 -24.8C45.0667 -24.5333 39.6 -23.6 34.2667 -21.8667C28.9333 -20 23.7333 -17.2 18.8 -13.3333C13.8667 -9.33333 9.33333 -4.53333 5.33333 1.06667C1.33333 6.66667 -2.13333 13.2 -5.33333 20.5333C-8.53333 27.8667 -11.0667 35.8667 -12.9333 44.4C-14.8 52.9333 -16 61.8667 -16.5333 71.0667C-17.0667 80.2667 -16.9333 89.6 -16.1333 98.9333C-15.3333 108.267 -13.8667 117.467 -11.7333 126.4C-9.6 135.333 -6.8 143.867 -3.46667 151.867C-0.133333 159.867 3.73333 167.333 8.13333 174.133C12.5333 180.933 17.4667 186.933 22.8 192.133C28.1333 197.333 33.7333 201.6 39.4667 204.8C45.2 208 51.0667 210.133 56.9333 211.067C62.8 212 68.6667 211.733 74.4 210.267C80.1333 208.8 85.7333 206.133 91.0667 202.267C96.4 198.4 101.467 193.467 106.1333 187.467C110.8 181.467 115.067 174.533 118.8 166.8C122.533 159.067 125.733 150.667 128.4 141.733C131.067 132.8 133.2 123.467 134.8 113.867C136.4 104.267 137.467 94.5333 138 84.6667C138.533 74.8 138.533 64.9333 138 55.2C137.467 45.4667 136.4 35.8667 134.8 26.5333C133.2 17.3333 131.067 8.4 128.4 0.133333C125.733 -8.13333 122.533 -16.1333 118.8 -23.7333C115.067 -31.3333 110.8 -38.4 106 -44.8C101.2 -51.2 95.8667 -56.9333 90.1333 -61.7333C84.4 -66.4 78.2667 -70.1333 71.8667 -72.8C65.4667 -75.3333 58.8 -76.8 52 -76.9333C45.2 -77.0667 38.4 -76 31.7333 -73.6C25.0667 -71.0667 18.6667 -67.3333 12.4 -62.5333C6.13333 -57.6 0.133333 -51.6 -5.46667 -44.6667C-11.0667 -37.6 -16.4 -29.7333 -21.3333 -21.0667C-26.2667 -12.2667 -30.6667 -2.93333 -34.5333 6.8C-38.4 16.5333 -41.7333 26.6667 -44.5333 37.0667C-47.3333 47.4667 -49.6 58.1333 -51.3333 68.9333C-53.0667 79.7333 -54.2667 90.6667 -54.9333 101.6C-55.6 112.533 -55.7333 123.467 -55.3333 134.4C-54.9333 145.333 -54 156.267 -52.5333 167.067C-51.0667 177.867 -49.0667 188.533 -46.5333 198.933C-44 209.333 -40.9333 219.467 -37.3333 229.2C-33.7333 238.933 -29.6 248.267 -25 257.067C-20.4 265.867 -15.3333 274.133 -9.86667 281.733C-4.4 289.333 1.46667 296.267 7.73333 302.4C14 308.533 20.5333 313.867 27.2 318.4C33.8667 322.933 40.6667 326.667 47.4667 329.467C54.2667 332.267 61.0667 334.133 67.7333 335.067C74.4 336 81.0667 336 87.6 335.067C94.1333 334.133 100.533 332.267 106.667 329.467C112.8 326.667 118.667 322.933 124.1333 318.4C129.6 313.867 134.667 308.533 139.3333 302.4C144 296.267 148.267 289.333 152 281.733C155.733 274.133 159.067 265.867 161.867 257.067C164.667 248.267 167.067 238.933 169.067 229.2C171.067 219.467 172.667 209.333 173.867 198.933C175.067 188.533 175.867 177.867 176.267 167.067C176.667 156.267 176.667 145.333 176.267 134.4C176.267 123.467 175.867 112.533 175.067 101.6C174.267 90.6667 173.067 79.7333 171.467 68.9333C169.867 58.1333 167.867 47.4667 165.467 37.0667C163.067 26.6667 160.267 16.5333 157.067 6.8C153.867 -2.93333 150.267 -12.2667 146.267 -21.0667C142.267 -29.7333 137.867 -37.6 133.067 -44.6667C128.267 -51.6 123.067 -57.6 117.467 -62.5333C111.867 -67.3333 105.867 -70.8 99.4667 -72.8C93.0667 -74.6667 86.4 -75.7333 79.6 -75.6C72.8 -75.3333 66 -74.1333 59.2 -71.8667C52.4 -69.4667 45.7333 -66 39.2 -61.3333C32.6667 -56.5333 26.4 -50.6667 20.4 -43.7333C14.4 -36.6667 8.66667 -28.6667 3.33333 -19.6C-2 -10.4 -6.93333 -0.266667 -11.0667 10.4C-15.2 21.0667 -18.5333 32.1333 -21.0667 43.4667C-23.6 54.8 -25.3333 66.2667 -26.2667 77.7333C-27.2 89.2 -27.3333 100.667 -26.6667 112C-26 123.333 -24.5333 134.4 -22.2667 145.2C-20 156 -16.9333 166.4 -13.0667 177.2C-9.2 188 -4.66667 198.267 0.533333 207.867C5.73333 217.467 11.4667 226.267 17.6 234.133C23.7333 242 30.1333 248.933 36.6667 254.8C43.2 260.667 49.8667 265.467 56.5333 269.2C63.2 272.933 69.8667 275.467 76.4 276.8C82.9333 278.133 89.3333 278.267 95.6 277.2C101.867 276.133 107.867 273.867 113.6 270.4C119.333 266.933 124.667 262.267 129.467 256.533C134.267 250.8 138.533 243.867 142.1333 236C145.7333 228.133 148.667 219.333 151.067 209.733C153.467 200.133 155.333 189.733 156.667 178.8C158 167.867 158.8 156.667 159.067 145.2C159.333 133.733 159.067 122.133 158.267 110.533C157.467 98.9333 156.133 87.4667 154.267 76.2667C152.4 65.0667 150 54.1333 147.067 43.4667C144.133 32.8 140.667 22.4 136.667 12.4C132.667 2.4 128.133 -7.33333 123.067 -16.6667C118 -26 112.4 -34.8 106.267 -42.8C100.133 -50.8 93.4667 -57.8667 86.4 -63.8667C79.3333 -69.8667 71.8667 -74.6667 64 -78.2667C56.1333 -81.7333 47.8667 -83.8667 39.3333 -84.5333C30.8 -85.0667 22.1333 -84.1333 13.4667 -81.6C4.8 -79.0667 -3.86667 -74.9333 -12.2667 -69.2C-20.6667 -63.3333 -28.8 -55.8667 -36.5333 -46.8C-44.2667 -37.6 -51.6 -27.0667 -58.4 -15.2C-65.2 -3.2 -71.4667 10.1333 -77.0667 25.3333C-82.6667 40.5333 -87.6 57.4667 -91.8667 76C-96.1333 94.5333 -99.7333 114.533 -102.667 135.867C-105.6 157.2 -107.867 179.733 -109.467 203.2C-111.067 226.667 -112 250.933 -112.267 275.733C-112.533 300.533 -112.133 325.733 -111.067 351.067C-110 376.4 -108.267 401.733 -105.867 426.8C-103.467 451.867 -100.4 476.533 -96.6667 500.533C-92.9333 524.533 -88.5333 547.733 -83.4667 569.867C-78.4 592 -72.6667 612.933 -66.2667 632.533C-59.8667 652.133 -52.8 670.267 -45.0667 686.667C-37.3333 703.067 -28.9333 717.6 -19.8667 730C-10.8 742.4 -1.06667 752.533 9.33333 760.133C19.7333 767.733 30.9333 772.667 42.9333 774.8C54.9333 776.933 67.7333 776.133 81.3333 771.333C94.9333 766.533 109.333 757.733 124.533 744.8C139.733 731.867 155.733 714.667 172.533 693.067C189.333 671.467 206.933 645.467 225.2 614.933C243.467 584.4 262.4 549.2 282 509.2C301.6 469.2 321.733 424.133 342.4 373.867C363.067 323.6 384.267 268 406 207.067C427.733 146.133 450 79.8667 472.667 8.26667L456.667 0H0V800H456.667C434 791.2 411.733 783.2 389.867 775.867C368 768.533 346.533 761.867 325.467 755.733C304.4 749.6 283.733 744 263.467 738.8C243.2 733.6 223.333 728.8 203.867 724.4C184.4 720 165.333 715.867 146.667 712C128 708.133 109.733 704.533 91.8667 701.2C74 697.867 56.5333 694.8 39.4667 692C22.4 689.2 5.73333 686.667 -10.5333 684.4C-26.8 682.133 -42.6667 680.133 -58.1333 678.4C-73.6 676.667 -88.6667 675.2 -103.333 674C-118 672.8 -132.267 671.867 -146.133 671.2C-160 670.533 -173.467 670.133 -186.533 670C-199.6 669.867 -212.267 670 -224.533 670.4C-236.8 670.8 -248.667 671.467 -260.133 672.4C-271.6 673.333 -282.667 674.533 -293.333 676C-304 677.467 -314.267 679.2 -324.133 681.2C-334 683.2 -343.467 685.467 -352.533 688C-361.6 690.533 -370.267 693.333 -378.533 696.4C-386.8 699.467 -394.667 702.8 -402.133 706.4C-409.6 710 -416.667 713.867 -423.333 718C-430 722.133 -436.267 726.533 -442.133 731.2C-448 735.867 -453.467 740.8 -458.533 746C-463.6 751.2 -468.267 756.667 -472.533 762.4C-476.8 768.133 -480.667 774.133 -484.133 780.4C-487.6 786.667 -490.667 793.2 -493.333 800H0V0H-493.333L-490.667 800" fill="none"/>
</g>
<path id="zone-thigh-r" d="M194 566H235V527L241 490L250 425L184 385H179V418V453V490L184 527L194 566Z" fill="${getSafeColor('zone-thigh-r')}"/>
<path id="zone-shin-r" d="M194 659V595H241V626V656L237 681L231 714V739H202V714L194 659Z" fill="${getSafeColor('zone-shin-r')}"/>
<path id="zone-shin-l" d="M253 632L258 598H304V632V659L295 696V736H264V722V691L258 665L253 632Z" fill="${getSafeColor('zone-shin-l')}"/>
<path id="zone-thigh-l" d="M314 382L251 425L255 489L262 536V567H304L309 536L321 486V441V416L314 382Z" fill="${getSafeColor('zone-thigh-l')}"/>
<path id="zone-ab-upper" d="M194 316V294H296L302 316L316 367H183L194 316Z" fill="${getSafeColor('zone-ab-upper')}"/>
<path id="zone-arm-r-upper" d="M151 291L156 215L189 239L178 302L151 291Z" fill="${getSafeColor('zone-arm-r-upper')}"/>
<path id="zone-arm-l-upper" d="M320 311L310 239H343L349 299L320 311Z" fill="${getSafeColor('zone-arm-l-upper')}"/>
<path id="zone-chest" d="M186 214L194 286H305L315 214H186Z" fill="${getSafeColor('zone-chest')}"/>
<path id="zone-pelvis" d="M183 384V369H315V384L251 425L183 384Z" fill="${getSafeColor('zone-pelvis')}"/>
</g>
<defs>
<clipPath id="clip0_0_1">
<rect width="434.667" height="800" fill="white"/>
</clipPath>
</defs>
</svg>`;
    
    // HTML com SVG injetado e legenda
    let html = `
        <div class="body-visualization-container" style="position: relative; width: 100%; max-width: 500px; margin: 0 auto;">
            <!-- SVG injetado -->
            <div class="svg-container" style="position: relative; z-index: 1;">
                ${svgContent}
            </div>
            
            <!-- Legenda -->
            <div class="legend" style="position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #6c757d; z-index: 10;">
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">MUDANÇA</div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #28a745; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Redução</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #dc3545; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Aumento</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #6c757d; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Sem dado</span>
                </div>
            </div>
        </div>
        
        <style>
            .body-visualization-container {
                position: relative;
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
            }
            .svg-container {
                position: relative;
                z-index: 1;
            }
            .svg-container svg {
                width: 100%;
                height: auto;
            }
            .legend {
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #6c757d;
                z-index: 10;
                font-size: 12px;
            }
            .legend > div {
                display: flex;
                align-items: center;
                margin: 3px 0;
            }
        </style>
    `;
    
    container.innerHTML = html;
}

// Função para destacar zona ao passar o mouse
function highlightZone(zoneId) {
    const zone = document.getElementById(zoneId);
    if (zone) {
        zone.style.fillOpacity = '0.9';
        zone.style.stroke = '#333';
        zone.style.strokeWidth = '2';
    }
}

// Função para remover destaque ao sair do mouse
function unhighlightZone(zoneId) {
    const zone = document.getElementById(zoneId);
    if (zone) {
        zone.style.fillOpacity = '0.7';
        zone.style.stroke = 'none';
    }
}

// Função para selecionar zona ao clicar
function selectZone(zoneId) {
    console.log("Zona selecionada:", zoneId);
    const zone = document.getElementById(zoneId);
    if (zone) {
        // Flash effect
        const originalFill = zone.style.fill;
        zone.style.fill = '#ffc107';
        setTimeout(() => {
            zone.style.fill = originalFill;
        }, 200);
    }
}

// Função para definir cor de uma zona específica
function setZoneColor(zoneId, colorHex) {
    const zone = document.getElementById(zoneId);
    if (zone) {
        zone.style.fill = colorHex;
    }
}

// Função para resetar todas as zonas
function resetZones() {
    const zones = document.querySelectorAll('.zone-overlay');
    zones.forEach(zone => {
        zone.style.fill = '#6c757d';
        zone.style.fillOpacity = '0.7';
    });
}

// Função para analisar uma zona específica - SEMPRE compara cadastro vs último atendimento
function analyzeZone(zoneKey) {
    console.log('Analisando zona:', zoneKey);
    console.log('Atendimentos disponíveis:', currentAtendimentos);
    console.log('Cliente atual:', currentClient);
    
    // Ordenar atendimentos por data (mais recente primeiro) - usando fuso horário de Brasília (UTC-3)
    const atendimentosOrdenados = [...currentAtendimentos].sort((a, b) => {
        const dataA = new Date(a.data || a.data_atendimento || 0);
        const dataB = new Date(b.data || b.data_atendimento || 0);
        // Ajustar para fuso horário de Brasília (UTC-3)
        const offsetBrasil = 3 * 60 * 60 * 1000; // 3 horas em milissegundos
        const dataABrasil = new Date(dataA.getTime() + offsetBrasil);
        const dataBBrasil = new Date(dataB.getTime() + offsetBrasil);
        return dataBBrasil - dataABrasil; // Ordem decrescente (mais recente primeiro)
    });
    
    console.log('Atendimentos ordenados por data:', atendimentosOrdenados.map(a => ({
        data: a.data || a.data_atendimento
    })));
    
    // Mapear zona para o campo correto (suportar camelCase e underscore)
    const zoneMapping = {
        'braco_direito': ['bracoDireito', 'braco_direito'],
        'braco_esquerdo': ['bracoEsquerdo', 'braco_esquerdo'],
        'torax': ['torax'],
        'cintura': ['cintura'],
        'abdomen': ['abdomen'],
        'quadril': ['quadril'],
        'coxa_direita': ['coxaDireito', 'coxa_direita'],
        'coxa_esquerda': ['coxaEsquerdo', 'coxa_esquerda'],
        'panturrilha_direita': ['panturrilhaDireita', 'panturrilha_direita'],
        'panturrilha_esquerda': ['panturrilhaEsquerda', 'panturrilha_esquerda']
    };
    
    // SEMPRE usar cadastro como baseline (fixo)
    let previous = 0;
    if (currentClient) {
        const possibleFields = zoneMapping[zoneKey];
        for (const field of possibleFields) {
            if (currentClient[field] !== undefined && currentClient[field] !== null) {
                previous = parseFloat(currentClient[field]) || 0;
                break;
            }
        }
    }
    
    // SEMPRE usar atendimento mais recente como atual
    let current = 0;
    if (atendimentosOrdenados.length > 0) {
        const lastAtendimento = atendimentosOrdenados[0];
        const possibleFields = zoneMapping[zoneKey];
        
        for (const field of possibleFields) {
            if (lastAtendimento[field] !== undefined && lastAtendimento[field] !== null) {
                current = parseFloat(lastAtendimento[field]) || 0;
                break;
            }
        }
    }
    
    console.log(`Zona ${zoneKey}: baseline (cadastro)=${previous}, atual (mais recente)=${current}`);
    
    if (current === 0 || previous === 0) {
        return { color: '#6c757d', change: 0, percentage: 0, current: current > 0 ? current.toFixed(1) : '--', previous: previous > 0 ? previous.toFixed(1) : '--' };
    }
    
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    
    let color = '#6c757d';
    if (change < 0) {
        color = '#28a745';
    } else if (change > 0) {
        color = '#dc3545';
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
    
    // Ordenar atendimentos por data (mais recente primeiro) - usando fuso horário de Brasília (UTC-3)
    const atendimentosOrdenados = [...currentAtendimentos].sort((a, b) => {
        const dataA = new Date(a.data || a.data_atendimento || 0);
        const dataB = new Date(b.data || b.data_atendimento || 0);
        const offsetBrasil = 3 * 60 * 60 * 1000; // 3 horas em milissegundos
        const dataABrasil = new Date(dataA.getTime() + offsetBrasil);
        const dataBBrasil = new Date(dataB.getTime() + offsetBrasil);
        return dataBBrasil - dataABrasil;
    });
    
    console.log('Atendimentos ordenados para métricas:', atendimentosOrdenados.map(a => ({
        data: a.data || a.data_atendimento
    })));
    
    const firstAtendimento = atendimentosOrdenados[atendimentosOrdenados.length - 1];
    const lastAtendimento = atendimentosOrdenados[0];
    
    // Peso - SEMPRE usar cadastro como baseline (fixo)
    const pesoAtual = parseFloat(lastAtendimento.peso) || 0;
    const pesoInicial = parseFloat(currentClient.peso) || 0; // Peso do cadastro
    const pesoChange = pesoAtual - pesoInicial;
    const pesoPercentage = pesoInicial > 0 ? ((pesoChange / pesoInicial) * 100).toFixed(1) : 0;
    
    console.log(`Peso: inicial (cadastro)=${pesoInicial}, atual (último atendimento)=${pesoAtual}, mudança=${pesoChange}`);
    
    const pesoMetric = document.getElementById('pesoMetric');
    if (pesoMetric) {
        pesoMetric.querySelector('.metric-value').textContent = pesoAtual > 0 ? `${pesoAtual} kg` : '--';
        const pesoChangeClass = pesoChange < 0 ? 'green' : pesoChange > 0 ? 'red' : '';
        pesoMetric.querySelector('.metric-change').className = `metric-change ${pesoChangeClass}`;
        
        // Mostrar peso inicial e a diferença
        if (pesoInicial > 0 && pesoAtual > 0) {
            pesoMetric.querySelector('.metric-change').textContent = `Inicial: ${pesoInicial} kg | ${pesoChange > 0 ? '+' : ''}${pesoChange} kg (${pesoPercentage}%)`;
        } else if (pesoAtual > 0) {
            pesoMetric.querySelector('.metric-change').textContent = 'Sem registro inicial';
        } else {
            pesoMetric.querySelector('.metric-change').textContent = '--';
        }
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
window.highlightZone = highlightZone;
window.unhighlightZone = unhighlightZone;
window.selectZone = selectZone;
window.setZoneColor = setZoneColor;
window.resetZones = resetZones;