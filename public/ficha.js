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
    
    if (!currentClientId) {
        alert('Cliente não encontrado. Redirecionando para o dashboard.');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // SEMPRE usar API, nunca localStorage
        const clienteData = await clientesAPI.buscar(currentClientId);
        const atendimentosData = await clientesAPI.buscarAtendimentos(currentClientId);
        const planosData = await clientesAPI.buscarPlanos(currentClientId);
        
        currentClient = clienteData;
        currentClientAtendimentos = atendimentosData;
        currentClientPlanos = planosData;
        currentAtendimentos = atendimentosData;
        
        // Normalizar nomes de colunas do banco (snake_case) para camelCase para uso no frontend
        if (currentClient) {
            currentClient.dataNascimento = currentClient.data_nascimento;
            currentClient.doencasCronicas = currentClient.doencas_cronicas;
            currentClient.atividadeFisica = currentClient.atividade_fisica;
            currentClient.bracoDireito = currentClient.braco_direito;
            currentClient.bracoEsquerdo = currentClient.braco_esquerdo;
            currentClient.coxaDireita = currentClient.coxa_direita;
            currentClient.coxaEsquerda = currentClient.coxa_esquerda;
            currentClient.panturrilhaDireita = currentClient.panturrilha_direita;
            currentClient.panturrilhaEsquerda = currentClient.panturrilha_esquerda;
        }
        
        if (!currentClient) {
            console.error('Cliente não encontrado com ID:', currentClientId);
            alert('Cliente não encontrado. Redirecionando para o dashboard.');
            window.location.href = 'index.html';
            return;
        }
        
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
            'Braço Direito': currentClient.braco_direito ? `${currentClient.braco_direito} cm` : '--',
            'Braço Esquerdo': currentClient.braco_esquerdo ? `${currentClient.braco_esquerdo} cm` : '--',
            'Tórax': currentClient.torax ? `${currentClient.torax} cm` : '--',
            'Cintura': currentClient.cintura ? `${currentClient.cintura} cm` : '--',
            'Abdômen': currentClient.abdomen ? `${currentClient.abdomen} cm` : '--',
            'Quadril': currentClient.quadril ? `${currentClient.quadril} cm` : '--',
            'Coxa Direita': currentClient.coxa_direita ? `${currentClient.coxa_direita} cm` : '--',
            'Coxa Esquerda': currentClient.coxa_esquerda ? `${currentClient.coxa_esquerda} cm` : '--',
            'Panturrilha Direita': currentClient.panturrilha_direita ? `${currentClient.panturrilha_direita} cm` : '--',
            'Panturrilha Esquerda': currentClient.panturrilha_esquerda ? `${currentClient.panturrilha_esquerda} cm` : '--'
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
async function handleAtendimentoSubmit(e) {
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
    
    // Salvar via API
    try {
        const savedAtendimento = await clientesAPI.criarAtendimento(atendimento);
        
        // Atualizar lista local com o ID retornado
        atendimento.id = savedAtendimento.id;
        currentClientAtendimentos.push(atendimento);
    } catch (error) {
        console.error('❌ Erro ao salvar atendimento via API:', error);
        alert('Erro ao salvar atendimento. Tente novamente.');
        return;
    }
    
    // Atualizar lista local
    
    // Atualizar UI
    loadAtendimentos();
    updateClientInfo();
    
    // Fechar modal e limpar formulário
    closeModal('modalAtendimento');
    e.target.reset();
    
    alert('Atendimento registrado com sucesso!');
}

// Lidar com envio de plano
async function handlePlanoSubmit(e) {
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
    
    // Salvar via API
    try {
        const savedPlano = await clientesAPI.criarPlano(plano);
        
        // Atualizar lista local com o ID retornado
        plano.id = savedPlano.id;
        currentClientPlanos.push(plano);
    } catch (error) {
        console.error('❌ Erro ao salvar plano via API:', error);
        alert('Erro ao salvar plano. Tente novamente.');
        return;
    }
    
    // Atualizar lista local
    
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
    
    // Função auxiliar para obter cor com fallback defensivo
    const getZoneColor = (zoneData) => {
        const color = zoneData?.color || '#e0e0e0';
        return color;
    };
    
    // Mapear todas as zonas visuais para suas cores
    const zonesAnalysis = {};
    
    // Iterar sobre o mapeamento e atribuir cores
    Object.keys(zoneMapping).forEach(dataZone => {
        const color = getZoneColor(realZonesAnalysis[dataZone]);
        zoneMapping[dataZone].forEach(svgZoneId => {
            zonesAnalysis[svgZoneId] = color;
        });
    });
    
    // Adicionar fallback para as 9 zonas
    const allSvgZones = [
        'zone-chest', 'zone-ab-upper', 'zone-pelvis',
        'zone-arm-r-upper', 'zone-arm-l-upper',
        'zone-thigh-r', 'zone-thigh-l',
        'zone-shin-r', 'zone-shin-l'
    ];
    
    allSvgZones.forEach(zoneId => {
        if (!zonesAnalysis[zoneId]) {
            zonesAnalysis[zoneId] = '#e0e0e0';
        }
    });
    
    // Função helper segura para obter cor do objeto
    const getSafeColor = (zoneId) => {
        const color = zonesAnalysis[zoneId] || '#e0e0e0';
        return color;
    };
    
    // SVG do corpo2.svg com IDs de zonas
    let svgContent = `<svg viewBox="0 0 435 800" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; max-height: 100%;">
<!-- Camada 1: Zonas coloridas (fundo) -->
<path id="zone-thigh-r" d="M194 566H235V527L241 490L250 425L184 385H179V418V453V490L184 527L194 566Z" fill="${getSafeColor('zone-thigh-r')}"/>
<path id="zone-shin-r" d="M194 659V595H241V626V656L237 681L231 714V739H202V714L194 659Z" fill="${getSafeColor('zone-shin-r')}"/>
<path id="zone-shin-l" d="M253 632L258 598H304V632V659L295 696V736H264V722V691L258 665L253 632Z" fill="${getSafeColor('zone-shin-l')}"/>
<path id="zone-thigh-l" d="M314 382L251 425L255 489L262 536V567H304L309 536L321 486V441V416L314 382Z" fill="${getSafeColor('zone-thigh-l')}"/>
<path id="zone-ab-upper" d="M194 316V294H296L302 316L316 367H183L194 316Z" fill="${getSafeColor('zone-ab-upper')}"/>
<path id="zone-arm-r-upper" d="M151 291L156 215L189 239L178 302L151 291Z" fill="${getSafeColor('zone-arm-r-upper')}"/>
<path id="zone-arm-l-upper" d="M320 311L310 239H343L349 299L320 311Z" fill="${getSafeColor('zone-arm-l-upper')}"/>
<path id="zone-chest" d="M186 214L194 286H305L315 214H186Z" fill="${getSafeColor('zone-chest')}"/>
<path id="zone-pelvis" d="M183 384V369H315V384L251 425L183 384Z" fill="${getSafeColor('zone-pelvis')}"/>
<!-- Camada 2: Contorno anatômico do corpo (Vector_7 com stroke) -->
<path id="Vector_7" d="M237.333 47.8666C226.667 51.2 215.2 60.6666 209.867 70.8C206.4 77.3333 205.6 100.667 208.533 106.4C209.733 108.667 210.667 111.733 210.667 113.067C210.667 114.533 211.6 116.4 212.667 117.333C214.133 118.533 214.667 121.867 214.667 129.2C214.8 141.867 216.267 149.867 219.467 154.4C220.933 156.4 221.867 159.6 221.6 161.467C221.2 164.4 219.2 165.867 206.933 171.733C194.267 177.867 185.867 180.667 172.8 183.333C166.667 184.667 159.333 192.933 156.8 201.333C155.467 205.6 154 218 153.333 230.667C149.867 287.733 149.333 294.133 146.4 304C143.733 313.2 143.6 316.933 143.6 348.667C143.6 371.733 144.4 389.2 145.733 400.667C146.933 410.133 148.267 424.8 148.8 433.2C149.733 447.867 150 448.8 154.8 456.667C160.4 465.6 168.667 471.333 170.133 467.333C170.667 466.267 170.667 464.4 170.133 463.333C169.6 461.867 170.4 461.333 173.333 461.333H177.333V469.733C177.333 487.6 185.067 537.333 192.933 570.533C194.667 577.867 194.8 584.667 194.133 610.667C193.2 642.267 194.267 661.2 198.133 686.667C199.2 693.6 200.4 708.667 200.8 720L201.733 740.8L195.6 746.133C187.867 752.933 168 762.667 155.067 766.133C154.133 766.4 153.333 767.467 153.333 768.667C153.333 770.4 158.267 770.667 192.4 770.667C234.933 770.667 236.267 770.4 237.733 763.2C238.133 761.2 237.2 756.267 235.733 752.133C233.6 746 233.067 740.8 232.933 724C232.8 704.4 233.067 702.133 238 680.667C242.4 661.2 243.2 655.067 243.733 637.867C244.133 620.533 243.733 614.4 240.533 593.2C235.467 561.2 235.467 562.8 245.067 477.333L248.8 444.667L250.533 459.333C251.467 467.333 253.6 486.267 255.333 501.333C257.067 516.4 259.2 536.4 260 545.867C261.733 563.733 261.733 562.933 256.533 594.667C255.333 601.6 254.267 616.933 254 628.667C253.467 650.933 254.533 659.333 261.6 688.667C265.6 705.467 266.133 738.4 262.533 749.6C259.333 759.467 259.333 764.667 262.667 768C265.333 770.667 266.8 770.667 305.067 770.4C339.2 770 344.667 769.733 344.667 768C344.667 766.8 343.2 765.867 340.667 765.6C334.667 765.067 305.2 750 300.667 745.333L296.667 741.067L297.067 722.933C297.2 712.933 298.667 695.467 300.267 684C302.8 666.133 303.2 657.2 303.333 618.667C303.333 588.933 304 572.267 304.933 568.667C309.467 553.2 317.6 505.733 319.333 484.667C321.333 461.2 321.2 461.333 324.667 461.333C327.067 461.333 327.733 461.867 327.2 463.333C326.667 464.4 326.8 466.267 327.2 467.333C327.867 469.2 328.533 469.067 333.067 466.8C336.533 465.067 339.6 461.733 342.933 456.267C347.2 449.067 347.733 446.933 348.533 435.067C349.067 427.867 350.4 413.333 351.6 402.667C353.067 390 353.867 371.333 353.867 348.667C354 316.8 353.733 313.2 350.933 303.333C347.867 291.867 345.333 262.267 345.333 235.333C345.333 201.333 339.067 185.733 324.667 183.333C316.933 182.133 300.8 176.4 288.4 170.267C277.333 165.067 277.333 164.933 277.333 159.867C277.333 157.067 276.133 151.6 274.667 147.867L272.133 140.933L275.333 137.067C278.4 133.467 281.333 125.733 281.333 121.2C281.333 120 282.267 118.667 283.333 118.133C284.4 117.733 285.333 116.133 285.333 114.667C285.333 113.2 286.4 109.733 287.733 106.933C291.6 99.2 290.933 81.6 286.533 72C279.333 56.9333 263.867 46.5333 248.667 46.8C244.267 46.8 239.2 47.3333 237.333 47.8666Z" fill="none" stroke="#333333" stroke-width="2"/>
</svg>`;
    
    // HTML com SVG injetado e legenda
    let html = `
        <div class="body-visualization-container">
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
    
    // SEMPRE usar atendimento mais recente como atual, senão usar cadastro
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
    } else {
        // Se não há atendimentos, usar cadastro como atual (primeira medição)
        current = previous;
    }
    
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
    // Ordenar atendimentos por data (mais recente primeiro) - usando fuso horário de Brasília (UTC-3)
    const atendimentosOrdenados = [...currentAtendimentos].sort((a, b) => {
        const dataA = new Date(a.data || a.data_atendimento || 0);
        const dataB = new Date(b.data || b.data_atendimento || 0);
        const offsetBrasil = 3 * 60 * 60 * 1000; // 3 horas em milissegundos
        const dataABrasil = new Date(dataA.getTime() + offsetBrasil);
        const dataBBrasil = new Date(dataB.getTime() + offsetBrasil);
        return dataBBrasil - dataABrasil;
    });
    
     para métricas:', atendimentosOrdenados.map(a => ({
        data: a.data || a.data_atendimento
    })));
    
    const firstAtendimento = atendimentosOrdenados[atendimentosOrdenados.length - 1];
    const lastAtendimento = atendimentosOrdenados[0];
    
    ', atendimentosOrdenados.length);
    
    // Peso - usar último atendimento se disponível, senão usar cadastro
    const pesoAtual = parseFloat(lastAtendimento?.peso) || parseFloat(currentClient.peso) || 0;
    const pesoInicial = parseFloat(currentClient.peso) || 0; // Peso do cadastro
    const pesoChange = pesoAtual - pesoInicial;
    const pesoPercentage = pesoInicial > 0 ? ((pesoChange / pesoInicial) * 100).toFixed(1) : 0;
    
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
    const imcMetric = document.getElementById('imcMetric');
    
    if (alturaAtual > 0 && pesoAtual > 0) {
        const alturaM = alturaAtual / 100;
        const imc = (pesoAtual / (alturaM * alturaM)).toFixed(1);
        
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

