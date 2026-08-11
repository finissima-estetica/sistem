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
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página principal (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuração do PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Configurar fuso horário para Brasília (UTC-3)
    timezone: 'America/Sao_Paulo'
});

// Testar conexão com o banco
pool.on('connect', () => {
    console.log('Conectado ao PostgreSQL');
    initializeDatabase();
});

pool.on('error', (err) => {
    console.error('Erro na conexão com PostgreSQL:', err);
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
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
            );
        `);
        
        if (tablesCheck.rows[0].exists) {
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
            cliente.nome, cliente.cpf, cliente.dataNascimento, cliente.telefone, cliente.email,
            cliente.endereco, cliente.cidade, cliente.estado, cliente.doencasCronicas,
            cliente.medicamentos, cliente.cirurgias, cliente.alergias, cliente.sensibilidade,
            cliente.fumante, cliente.alcool, cliente.atividadeFisica, cliente.detalhesProcedimentos,
            cliente.objetivos, cliente.peso, cliente.altura, cliente.bracoDireito,
            cliente.bracoEsquerdo, cliente.torax, cliente.cintura, cliente.abdomen,
            cliente.quadril, cliente.coxaDireita, cliente.coxaEsquerda,
            cliente.panturrilhaDireita, cliente.panturrilhaEsquerda
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
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
        
        // Ajustar data para fuso horário de Brasília (UTC-3)
        let dataAtendimento = atendimento.data;
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
        
        const result = await pool.query(`
            INSERT INTO atendimentos (
                cliente_id, plano_id, data_atendimento, tipo_atendimento, observacoes,
                peso, braco_direito, braco_esquerdo, torax, cintura, abdomen,
                quadril, coxa_direita, coxa_esquerda
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `, [
            atendimento.clienteId, atendimento.planoId, dataAtendimento,
            atendimento.tipo, atendimento.observacoes, atendimento.peso,
            atendimento.bracoDireito, atendimento.bracoEsquerdo, atendimento.torax,
            atendimento.cintura, atendimento.abdomen, atendimento.quadril,
            atendimento.coxaDireita, atendimento.coxaEsquerda
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar atendimento:', error);
        res.status(500).json({ error: 'Erro ao criar atendimento' });
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

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: pool.totalCount > 0 ? 'connected' : 'disconnected' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});