const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos explicitamente
app.use(express.static(path.join(__dirname, 'public'), {
    index: false, // Não servir index.html automaticamente
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
    }
}));

// Rotas explícitas para arquivos JavaScript principais
app.get('/api.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api.js'), {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8'
        }
    });
});

app.get('/auth.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.js'), {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8'
        }
    });
});

app.get('/cadastro.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.js'), {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8'
        }
    });
});

app.get('/ficha.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ficha.js'), {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8'
        }
    });
});

// Rota de health check para verificar se API está disponível
app.get('/api/health', async (req, res) => {
    try {
        // Testar conexão com o banco
        await pool.query('SELECT 1');
        res.json({ 
            status: 'ok', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro no health check:', error);
        res.status(500).json({ 
            status: 'error', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// Rota de debug simples para testar se servidor está respondendo
app.get('/api/debug', (req, res) => {
    res.json({
        message: 'Servidor está respondendo',
        database_url: process.env.DATABASE_URL ? 'Configurada' : 'NÃO configurada',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Rota de teste para criar cliente simples
app.post('/api/test-client', async (req, res) => {
    try {
        const result = await pool.query(`
            INSERT INTO clientes (nome, email, telefone, status, data_cadastro)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `, ['Teste API', 'teste@api.com', '11999999999', 'Ativo']);
        
        res.json({ success: true, client: result.rows[0] });
    } catch (error) {
        console.error('Erro no teste:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Configuração do PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Sempre usar SSL para Render
    ssl: { rejectUnauthorized: false },
    // Configurar fuso horário para Brasília (UTC-3)
    timezone: 'America/Sao_Paulo'
});

// Função de migração automática
async function runMigrations() {
    try {
        console.log('🔄 Iniciando migração do banco de dados...');

        // Verificar se a tabela servicos existe
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'servicos'
        `);

        if (tableCheck.rows.length === 0) {
            console.log('➕ Criando tabela servicos...');
            await pool.query(`
                CREATE TABLE servicos (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    valor_medio DECIMAL(10,2) NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT true,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabela servicos criada');
        } else {
            console.log('ℹ️ Tabela servicos já existe');
        }

        // Verificar se a tabela cliente_servicos existe
        const clienteServicosCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'cliente_servicos'
        `);

        if (clienteServicosCheck.rows.length === 0) {
            console.log('➕ Criando tabela cliente_servicos...');
            await pool.query(`
                CREATE TABLE cliente_servicos (
                    id SERIAL PRIMARY KEY,
                    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                    servico_id INTEGER REFERENCES servicos(id) ON DELETE CASCADE,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabela cliente_servicos criada');
        } else {
            console.log('ℹ️ Tabela cliente_servicos já existe');
        }

        // Verificar se a tabela atendimento_servicos existe
        const atendimentoServicosCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'atendimento_servicos'
        `);

        if (atendimentoServicosCheck.rows.length === 0) {
            console.log('➕ Criando tabela atendimento_servicos...');
            await pool.query(`
                CREATE TABLE atendimento_servicos (
                    id SERIAL PRIMARY KEY,
                    atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE CASCADE,
                    servico_id INTEGER REFERENCES servicos(id) ON DELETE CASCADE,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabela atendimento_servicos criada');
        } else {
            console.log('ℹ️ Tabela atendimento_servicos já existe');
        }

        // Verificar se a tabela pacotes existe
        const pacotesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'pacotes'
        `);

        if (pacotesCheck.rows.length === 0) {
            console.log('➕ Criando tabela pacotes...');
            await pool.query(`
                CREATE TABLE pacotes (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    servico_id INTEGER REFERENCES servicos(id) ON DELETE CASCADE,
                    numero_sessoes INTEGER NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    descricao TEXT,
                    ativo BOOLEAN DEFAULT true,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabela pacotes criada');
        } else {
            console.log('ℹ️ Tabela pacotes já existe');
        }

        // Verificar se a tabela cliente_pacotes existe
        const clientePacotesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'cliente_pacotes'
        `);

        if (clientePacotesCheck.rows.length === 0) {
            console.log('➕ Criando tabela cliente_pacotes...');
            await pool.query(`
                CREATE TABLE cliente_pacotes (
                    id SERIAL PRIMARY KEY,
                    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
                    pacote_id INTEGER REFERENCES pacotes(id) ON DELETE CASCADE,
                    sessoes_restantes INTEGER NOT NULL,
                    observacoes TEXT,
                    status VARCHAR(20) DEFAULT 'Ativo',
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabela cliente_pacotes criada');
        } else {
            console.log('ℹ️ Tabela cliente_pacotes já existe');
            
            // Verificar se tem colunas antigas data_inicio e data_fim
            const columnsCheck = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'cliente_pacotes' 
                AND column_name IN ('data_inicio', 'data_fim')
            `);
            
            if (columnsCheck.rows.length > 0) {
                console.log('➕ Removendo colunas antigas data_inicio e data_fim...');
                await pool.query(`
                    ALTER TABLE cliente_pacotes 
                    DROP COLUMN IF EXISTS data_inicio,
                    DROP COLUMN IF EXISTS data_fim
                `);
                console.log('✅ Colunas antigas removidas');
            }
        }

        // Verificar se a coluna tipo_atendimento pode ser NULL
        const tipoAtendimentoCheck = await pool.query(`
            SELECT column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'atendimentos' 
            AND column_name = 'tipo_atendimento'
        `);

        if (tipoAtendimentoCheck.rows.length > 0 && tipoAtendimentoCheck.rows[0].is_nullable === 'NO') {
            console.log('➕ Alterando coluna tipo_atendimento para permitir NULL...');
            await pool.query(`
                ALTER TABLE atendimentos 
                ALTER COLUMN tipo_atendimento DROP NOT NULL
            `);
            console.log('✅ Coluna tipo_atendimento alterada');
        } else {
            console.log('ℹ️ Coluna tipo_atendimento já permite NULL');
        }

        // Verificar se as colunas de panturrilha existem em atendimentos
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'atendimentos' 
            AND column_name IN ('panturrilha_direita', 'panturrilha_esquerda')
        `);

        const existingColumns = checkResult.rows.map(row => row.column_name);
        console.log('Colunas existentes em atendimentos:', existingColumns);

        // Adicionar panturrilha_direita se não existir
        if (!existingColumns.includes('panturrilha_direita')) {
            console.log('➕ Adicionando coluna panturrilha_direita...');
            await pool.query('ALTER TABLE atendimentos ADD COLUMN panturrilha_direita DECIMAL(5,2)');
            console.log('✅ Coluna panturrilha_direita adicionada');
        } else {
            console.log('ℹ️ Coluna panturrilha_direita já existe');
        }

        // Adicionar panturrilha_esquerda se não existir
        if (!existingColumns.includes('panturrilha_esquerda')) {
            console.log('➕ Adicionando coluna panturrilha_esquerda...');
            await pool.query('ALTER TABLE atendimentos ADD COLUMN panturrilha_esquerda DECIMAL(5,2)');
            console.log('✅ Coluna panturrilha_esquerda adicionada');
        } else {
            console.log('ℹ️ Coluna panturrilha_esquerda já existe');
        }

        // Verificar se a coluna cliente_pacote_id existe em atendimentos
        const clientePacoteCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'atendimentos' 
            AND column_name = 'cliente_pacote_id'
        `);

        if (clientePacoteCheck.rows.length === 0) {
            console.log('➕ Adicionando coluna cliente_pacote_id...');
            await pool.query(`
                ALTER TABLE atendimentos 
                ADD COLUMN cliente_pacote_id INTEGER REFERENCES cliente_pacotes(id) ON DELETE SET NULL
            `);
            console.log('✅ Coluna cliente_pacote_id adicionada');
        } else {
            console.log('ℹ️ Coluna cliente_pacote_id já existe');
        }

        console.log('✅ Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        // Não falhar o servidor se a migração falhar
    }
}

// Testar conexão com o banco
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
    runMigrations();
    initializeDatabase();
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão com PostgreSQL:', err);
});

// Forçar conexão inicial ao iniciar o servidor
pool.connect()
    .then(() => {
        console.log('🔗 Conexão inicial estabelecida com PostgreSQL');
    })
    .catch(err => {
        console.error('❌ Falha na conexão inicial:', err);
    });

// Função para inicializar o banco de dados
async function initializeDatabase() {
    try {
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        
        // Verificar se o arquivo schema existe
        if (!fs.existsSync(schemaPath)) {
            console.log('Arquivo schema.sql não encontrado');
            return;
        }
        
        // Verificar se as tabelas já existem
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        if (tablesCheck.rows.length > 0) {
            console.log('Tabelas já existem, pulando inicialização');
            return;
        }
        
        // Ler e executar o schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Schema do banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
    }
}

// Rotas de Autenticação
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
            [email, senha]
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    nome: user.nome, 
                    email: user.email,
                    cargo: user.cargo 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rotas de Clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY data_cadastro DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

app.get('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const cliente = req.body;
        console.log('📝 Recebendo dados para criar cliente:', cliente);

        // Normalizar campos camelCase para snake_case
        const normalizado = { ...cliente };
        // Criar um mapa de conversão
        const camelToSnake = {
            dataNascimento: 'data_nascimento',
            doencasCronicas: 'doencas_cronicas',
            atividadeFisica: 'atividade_fisica',
            detalhesProcedimentos: 'procedimentos_desejados',
            bracoDireito: 'braco_direito',
            bracoEsquerdo: 'braco_esquerdo',
            coxaDireita: 'coxa_direita',
            coxaEsquerda: 'coxa_esquerda',
            panturrilhaDireita: 'panturrilha_direita',
            panturrilhaEsquerda: 'panturrilha_esquerda'
        };
        
        // Aplicar conversão
        Object.keys(camelToSnake).forEach(camel => {
            if (cliente[camel] !== undefined && normalizado[camelToSnake[camel]] === undefined) {
                normalizado[camelToSnake[camel]] = cliente[camel];
            }
        });

        console.log('🔍 Dados normalizados:', normalizado);

        // Converter strings vazias em NULL para campos numéricos
        const numericFields = ['peso', 'altura', 'braco_direito', 'braco_esquerdo', 'torax', 'cintura', 'abdomen', 'quadril', 'coxa_direita', 'coxa_esquerda', 'panturrilha_direita', 'panturrilha_esquerda'];
        numericFields.forEach(field => {
            const value = normalizado[field];
            if (value === '' || value === undefined || value === null) {
                normalizado[field] = null;
            } else {
                normalizado[field] = parseFloat(value) || null;
            }
        });
        
        console.log('🔢 Dados convertidos para campos numéricos:', normalizado);
        
        const result = await pool.query(`
            INSERT INTO clientes (
                nome, cpf, data_nascimento, telefone, email, endereco, cidade, estado,
                doencas_cronicas, medicamentos, cirurgias, alergias, sensibilidade,
                fumante, alcool, atividade_fisica, procedimentos_desejados, objetivos,
                peso, altura, braco_direito, braco_esquerdo, torax, cintura, abdomen,
                quadril, coxa_direita, coxa_esquerda, panturrilha_direita, panturrilha_esquerda
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
            RETURNING *
        `, [
            normalizado.nome, normalizado.cpf, normalizado.data_nascimento, normalizado.telefone, normalizado.email,
            normalizado.endereco, normalizado.cidade, normalizado.estado, normalizado.doencas_cronicas,
            normalizado.medicamentos, normalizado.cirurgias, normalizado.alergias, normalizado.sensibilidade,
            normalizado.fumante, normalizado.alcool, normalizado.atividade_fisica, normalizado.procedimentos_desejados,
            normalizado.objetivos, normalizado.peso, normalizado.altura, normalizado.braco_direito,
            normalizado.braco_esquerdo, normalizado.torax, normalizado.cintura, normalizado.abdomen,
            normalizado.quadril, normalizado.coxa_direita, normalizado.coxa_esquerda,
            normalizado.panturrilha_direita, normalizado.panturrilha_esquerda
        ]);
        
        console.log('✅ Cliente criado com sucesso:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = req.body;
        
        const result = await pool.query(`
            UPDATE clientes SET
                nome = $1, cpf = $2, data_nascimento = $3, telefone = $4, email = $5,
                endereco = $6, cidade = $7, estado = $8, status = $9
            WHERE id = $10
            RETURNING *
        `, [
            cliente.nome, cliente.cpf, cliente.dataNascimento, cliente.telefone, cliente.email,
            cliente.endereco, cliente.cidade, cliente.estado, cliente.status, id
        ]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primeiro excluir atendimentos e planos relacionados
        await pool.query('DELETE FROM atendimentos WHERE cliente_id = $1', [id]);
        await pool.query('DELETE FROM planos WHERE cliente_id = $1', [id]);
        
        // Depois excluir o cliente
        const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Cliente excluído com sucesso' });
        } else {
            res.status(404).json({ error: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
});

// Rotas de Atendimentos
app.get('/api/clientes/:clienteId/atendimentos', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const result = await pool.query(
            'SELECT * FROM atendimentos WHERE cliente_id = $1 ORDER BY data_atendimento DESC',
            [clienteId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar atendimentos:', error);
        res.status(500).json({ error: 'Erro ao buscar atendimentos' });
    }
});

app.post('/api/atendimentos', async (req, res) => {
    try {
        const atendimento = req.body;
        
        // Normalizar campos camelCase para snake_case
        const normalizado = { ...atendimento };
        const camelToSnake = {
            clienteId: 'cliente_id',
            planoId: 'plano_id',
            clientePacoteId: 'cliente_pacote_id',
            data: 'data_atendimento',
            observacoes: 'observacoes',
            bracoDireito: 'braco_direito',
            bracoEsquerdo: 'braco_esquerdo',
            coxaDireita: 'coxa_direita',
            coxaEsquerda: 'coxa_esquerda',
            panturrilhaDireita: 'panturrilha_direita',
            panturrilhaEsquerda: 'panturrilha_esquerda'
        };
        
        Object.keys(camelToSnake).forEach(camel => {
            if (atendimento[camel] !== undefined && normalizado[camelToSnake[camel]] === undefined) {
                normalizado[camelToSnake[camel]] = atendimento[camel];
            }
        });
        
        // Ajustar data para fuso horário de Brasília (UTC-3)
        let dataAtendimento = normalizado.data_atendimento || normalizado.data;
        if (dataAtendimento) {
            // Se for string ISO, ajustar para garantir timezone correto
            const dataObj = new Date(dataAtendimento);
            if (!isNaN(dataObj.getTime())) {
                // Criar data em UTC-3 (Brasília)
                const offsetBrasil = 3 * 60 * 60 * 1000; // 3 horas
                const dataUTC = dataObj.getTime() + offsetBrasil;
                dataAtendimento = new Date(dataUTC).toISOString().split('T')[0];
            }
        }
        
        // Converter strings vazias em NULL para campos numéricos
        const numericFields = ['peso', 'braco_direito', 'braco_esquerdo', 'torax', 'cintura', 'abdomen', 'quadril', 'coxa_direita', 'coxa_esquerda', 'panturrilha_direita', 'panturrilha_esquerda'];
        numericFields.forEach(field => {
            const value = normalizado[field];
            if (value === '' || value === undefined || value === null) {
                normalizado[field] = null;
            } else {
                normalizado[field] = parseFloat(value) || null;
            }
        });
        
        const result = await pool.query(`
            INSERT INTO atendimentos (
                cliente_id, plano_id, cliente_pacote_id, data_atendimento, observacoes,
                peso, braco_direito, braco_esquerdo, torax, cintura, abdomen,
                quadril, coxa_direita, coxa_esquerda, panturrilha_direita, panturrilha_esquerda
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `, [
            normalizado.cliente_id, normalizado.plano_id, normalizado.cliente_pacote_id, dataAtendimento,
            normalizado.observacoes, normalizado.peso,
            normalizado.braco_direito, normalizado.braco_esquerdo, normalizado.torax,
            normalizado.cintura, normalizado.abdomen, normalizado.quadril,
            normalizado.coxa_direita, normalizado.coxa_esquerda,
            normalizado.panturrilha_direita, normalizado.panturrilha_esquerda
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar atendimento:', error);
        res.status(500).json({ error: 'Erro ao criar atendimento' });
    }
});

// Endpoint para vincular atendimento a pacote
app.put('/api/atendimentos/:id/pacote', async (req, res) => {
    try {
        const { id } = req.params;
        const { clientePacoteId } = req.body;
        
        const result = await pool.query(
            'UPDATE atendimentos SET cliente_pacote_id = $1 WHERE id = $2 RETURNING *',
            [clientePacoteId, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Atendimento não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao vincular atendimento ao pacote:', error);
        res.status(500).json({ error: 'Erro ao vincular atendimento ao pacote' });
    }
});

// Endpoint para buscar atendimentos de um pacote
app.get('/api/cliente_pacotes/:id/atendimentos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT a.*, c.nome as cliente_nome
            FROM atendimentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            WHERE a.cliente_pacote_id = $1
            ORDER BY a.data_atendimento DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar atendimentos do pacote:', error);
        res.status(500).json({ error: 'Erro ao buscar atendimentos do pacote' });
    }
});

// Endpoint para buscar serviços de um cliente específico
app.get('/api/clientes/:id/servicos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT s.* FROM servicos s
            INNER JOIN cliente_servicos cs ON s.id = cs.servico_id
            WHERE cs.cliente_id = $1 AND s.ativo = true
            ORDER BY s.nome ASC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar serviços do cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços do cliente' });
    }
});

// Endpoint para vincular serviços a um cliente
app.post('/api/clientes/:id/servicos', async (req, res) => {
    try {
        const { id } = req.params;
        const { servicoIds } = req.body;
        
        // Remover vínculos antigos
        await pool.query('DELETE FROM cliente_servicos WHERE cliente_id = $1', [id]);
        
        // Adicionar novos vínculos
        if (servicoIds && servicoIds.length > 0) {
            for (const servicoId of servicoIds) {
                await pool.query(
                    'INSERT INTO cliente_servicos (cliente_id, servico_id) VALUES ($1, $2)',
                    [id, servicoId]
                );
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao vincular serviços ao cliente:', error);
        res.status(500).json({ error: 'Erro ao vincular serviços ao cliente' });
    }
});

// Endpoint para buscar serviços de um atendimento específico
app.get('/api/atendimentos/:id/servicos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT s.* FROM servicos s
            INNER JOIN atendimento_servicos aso ON s.id = aso.servico_id
            WHERE aso.atendimento_id = $1 AND s.ativo = true
            ORDER BY s.nome ASC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar serviços do atendimento:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços do atendimento' });
    }
});

// Endpoint para vincular serviços a um atendimento
app.post('/api/atendimentos/:id/servicos', async (req, res) => {
    try {
        const { id } = req.params;
        const { servicoIds } = req.body;
        
        // Remover vínculos antigos
        await pool.query('DELETE FROM atendimento_servicos WHERE atendimento_id = $1', [id]);
        
        // Adicionar novos vínculos
        if (servicoIds && servicoIds.length > 0) {
            for (const servicoId of servicoIds) {
                await pool.query(
                    'INSERT INTO atendimento_servicos (atendimento_id, servico_id) VALUES ($1, $2)',
                    [id, servicoId]
                );
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao vincular serviços ao atendimento:', error);
        res.status(500).json({ error: 'Erro ao vincular serviços ao atendimento' });
    }
});

// Rotas de Serviços
app.get('/api/servicos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM servicos WHERE ativo = true ORDER BY nome ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços' });
    }
});

app.post('/api/servicos', async (req, res) => {
    try {
        const servico = req.body;
        
        const result = await pool.query(`
            INSERT INTO servicos (nome, valor_medio, descricao, ativo)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            servico.nome,
            servico.valorMedio,
            servico.descricao || null,
            servico.ativo !== false
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ error: 'Erro ao criar serviço' });
    }
});

app.put('/api/servicos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const servico = req.body;
        
        const result = await pool.query(`
            UPDATE servicos 
            SET nome = $1, valor_medio = $2, descricao = $3, ativo = $4
            WHERE id = $5
            RETURNING *
        `, [
            servico.nome,
            servico.valorMedio,
            servico.descricao || null,
            servico.ativo !== false,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
});

app.delete('/api/servicos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE servicos SET ativo = false WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao desativar serviço:', error);
        res.status(500).json({ error: 'Erro ao desativar serviço' });
    }
});

// Rotas de Pacotes
app.get('/api/pacotes', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, s.nome as servico_nome, s.valor_medio as servico_valor 
            FROM pacotes p
            LEFT JOIN servicos s ON p.servico_id = s.id
            WHERE p.ativo = true
            ORDER BY p.nome ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pacotes:', error);
        res.status(500).json({ error: 'Erro ao buscar pacotes' });
    }
});

app.post('/api/pacotes', async (req, res) => {
    try {
        const pacote = req.body;
        
        const result = await pool.query(`
            INSERT INTO pacotes (nome, servico_id, numero_sessoes, valor, descricao, ativo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            pacote.nome,
            pacote.servicoId,
            pacote.numeroSessoes,
            pacote.valor,
            pacote.descricao || null,
            pacote.ativo !== false
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar pacote:', error);
        res.status(500).json({ error: 'Erro ao criar pacote' });
    }
});

app.put('/api/pacotes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pacote = req.body;
        
        const result = await pool.query(`
            UPDATE pacotes 
            SET nome = $1, servico_id = $2, numero_sessoes = $3, valor = $4, descricao = $5, ativo = $6
            WHERE id = $7
            RETURNING *
        `, [
            pacote.nome,
            pacote.servicoId,
            pacote.numeroSessoes,
            pacote.valor,
            pacote.descricao || null,
            pacote.ativo !== false,
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pacote não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar pacote:', error);
        res.status(500).json({ error: 'Erro ao atualizar pacote' });
    }
});

app.delete('/api/pacotes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE pacotes SET ativo = false WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pacote não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao desativar pacote:', error);
        res.status(500).json({ error: 'Erro ao desativar pacote' });
    }
});

// Endpoint para buscar pacotes de um cliente específico
app.get('/api/clientes/:id/pacotes', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT cp.*, p.nome as pacote_nome, p.numero_sessoes as total_sessoes, p.valor as pacote_valor, s.nome as servico_nome
            FROM cliente_pacotes cp
            LEFT JOIN pacotes p ON cp.pacote_id = p.id
            LEFT JOIN servicos s ON p.servico_id = s.id
            WHERE cp.cliente_id = $1
            ORDER BY cp.data_criacao DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pacotes do cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar pacotes do cliente' });
    }
});

// Endpoint para adicionar pacote a um cliente (para ficha)
app.post('/api/clientes/:id/pacotes', async (req, res) => {
    try {
        const { id } = req.params;
        const { pacoteId, observacoes } = req.body;
        
        // Buscar informações do pacote para obter número de sessões
        const pacoteResult = await pool.query(
            'SELECT numero_sessoes FROM pacotes WHERE id = $1',
            [pacoteId]
        );
        
        if (pacoteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pacote não encontrado' });
        }
        
        const numeroSessoes = pacoteResult.rows[0].numero_sessoes;
        
        const result = await pool.query(`
            INSERT INTO cliente_pacotes (cliente_id, pacote_id, sessoes_restantes, observacoes, status)
            VALUES ($1, $2, $3, $4, 'Ativo')
            RETURNING *
        `, [id, pacoteId, numeroSessoes, observacoes || null]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao vincular pacote ao cliente:', error);
        res.status(500).json({ error: 'Erro ao vincular pacote ao cliente' });
    }
});

// Endpoint para decrementar sessões restantes de um pacote
app.put('/api/cliente_pacotes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { decrementar } = req.body;
        
        if (decrementar) {
            const result = await pool.query(
                'UPDATE cliente_pacotes SET sessoes_restantes = sessoes_restantes - 1 WHERE id = $1 AND sessoes_restantes > 0 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Não há sessões restantes ou pacote não encontrado' });
            }
            
            // Se não houver mais sessões, marcar como concluído
            if (result.rows[0].sessoes_restantes === 0) {
                await pool.query(
                    'UPDATE cliente_pacotes SET status = $1 WHERE id = $2',
                    ['Concluído', id]
                );
                result.rows[0].status = 'Concluído';
            }
            
            res.json(result.rows[0]);
        } else {
            res.status(400).json({ error: 'Operação inválida' });
        }
    } catch (error) {
        console.error('Erro ao atualizar pacote:', error);
        res.status(500).json({ error: 'Erro ao atualizar pacote' });
    }
});

// Rotas de Planos
app.get('/api/clientes/:clienteId/planos', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const result = await pool.query(
            'SELECT * FROM planos WHERE cliente_id = $1 ORDER BY data_criacao DESC',
            [clienteId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar planos:', error);
        res.status(500).json({ error: 'Erro ao buscar planos' });
    }
});

app.post('/api/planos', async (req, res) => {
    try {
        const plano = req.body;
        
        // Ajustar datas para fuso horário de Brasília (UTC-3)
        const ajustarData = (data) => {
            if (!data) return null;
            const dataObj = new Date(data);
            if (isNaN(dataObj.getTime())) return data;
            const offsetBrasil = 3 * 60 * 60 * 1000;
            const dataUTC = dataObj.getTime() + offsetBrasil;
            return new Date(dataUTC).toISOString().split('T')[0];
        };
        
        const dataInicio = ajustarData(plano.dataInicio);
        const dataFim = ajustarData(plano.dataFim);
        
        const result = await pool.query(`
            INSERT INTO planos (cliente_id, plano_id, nome_plano, data_inicio, data_fim, duracao_meses, preco, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            plano.clienteId, plano.planoId, plano.nomePlano, dataInicio,
            dataFim, plano.duracao, plano.preco, plano.observacoes
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar plano:', error);
        res.status(500).json({ error: 'Erro ao criar plano' });
    }
});

// Rota para executar o schema (manual)
app.post('/api/database/init', async (req, res) => {
    try {
        const fs = require('fs');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await pool.query(schema);
        res.json({ success: true, message: 'Schema inicializado com sucesso' });
    } catch (error) {
        console.error('Erro ao inicializar schema:', error);
        res.status(500).json({ error: 'Erro ao inicializar schema' });
    }
});

// Rota para a página principal (SPA) - DEVE SER A ÚLTIMA ROTA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database URL: ${process.env.DATABASE_URL ? 'Configurada' : 'NÃO configurada'}`);
});
