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

// Função para gerar visualização do corpo com overlays coloridos
function generateBodyVisualization() {
    const container = document.getElementById('bodyVisualization');
    if (!container) return;
    
    console.log("Iniciando renderização do corpo SVG");
    
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
    
    // Mapeamento correto: dados do banco -> IDs do SVG
    const zoneMapping = {
        'braco_direito': ['zone-arm-r-upper', 'zone-forearm-r', 'zone-hand-r'],
        'braco_esquerdo': ['zone-arm-l-upper', 'zone-forearm-l', 'zone-hand-l'],
        'torax': ['zone-chest'],
        'cintura': ['zone-pelvis'],
        'abdomen': ['zone-ab-upper', 'zone-ab-lower'],
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
    
    // Adicionar fallback para zonas não mapeadas
    const allSvgZones = [
        'zone-head', 'zone-neck', 'zone-chest', 'zone-ab-upper', 'zone-ab-lower',
        'zone-pelvis', 'zone-arm-r-upper', 'zone-forearm-r', 'zone-hand-r',
        'zone-arm-l-upper', 'zone-forearm-l', 'zone-hand-l',
        'zone-thigh-r', 'zone-shin-r', 'zone-foot-r',
        'zone-thigh-l', 'zone-shin-l', 'zone-foot-l'
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
    
    // HTML com camadas: overlays atrás, corpo SVG na frente
    let html = `
        <div class="body-visualization-container" style="position: relative; width: 100%; max-width: 400px; margin: 0 auto;">
            <!-- Camada de overlays coloridos (atrás) -->
            <svg class="body-overlays" viewBox="0 0 435 800" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
                <!-- Cabeça -->
                <path id="zone-head" class="zone-overlay" 
                    d="M217 67 Q187 60 160 73 Q133 93 127 120 Q120 147 133 173 Q147 197 173 207 Q200 213 217 207 Q240 200 260 193 Q280 187 293 167 Q307 147 300 120 Q293 93 267 73 Q240 60 217 67"
                    fill="${getSafeColor('zone-head')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-head')" onmouseout="unhighlightZone('zone-head')"
                    onclick="selectZone('zone-head')"/>
                
                <!-- Pescoço -->
                <path id="zone-neck" class="zone-overlay"
                    d="M193 207 Q217 200 240 207 L237 240 Q217 233 197 240 Z"
                    fill="${getSafeColor('zone-neck')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-neck')" onmouseout="unhighlightZone('zone-neck')"
                    onclick="selectZone('zone-neck')"/>
                
                <!-- Peito/Bustiê -->
                <path id="zone-chest" class="zone-overlay"
                    d="M160 240 Q133 267 140 307 Q147 347 173 373 Q193 387 217 380 Q240 373 260 367 Q280 360 293 333 Q307 307 300 267 Q293 240 267 233 Q240 227 217 233 Q193 240 160 240"
                    fill="${getSafeColor('zone-chest')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-chest')" onmouseout="unhighlightZone('zone-chest')"
                    onclick="selectZone('zone-chest')"/>
                
                <!-- Abdômen Superior -->
                <path id="zone-ab-upper" class="zone-overlay"
                    d="M173 373 Q193 387 217 380 Q240 373 260 367 Q273 367 273 387 Q267 413 260 433 Q240 447 217 440 Q193 447 173 433 Q160 413 167 387 Q167 373 173 373"
                    fill="${getSafeColor('zone-ab-upper')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-ab-upper')" onmouseout="unhighlightZone('zone-ab-upper')"
                    onclick="selectZone('zone-ab-upper')"/>
                
                <!-- Abdômen Inferior -->
                <path id="zone-ab-lower" class="zone-overlay"
                    d="M173 433 Q193 447 217 440 Q240 447 260 433 Q267 453 260 480 Q240 500 217 493 Q193 500 173 480 Q160 460 167 433 Q173 433 173 433"
                    fill="${getSafeColor('zone-ab-lower')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-ab-lower')" onmouseout="unhighlightZone('zone-ab-lower')"
                    onclick="selectZone('zone-ab-lower')"/>
                
                <!-- Pélvis/Quadril -->
                <path id="zone-pelvis" class="zone-overlay"
                    d="M153 480 Q173 500 173 527 Q180 560 200 580 Q220 593 240 587 Q260 580 273 560 Q287 533 280 500 Q273 480 260 480 Q240 487 217 493 Q193 500 153 480"
                    fill="${getSafeColor('zone-pelvis')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-pelvis')" onmouseout="unhighlightZone('zone-pelvis')"
                    onclick="selectZone('zone-pelvis')"/>
                
                <!-- Braço Direito Superior -->
                <path id="zone-arm-r-upper" class="zone-overlay"
                    d="M133 267 Q107 280 93 307 Q80 333 73 360 Q67 387 73 413 Q80 440 100 453 Q120 467 140 460 Q160 453 167 427 Q173 400 167 373 Q160 347 153 320 Q147 293 133 267"
                    fill="${getSafeColor('zone-arm-r-upper')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-arm-r-upper')" onmouseout="unhighlightZone('zone-arm-r-upper')"
                    onclick="selectZone('zone-arm-r-upper')"/>
                
                <!-- Antebraço Direito -->
                <path id="zone-forearm-r" class="zone-overlay"
                    d="M73 413 Q80 440 100 453 Q120 467 140 460 Q147 480 144 507 Q140 533 127 553 Q113 573 93 580 Q73 587 60 573 Q53 553 56 527 Q60 500 73 413"
                    fill="${getSafeColor('zone-forearm-r')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-forearm-r')" onmouseout="unhighlightZone('zone-forearm-r')"
                    onclick="selectZone('zone-forearm-r')"/>
                
                <!-- Mão Direita -->
                <ellipse id="zone-hand-r" class="zone-overlay" cx="67" cy="600" rx="20" ry="27"
                    fill="${getSafeColor('zone-hand-r')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-hand-r')" onmouseout="unhighlightZone('zone-hand-r')"
                    onclick="selectZone('zone-hand-r')"/>
                
                <!-- Braço Esquerdo Superior -->
                <path id="zone-arm-l-upper" class="zone-overlay"
                    d="M300 267 Q327 280 340 307 Q353 333 360 360 Q367 387 360 413 Q353 440 333 453 Q313 467 293 460 Q273 453 267 427 Q260 400 267 373 Q273 347 280 320 Q287 293 300 267"
                    fill="${getSafeColor('zone-arm-l-upper')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-arm-l-upper')" onmouseout="unhighlightZone('zone-arm-l-upper')"
                    onclick="selectZone('zone-arm-l-upper')"/>
                
                <!-- Antebraço Esquerdo -->
                <path id="zone-forearm-l" class="zone-overlay"
                    d="M360 413 Q353 440 333 453 Q313 467 293 460 Q287 480 290 507 Q293 533 307 553 Q320 573 340 580 Q360 587 373 573 Q380 553 377 527 Q373 500 360 413"
                    fill="${getSafeColor('zone-forearm-l')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-forearm-l')" onmouseout="unhighlightZone('zone-forearm-l')"
                    onclick="selectZone('zone-forearm-l')"/>
                
                <!-- Mão Esquerda -->
                <ellipse id="zone-hand-l" class="zone-overlay" cx="367" cy="600" rx="20" ry="27"
                    fill="${getSafeColor('zone-hand-l')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-hand-l')" onmouseout="unhighlightZone('zone-hand-l')"
                    onclick="selectZone('zone-hand-l')"/>
                
                <!-- Coxa Direita -->
                <path id="zone-thigh-r" class="zone-overlay"
                    d="M173 573 Q193 593 200 627 Q207 660 200 693 Q193 727 173 740 Q153 753 133 740 Q113 727 113 693 Q113 660 127 627 Q140 593 173 573"
                    fill="${getSafeColor('zone-thigh-r')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-thigh-r')" onmouseout="unhighlightZone('zone-thigh-r')"
                    onclick="selectZone('zone-thigh-r')"/>
                
                <!-- Canela Direita -->
                <path id="zone-shin-r" class="zone-overlay"
                    d="M113 693 Q113 727 120 760 Q127 793 147 813 Q167 827 187 813 Q207 800 213 767 Q220 733 213 700 Q207 667 193 653 Q173 640 153 653 Q133 667 113 693"
                    fill="${getSafeColor('zone-shin-r')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-shin-r')" onmouseout="unhighlightZone('zone-shin-r')"
                    onclick="selectZone('zone-shin-r')"/>
                
                <!-- Pé Direito -->
                <ellipse id="zone-foot-r" class="zone-overlay" cx="167" cy="847" rx="27" ry="16"
                    fill="${getSafeColor('zone-foot-r')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-foot-r')" onmouseout="unhighlightZone('zone-foot-r')"
                    onclick="selectZone('zone-foot-r')"/>
                
                <!-- Coxa Esquerda -->
                <path id="zone-thigh-l" class="zone-overlay"
                    d="M260 573 Q280 593 287 627 Q293 660 287 693 Q280 727 260 740 Q240 753 220 740 Q200 727 200 693 Q200 660 213 627 Q227 593 260 573"
                    fill="${getSafeColor('zone-thigh-l')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-thigh-l')" onmouseout="unhighlightZone('zone-thigh-l')"
                    onclick="selectZone('zone-thigh-l')"/>
                
                <!-- Canela Esquerda -->
                <path id="zone-shin-l" class="zone-overlay"
                    d="M200 693 Q200 727 207 760 Q213 793 233 813 Q253 827 273 813 Q293 800 300 767 Q307 733 300 700 Q293 667 280 653 Q260 640 240 653 Q220 667 200 693"
                    fill="${getSafeColor('zone-shin-l')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-shin-l')" onmouseout="unhighlightZone('zone-shin-l')"
                    onclick="selectZone('zone-shin-l')"/>
                
                <!-- Pé Esquerdo -->
                <ellipse id="zone-foot-l" class="zone-overlay" cx="253" cy="847" rx="27" ry="16"
                    fill="${getSafeColor('zone-foot-l')}" fill-opacity="0.7" stroke="none"
                    onmouseover="highlightZone('zone-foot-l')" onmouseout="unhighlightZone('zone-foot-l')"
                    onclick="selectZone('zone-foot-l')"/>
            </svg>
            
            <!-- Camada do corpo SVG (na frente) -->
            <svg class="body-image" viewBox="0 0 435 800" style="position: relative; z-index: 2; width: 100%; height: auto;">
                <image href="corpo2.svg" x="0" y="0" width="435" height="800" preserveAspectRatio="xMidYMid meet"/>
            </svg>
            
            <!-- Legenda -->
            <div class="legend" style="position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #6c757d; z-index: 3;">
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 9px;">MUDANÇA</div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #28a745; margin-right: 5px;"></div>
                    <span style="font-size: 8px;">Redução</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #dc3545; margin-right: 5px;"></div>
                    <span style="font-size: 8px;">Aumento</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #6c757d; margin-right: 5px;"></div>
                    <span style="font-size: 8px;">Sem dado</span>
                </div>
            </div>
        </div>
        
        <style>
            .zone-overlay {
                transition: fill 0.3s ease, fill-opacity 0.3s ease;
                cursor: pointer;
            }
            .zone-overlay:hover {
                fill-opacity: 0.9 !important;
                stroke: #333;
                stroke-width: 2;
            }
            .body-overlays {
                mix-blend-mode: multiply;
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