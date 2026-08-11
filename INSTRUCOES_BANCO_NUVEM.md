# Configuração de Banco de Dados em Nuvem - Guia Rápido

## Problema Atual
O banco de dados está local, então cada computador tem seus próprios dados separados.

## Solução
Migrar para PostgreSQL em nuvem para acessar os mesmos dados de qualquer lugar.

## Passo 1: Instalar Dependências

No terminal, na pasta do projeto:

```bash
npm install dotenv
```

## Passo 2: Criar Conta no Supabase (Gratuito)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Crie uma conta (GitHub/Google)
4. Clique em "New Project"
5. Preencha:
   - **Name:** `clinica-estetica`
   - **Database Password:** (crie uma senha forte e anote!)
   - **Region:** South America (São Paulo)
6. Clique em "Create new project"
7. Aguarde 1-2 minutos

## Passo 3: Obter URL do Banco

1. No projeto Supabase, vá em **Settings** > **Database**
2. Encontre a seção **Connection string**
3. Copie a URI que começa com `postgresql://`
4. A URL será algo como:
   ```
   postgresql://postgres:[SUA_SENHA]@db.[PROJETO].supabase.co:5432/postgres
   ```

## Passo 4: Configurar Arquivo .env

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e cole a URL:
   ```
   DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.[PROJETO].supabase.co:5432/postgres
   PORT=3000
   NODE_ENV=production
   ```

**IMPORTANTE:** Substitua `[SUA_SENHA]` pela senha que você criou no passo 2.

## Passo 5: Iniciar o Servidor

```bash
npm start
```

Você deve ver:
```
Conectado ao PostgreSQL
Banco de dados inicializado com sucesso
Servidor rodando na porta 3000
```

## Passo 6: Testar Acesso Remoto

1. Em outro computador, clone o repositório
2. Instale as dependências: `npm install`
3. Crie o arquivo `.env` com a MESMA URL do banco
4. Inicie o servidor: `npm start`
5. Acesse o sistema - você verá os MESMOS dados!

## Migrar Dados Existentes

Se você já tem dados locais e quer migrar:

### Opção A: Manual (mais simples)

1. Abra o dashboard do Supabase
2. Vá em **SQL Editor**
3. Cole e execute os INSERTs com seus dados existentes

### Opção B: Via ferramenta de backup

Use pgAdmin ou similar para exportar/importar.

## Outras Opções de Banco em Nuvem

### Railway
- https://railway.app
- Crie: New Project > Provision PostgreSQL
- Copie DATABASE_URL do dashboard

### Render
- https://render.com
- Crie: New > PostgreSQL
- Copie Internal Database URL

### Neon
- https://neon.tech
- PostgreSQL serverless gratuito
- Interface moderna

## Verificação

Depois de configurar, teste:

```bash
# Verificar se o .env existe
cat .env

# Verificar se o servidor conecta
npm start
```

## Solução de Problemas

### Erro: "MODULE_NOT_FOUND: dotenv"
```bash
npm install dotenv
```

### Erro: "connection refused"
- Verifique se a URL está correta
- Verifique se o projeto Supabase está ativo
- Verifique a senha

### Erro: "certificate has expired"
No `server.js`, a configuração já está correta com SSL.

## Segurança

- **NUNCA** commitar o arquivo `.env` no Git
- O `.env` já está no `.gitignore`
- Use senhas fortes
- Não compartilhe URLs de banco publicamente

## Benefícios

✅ **Acesso de qualquer lugar** - mesmo dados em qualquer computador
✅ **Backup automático** - Supabase faz backup
✅ **Escalabilidade** - cresce conforme necessário
✅ **Colaboração** - múltiplos usuários podem acessar
✅ **Gratuito** - plano gratuito generoso (500MB)

## Próximos Passos

1. Configurar Supabase
2. Criar arquivo `.env`
3. Testar em um computador
4. Testar em outro computador
5. Migrar dados existentes (se houver)
6. Usar o sistema normalmente!