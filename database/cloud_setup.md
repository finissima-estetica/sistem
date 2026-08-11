# Configuração de Banco de Dados em Nuvem

## Por que usar banco de dados em nuvem?

Com um banco de dados em nuvem, você pode acessar os mesmos dados de qualquer computador, sem precisar ficar exportando/importando arquivos locais.

## Opções Gratuitas de PostgreSQL em Nuvem

### 1. Supabase (Recomendado - Gratuito)

**Vantagens:**
- Plano gratuito generoso (500MB)
- Interface web fácil de usar
- Real-time database
- Autenticação pronta
- Dashboard completo

**Como configurar:**

1. Acesse https://supabase.com
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - Name: `clinica-estetica`
   - Database Password: (crie uma senha forte)
   - Region: South America (São Paulo)
5. Aguarde a criação (1-2 minutos)
6. Vá em Settings > Database
7. Encontre "Connection string"
8. Copie a URI que começa com `postgresql://`
9. Cole no arquivo `.env` como `DATABASE_URL`

**URL formato:**
```
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres
```

### 2. Railway (Gratuito)

**Vantagens:**
- Interface moderna
- Easy deployment
- Plano gratuito disponível

**Como configurar:**

1. Acesse https://railway.app
2. Crie uma conta
3. Clique em "New Project" > "Provision PostgreSQL"
4. Copie a DATABASE_URL do dashboard
5. Cole no arquivo `.env`

### 3. Render (Gratuito)

**Vantagens:**
- Plano gratuito com 90 dias
- Fácil de configurar
- Bom para testes

**Como configurar:**

1. Acesse https://render.com
2. Crie uma conta
3. Clique em "New" > "PostgreSQL"
4. Copie a Internal Database URL
5. Cole no arquivo `.env`

## Passo a Passo para Configurar

### 1. Copiar o arquivo de exemplo

```bash
cp .env.example .env
```

### 2. Editar o arquivo .env

Abra o arquivo `.env` e substitua a URL do banco de dados escolhido.

### 3. Instalar o pacote dotenv (se não estiver instalado)

```bash
npm install dotenv
```

### 4. Atualizar o server.js para carregar as variáveis de ambiente

Adicione no topo do `server.js`:

```javascript
require('dotenv').config();
```

### 5. Testar a conexão

```bash
node server.js
```

### 6. Inicializar o banco de dados

O sistema vai automaticamente criar as tabelas ao iniciar, se não existirem.

## Migrar Dados Locais para Nuvem

Se você já tem dados locais e quer migrar:

### Usando pg_dump (PostgreSQL)

```bash
# Exportar dados locais
pg_dump nome_do_banco_local > backup.sql

# Importar para nuvem
psql $DATABASE_URL < backup.sql
```

### Ou manualmente através do dashboard

A maioria dos serviços (Supabase, Railway, Render) tem um dashboard SQL onde você pode:
1. Copiar os dados do banco local
2. Colar no editor SQL do dashboard
3. Executar

## Verificação

Depois de configurar, verifique se o servidor conecta:

```bash
node server.js
```

Você deve ver:
```
Conectado ao PostgreSQL
Banco de dados inicializado com sucesso
```

## Solução de Problemas

### Erro: "connection refused"

- Verifique se a URL está correta
- Verifique se o serviço de banco está online
- Verifique se a senha está correta

### Erro: "certificate has expired"

- Adicione `ssl: { rejectUnauthorized: false }` na configuração do Pool

### Erro: "database does not exist"

- O sistema cria automaticamente, mas verifique se tem permissão

## Deploy Automático

Para deploy automático em serviços como Railway ou Render:

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente no painel do serviço
3. Configure `DATABASE_URL` como variável de ambiente
4. Deploy automático acontecerá a cada push

## Segurança

**IMPORTANTE:**
- Nunca commitar o arquivo `.env` no Git
- O `.env` já está no `.gitignore`
- Usar senhas fortes
- Não compartilhar URLs de banco publicamente