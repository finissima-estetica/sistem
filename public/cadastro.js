// Variáveis globais
let currentStep = 1;
const totalSteps = 5;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Só executar se estiver na página cadastro.html
    if (window.location.pathname.includes('cadastro.html')) {
        updateProgressBar();
        setupFormValidation();
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
    
    console.log('📝 Iniciando submissão do formulário');
    
    if (!validateStep(5)) {
        console.log('❌ Validação falhou');
        return;
    }
    
    console.log('✅ Validação passou');
    
    // Coletar dados do formulário
    const formData = collectFormData();
    console.log('📋 Dados coletados:', formData);
    
    // Salvar no banco de dados ou localStorage
    console.log('💾 Salvando dados do cliente...');
    await saveClientData(formData);
    console.log('✅ Dados salvos');
    
    // Verificar se deve vincular plano
    const vincularPlano = document.getElementById('vincularPlano').value;
    if (vincularPlano === 'sim') {
        const planoId = document.getElementById('planoSelecionado').value;
        const dataInicio = document.getElementById('dataInicioPlano').value;
        
        if (planoId && dataInicio) {
            vincularPlanoAoCliente(formData.id, planoId, dataInicio);
        }
    }
    
    // Redirecionar para o dashboard com flag para recarregar
    console.log('🔄 Redirecionando para dashboard...');
    alert('Cliente cadastrado com sucesso!');
    window.location.href = 'index.html?reload=true';
}

// Função para vincular plano ao cliente
function vincularPlanoAoCliente(clienteId, planoId, dataInicio) {
    const planosInfo = {
        'plano_limpeza': { duracao: 6, nome: 'Plano Limpeza de Pele' },
        'plano_peeling': { duracao: 6, nome: 'Plano Peeling Químico' },
        'plano_botox': { duracao: 6, nome: 'Plano Botox' },
        'plano_preenchimento': { duracao: 6, nome: 'Plano Preenchimento Facial' },
        'plano_laser': { duracao: 6, nome: 'Plano Laser' },
        'plano_drenagem': { duracao: 6, nome: 'Plano Drenagem Linfática' },
        'plano_massagem': { duracao: 6, nome: 'Plano Massagem' },
        'plano_carboxiterapia': { duracao: 6, nome: 'Plano Carboxiterapia' },
        'plano_microneedling': { duracao: 6, nome: 'Plano Microneedling' },
        'plano_completo': { duracao: 6, nome: 'Plano Completo' }
    };
    
    const planoInfo = planosInfo[planoId];
    const dataInicioDate = new Date(dataInicio);
    const dataFim = new Date(dataInicioDate);
    dataFim.setMonth(dataFim.getMonth() + planoInfo.duracao);
    
    const plano = {
        id: Date.now(),
        clienteId: clienteId,
        planoId: planoId,
        dataInicio: dataInicio,
        dataFim: dataFim.toISOString().split('T')[0],
        observacoes: ''
    };
    
    // Salvar no localStorage
    const planos = JSON.parse(localStorage.getItem('planos') || '[]');
    planos.push(plano);
    localStorage.setItem('planos', JSON.stringify(planos));
}

// Função para mostrar/esconder opções de plano
function togglePlanoOptions() {
    const vincularPlano = document.getElementById('vincularPlano').value;
    const planoOptions = document.getElementById('planoOptions');
    
    if (vincularPlano === 'sim') {
        planoOptions.style.display = 'block';
        // Definir data de início como hoje
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataInicioPlano').value = hoje;
    } else {
        planoOptions.style.display = 'none';
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
    
    console.log('📋 Dados coletados do formulário:', data);
    console.log('📋 Data de nascimento coletada:', data.dataNascimento);
    console.log('📋 Medidas:', {
        bracoDireito: data.bracoDireito,
        bracoEsquerdo: data.bracoEsquerdo,
        coxaDireita: data.coxaDireito,
        coxaEsquerda: data.coxaEsquerda,
        panturrilhaDireita: data.panturrilhaDireita,
        panturrilhaEsquerda: data.panturrilhaEsquerda
    });
    
    return data;
}

// Função para salvar dados do cliente
async function saveClientData(clientData) {
    try {
        // Tentar usar API diretamente sem verificar health
        // Mapear campos do formulário para o banco de dados
        const apiData = {
            nome: clientData.nome,
            cpf: clientData.cpf,
            data_nascimento: clientData.dataNascimento || null,
            telefone: clientData.telefone,
            email: clientData.email,
            endereco: clientData.endereco,
            cidade: clientData.cidade,
            estado: clientData.estado,
            doencas_cronicas: clientData.doencasCronicas,
            medicamentos: clientData.medicamentos,
            cirurgias: clientData.cirurgias,
            alergias: clientData.alergias,
            sensibilidade: clientData.sensibilidade,
            fumante: clientData.fumante,
            alcool: clientData.alcool,
            atividade_fisica: clientData.atividadeFisica,
            procedimentos_desejados: clientData.detalhesProcedimentos,
            objetivos: clientData.objetivos,
            peso: clientData.peso,
            altura: clientData.altura,
            braco_direito: clientData.bracoDireito,
            braco_esquerdo: clientData.bracoEsquerdo,
            torax: clientData.torax,
            cintura: clientData.cintura,
            abdomen: clientData.abdomen,
            quadril: clientData.quadril,
            coxa_direito: clientData.coxaDireito,
            coxa_esquerda: clientData.coxaEsquerda,
            panturrilha_direito: clientData.panturrilhaDireito,
            panturrilha_esquerda: clientData.panturrilhaEsquerda
        };
        
        console.log('📋 Dados completos antes de enviar:', apiData);
        
        console.log('🚀 Iniciando criação de cliente via API:', apiData);
        
        // Converter strings vazias em NULL para campos numéricos
        const numericFields = ['peso', 'altura', 'bracoDireito', 'bracoEsquerdo', 'torax', 'cintura', 'abdomen', 'quadril', 'coxaDireita', 'coxaEsquerda', 'panturrilhaDireita', 'panturrilhaEsquerda'];
        numericFields.forEach(field => {
            if (apiData[field] === '' || apiData[field] === undefined || apiData[field] === null) {
                apiData[field] = null;
            }
        });
        
        console.log('🔢 Dados convertidos para campos numéricos:', apiData);
        const savedClient = await clientesAPI.criar(apiData);
        console.log('✅ Cliente salvo no PostgreSQL:', savedClient);
        
        // Armazenar o ID correto do banco para uso posterior
        clientData.id = savedClient.id;
        localStorage.setItem('lastCreatedClientId', savedClient.id);
        
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
window.togglePlanoOptions = togglePlanoOptions;
