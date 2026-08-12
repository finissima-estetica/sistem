// Variáveis globais
let currentStep = 1;
const totalSteps = 5;
let servicosDisponiveis = [];
let pacotesDisponiveis = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Só executar se estiver na página cadastro.html
    if (window.location.pathname.includes('cadastro.html')) {
        updateProgressBar();
        setupFormValidation();
        carregarServicos();
        carregarPacotes();
    }
});

// Função para voltar ao dashboard
function goBack() {
    if (confirm('Tem certeza que deseja cancelar o cadastro? Todos os dados não salvos serão perdidos.')) {
        window.location.href = 'index.html';
    }
}

// Função para avançar para a próxima etapa
function nextStep(step) {
    if (!validateStep(step)) {
        return;
    }
    
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const nextStepElement = document.querySelector(`.form-step[data-step="${step + 1}"]`);
    
    if (nextStepElement) {
        currentStepElement.classList.remove('active');
        nextStepElement.classList.add('active');
        currentStep = step + 1;
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Função para voltar para a etapa anterior
function prevStep(step) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const prevStepElement = document.querySelector(`.form-step[data-step="${step - 1}"]`);
    
    if (prevStepElement) {
        currentStepElement.classList.remove('active');
        prevStepElement.classList.add('active');
        currentStep = step - 1;
        updateProgressBar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Função para atualizar a barra de progresso
function updateProgressBar() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

// Função para validar etapa atual
function validateStep(step) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    let firstInvalidField = null;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#e74c3c';
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    // Validações específicas por etapa
    if (step === 1) {
        // Validação de CPF
        const cpf = document.getElementById('cpf');
        if (cpf.value && !validateCPF(cpf.value)) {
            isValid = false;
            cpf.style.borderColor = '#e74c3c';
            alert('CPF inválido. Por favor, verifique.');
            if (!firstInvalidField) firstInvalidField = cpf;
        }
        
        // Validação de email
        const email = document.getElementById('email');
        if (email.value && !validateEmail(email.value)) {
            isValid = false;
            email.style.borderColor = '#e74c3c';
            alert('E-mail inválido. Por favor, verifique.');
            if (!firstInvalidField) firstInvalidField = email;
        }
    }
    
    if (step === 3) {
        // Validação de peso e altura
        const peso = document.getElementById('peso');
        const altura = document.getElementById('altura');
        
        if (peso.value && (parseFloat(peso.value) < 30 || parseFloat(peso.value) > 300)) {
            isValid = false;
            peso.style.borderColor = '#e74c3c';
            alert('Peso deve estar entre 30kg e 300kg.');
            if (!firstInvalidField) firstInvalidField = peso;
        }
        
        if (altura.value && (parseFloat(altura.value) < 100 || parseFloat(altura.value) > 250)) {
            isValid = false;
            altura.style.borderColor = '#e74c3c';
            alert('Altura deve estar entre 100cm e 250cm.');
            if (!firstInvalidField) firstInvalidField = altura;
        }
    }
    
    if (step === 5) {
        // Validação do termo de responsabilidade
        const aceiteTermo = document.getElementById('aceiteTermo');
        if (!aceiteTermo.checked) {
            isValid = false;
            alert('Você deve aceitar o termo de responsabilidade para continuar.');
            if (!firstInvalidField) firstInvalidField = aceiteTermo;
        }
    }
    
    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
}

// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf[9])) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (digit !== parseInt(cpf[10])) return false;
    
    return true;
}

// Função para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Função para configurar validação do formulário
function setupFormValidation() {
    const form = document.getElementById('cadastroForm');
    form.addEventListener('submit', handleSubmit);
}

// Função para lidar com o envio do formulário
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateStep(5)) {
        return;
    }
    
    // Coletar dados do formulário
    const formData = collectFormData();
    
    // Salvar no banco de dados ou localStorage
    await saveClientData(formData);
    
    // Verificar se deve vincular pacote
    const vincularPacote = document.getElementById('vincularPacote').value;
    if (vincularPacote === 'sim') {
        const pacoteId = document.getElementById('pacoteSelecionado').value;
        const dataInicio = document.getElementById('dataInicioPacote').value;
        const dataFim = document.getElementById('dataFimPacote').value;
        const observacoes = document.getElementById('observacoesPacote').value;
        
        if (pacoteId && dataInicio && dataFim) {
            await vincularPacoteAoCliente(formData.id, pacoteId, dataInicio, dataFim, observacoes);
        }
    }
    
    // Redirecionar para o dashboard com flag para recarregar
    console.log('🔄 Redirecionando para dashboard...');
    alert('Cliente cadastrado com sucesso!');
    window.location.href = 'index.html?reload=true';
}

// Função para vincular pacote ao cliente
async function vincularPacoteAoCliente(clienteId, pacoteId, dataInicio, dataFim, observacoes) {
    try {
        await pacotesAPI.vincularAoCliente(clienteId, {
            pacoteId: parseInt(pacoteId),
            dataInicio,
            dataFim,
            observacoes
        });
        console.log('Pacote vinculado com sucesso');
    } catch (error) {
        console.error('Erro ao vincular pacote:', error);
    }
}

// Função para coletar dados do formulário
function collectFormData() {
    const form = document.getElementById('cadastroForm');
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });
    
    // Adicionar data de cadastro
    data.dataCadastro = new Date().toISOString();
    data.id = Date.now(); // ID único
    
    return data;
}

// Função para salvar dados do cliente
async function saveClientData(clientData) {
    try {
        // Enviar clientData diretamente - o servidor normaliza camelCase/snake_case
        const savedClient = await clientesAPI.criar(clientData);
        
        // Armazenar o ID correto do banco para uso posterior
        clientData.id = savedClient.id;
        localStorage.setItem('lastCreatedClientId', savedClient.id);
        
        // Salvar serviços selecionados
        const servicosIds = coletarServicosSelecionados();
        if (servicosIds.length > 0) {
            await vincularServicosAoCliente(savedClient.id, servicosIds);
        }
        
        return;
    } catch (error) {
        console.error('❌ Erro ao criar cliente via API:', error);
        console.log('API não disponível, usando localStorage:', error);
    }
    
    // Fallback para localStorage
    let clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Adicionar novo cliente com ID único
    clientData.id = Date.now();
    clients.push(clientData);
    
    // Salvar no localStorage
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Armazenar o ID para uso posterior
    localStorage.setItem('lastCreatedClientId', clientData.id);
    
    console.log('Cliente salvo no localStorage');
}

// Função para vincular serviços ao cliente
async function vincularServicosAoCliente(clienteId, servicosIds) {
    try {
        await servicosAPI.vincularAoCliente(clienteId, servicosIds);
        console.log('Serviços vinculados com sucesso');
    } catch (error) {
        console.error('Erro ao vincular serviços:', error);
    }
}

// Função para carregar serviços do banco de dados
async function carregarServicos() {
    try {
        const servicos = await servicosAPI.listar();
        servicosDisponiveis = servicos;
        renderizarServicos();
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

// Função para carregar pacotes do banco de dados
async function carregarPacotes() {
    try {
        const pacotes = await pacotesAPI.listar();
        pacotesDisponiveis = pacotes;
        renderizarPacotesSelect();
    } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
    }
}

// Função para renderizar pacotes no select
function renderizarPacotesSelect() {
    const select = document.getElementById('pacoteSelecionado');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um pacote</option>';
    
    pacotesDisponiveis.forEach(pacote => {
        select.innerHTML += `
            <option value="${pacote.id}">
                ${pacote.nome} - ${pacote.numero_sessoes} sessões - R$ ${parseFloat(pacote.valor).toFixed(2)}
            </option>
        `;
    });
}

// Função para mostrar/esconder opções de pacote
function togglePacoteOptions() {
    const vincularPacote = document.getElementById('vincularPacote').value;
    const pacoteOptions = document.getElementById('pacoteOptions');
    
    if (vincularPacote === 'sim') {
        pacoteOptions.style.display = 'block';
        // Definir data de início como hoje
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataInicioPacote').value = hoje;
    } else {
        pacoteOptions.style.display = 'none';
    }
}

// Função para renderizar serviços no formulário
function renderizarServicos() {
    const servicosContainer = document.getElementById('servicosContainer');
    if (!servicosContainer) return;

    servicosContainer.innerHTML = '';
    
    if (servicosDisponiveis.length === 0) {
        servicosContainer.innerHTML = '<p class="empty-state">Nenhum serviço disponível. Crie serviços primeiro no dashboard.</p>';
        return;
    }

    servicosDisponiveis.forEach(servico => {
        const div = document.createElement('div');
        div.className = 'servico-item';
        div.innerHTML = `
            <label class="servico-label">
                <input type="checkbox" 
                       name="servicos" 
                       value="${servico.id}" 
                       class="servico-checkbox"
                       data-nome="${servico.nome}"
                       data-valor="${servico.valor_medio}">
                <span class="servico-nome">${servico.nome}</span>
                <span class="servico-valor">R$ ${parseFloat(servico.valor_medio).toFixed(2)}</span>
            </label>
        `;
        servicosContainer.appendChild(div);
    });
}

// Função para coletar serviços selecionados
function coletarServicosSelecionados() {
    const checkboxes = document.querySelectorAll('input[name="servicos"]:checked');
    const servicosIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    return servicosIds;
}

// Máscaras de input
document.addEventListener('DOMContentLoaded', () => {
    // Máscara de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
            
            e.target.value = value;
        });
    }
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{4})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/(\d{2})/, '($1');
            }
            
            e.target.value = value;
        });
    }
});

// Tornar funções globais
window.goBack = goBack;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.togglePacoteOptions = togglePacoteOptions;
window.coletarServicosSelecionados = coletarServicosSelecionados;