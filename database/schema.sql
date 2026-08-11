-- Esquema do Banco de Dados para Sistema Clínica Estética

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Ativo',
    
    -- Dados de Anamnese
    doencas_cronicas TEXT,
    medicamentos TEXT,
    cirurgias TEXT,
    alergias TEXT,
    sensibilidade TEXT,
    fumante VARCHAR(20),
    alcool VARCHAR(20),
    atividade_fisica VARCHAR(20),
    
    -- Procedimentos desejados
    procedimentos_desejados TEXT,
    objetivos TEXT,
    
    -- Medidas Iniciais
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    braco_direito DECIMAL(5,2),
    braco_esquerdo DECIMAL(5,2),
    torax DECIMAL(5,2),
    cintura DECIMAL(5,2),
    abdomen DECIMAL(5,2),
    quadril DECIMAL(5,2),
    coxa_direita DECIMAL(5,2),
    coxa_esquerda DECIMAL(5,2),
    panturrilha_direita DECIMAL(5,2),
    panturrilha_esquerda DECIMAL(5,2)
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    plano_id VARCHAR(50) NOT NULL,
    nome_plano VARCHAR(255) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    duracao_meses INTEGER DEFAULT 6,
    preco DECIMAL(10,2),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'Ativo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    plano_id INTEGER REFERENCES planos(id) ON DELETE SET NULL,
    data_atendimento DATE NOT NULL,
    tipo_atendimento VARCHAR(50) NOT NULL,
    observacoes TEXT,
    
    -- Medidas do Atendimento
    peso DECIMAL(5,2),
    braco_direito DECIMAL(5,2),
    braco_esquerdo DECIMAL(5,2),
    torax DECIMAL(5,2),
    cintura DECIMAL(5,2),
    abdomen DECIMAL(5,2),
    quadril DECIMAL(5,2),
    coxa_direita DECIMAL(5,2),
    coxa_esquerda DECIMAL(5,2),
    panturrilha_direita DECIMAL(5,2),
    panturrilha_esquerda DECIMAL(5,2),
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) DEFAULT 'usuario',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente ON atendimentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos(data_atendimento);
CREATE INDEX IF NOT EXISTS idx_planos_cliente ON planos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planos_status ON planos(status);

-- Inserir usuários padrão (senhas devem ser hasheadas em produção)
INSERT INTO usuarios (nome, email, senha, cargo) VALUES 
('Administrador', 'admin@clinica.com', 'admin123', 'admin'),
('Usuário', 'usuario@clinica.com', 'usuario123', 'usuario')
ON CONFLICT (email) DO NOTHING;
