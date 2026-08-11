# Configuração de Banco de Dados Render - Passo a Passo

## Situação Atual
Você já usa o Render, então vamos configurar o PostgreSQL do Render para o sistema.

## Passo 1: Criar PostgreSQL no Render

### Se você já tem um PostgreSQL no Render:

1. Acesse seu dashboard do Render: https://dashboard.render.com
2. Encontre seu serviço PostgreSQL existente
3. Clique no serviço
4. Vá para a aba **Info**
5. Copie a **Internal Database URL**

### Se você NÃO tem PostgreSQL no Render:

1. Acesse: https://dashboard.render.com
2. Clique em **New** > **PostgreSQL**
3. Preencha:
   - **Name:** `clinica-estetica-db`
   - **Database:** `clinica_estetica`
   - **User:** `clinica_user`
   - **Region:** São Paulo (ou mais próximo)
4. Clique em **Create PostgreSQL Database**
5. Aguarde 1-2 minutos para criação

## Passo 2: Obter URL de Conexão

1. No serviço PostgreSQL do Render, clique na aba **Info**
2. Encontre a seção **Connections**
3. Copie a **Internal Database URL**
4. A URL será algo como:
   ```
   postgresql://clinica_user:[senha]@[host].a.render.com:5432/clinica_estetica
   ```

## Passo 3: Configurar Arquivo .env

1. Na pasta do projeto, crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e cole a URL do Render:
   ```
   DATABASE_URL=postgresql://clinica_user:[SUA_SENHA]@[HOST].a.render.com:5432/clinica_estetica
   PORT=3000
   NODE_ENV=production
   ```

**IMPORTANTE:** Substitua `[SUA_SENHA]` e `[HOST]` pelos valores reais da URL que você copiou.

## Passo 4: Instalar Dependência

No terminal, na pasta do projeto:

```bash
npm install dotenv
```

## Passo 5: Iniciar o Servidor Local

```bash
npm start
```

Você deve ver:
```
Conectado ao PostgreSQL
Banco de dados inicializado com sucesso
Servidor rodando na porta 3000
```

## Passo 6: Testar no Browser

1. Acesse: http://localhost:3000
2. Faça login
3. Cadastre um cliente
4. Verifique se salvou no banco

## Passo 7: Configurar Acesso Remoto

### No seu computador principal:

1. O arquivo `.env` já está configurado
2. Sistema funcionando localmente

### Em outro computador:

1. Clone o repositório
2. Instale dependências: `npm install`
3. Crie arquivo `.env` com a MESMA URL do Render
4. Inicie: `npm start`
5. Acesse o sistema - você verá os MESMOS dados!

## Passo 8: Migrar Dados Existentes (Opcional)

Se você já tem dados locais e quer migrar para o Render:

### Via Dashboard do Render:

1. No serviço PostgreSQL do Render
2. Vá para a aba **Query**
3. Você pode executar comandos SQL aqui
4. Copie seus dados locais e cole como INSERTs

### Via pgAdmin (mais completo):

1. Conecte ao banco local
2. Exporte os dados (Tools > Backup)
3. Conecte ao banco do Render
4. Importe os dados

## Passo 9: Deploy Automático no Render (Opcional)

Se você quer que o sistema rode automaticamente no Render:

### Criar Web Service no Render:

1. No dashboard do Render, clique em **New** > **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name:** `clinica-estetica-api`
   - **Branch:** `main`
   - **Root Directory:** `.` (ou a pasta do projeto)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### Configurar Variáveis de Ambiente:

1. No Web Service, vá para **Environment**
2. Adicione as variáveis:
   - `DATABASE_URL` = (sua URL do PostgreSQL do Render)
   - `PORT` = `3000`
   - `NODE_ENV` = `production`

3. Clique em **Save Changes**
4. O deploy acontecerá automaticamente

## Passo 10: Acessar Sistema Deployado

Depois do deploy, você terá uma URL como:
```
https://clinica-estetica-api.onrender.com
```

Acesse essa URL de qualquer computador e você verá o sistema funcionando com os mesmos dados!

## Verificação

### Testar conexão local:

```bash
npm start
```

### Testar conexão remota:

Em outro computador:
```bash
git clone [seu-repositorio]
cd sistema-clinica
npm install
# Criar .env com a MESMA URL
npm start
```

## Benefícios do Render

✅ **Já está usando** - familiaridade com a plataforma  
✅ **90 dias grátis** - tempo generoso para testes  
✅ **Dashboard fácil** - interface intuitiva  
✅ **Auto-deploy** - atualizações automáticas do GitHub  
✅ **SSL grátis** - conexão segura automática  
✅ **Backup automático** - render faz backups  
✅ **Região São Paulo** - baixa latência no Brasil  

## Solução de Problemas

### Erro: "connection refused"

- Verifique se a URL está correta
- Verifique se o serviço PostgreSQL está ativo no Render
- Verifique se a senha está correta

### Erro: "database does not exist"

- O sistema cria automaticamente, mas verifique o nome do banco
- No Render, o nome padrão é o que você definiu na criação

### Erro: "certificate has expired"

- No `server.js`, a configuração SSL já está correta
- Não precisa mudar nada

### Servidor PostgreSQL parou no Render:

- Vá ao dashboard do Render
- Verifique se o serviço está ativo
- Se necessário, reinicie o serviço

## Limitações do Plano Gratuito Render

- **90 dias** de PostgreSQL gratuito
- Após 90 dias: $7/mês
- **750 horas** de Web Service gratuito por mês
- **512MB RAM** - suficiente para este sistema

## Próximos Passos

1. ✅ Criar/verificar PostgreSQL no Render
2. ✅ Copiar Internal Database URL
3. ✅ Criar arquivo `.env` com a URL
4. ✅ Instalar `dotenv`
5. ✅ Testar localmente
6. ✅ Testar em outro computador
7. ✅ (Opcional) Migrar dados existentes
8. ✅ (Opcional) Deploy automático no Render

## Suporte Render

- Documentação: https://render.com/docs
- Status: https://status.render.com
- Suporte: support@render.com

## Dicas Importantes

- **Mantenha a URL segura** - não compartilhe publicamente
- **Backup manual** - ocasionalmente exporte dados
- **Monitorar uso** - acompanne os 90 dias grátis
- **Atualizar antes do vencimento** - renovar ou mudar plano