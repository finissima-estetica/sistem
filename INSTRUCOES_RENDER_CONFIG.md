# 🚀 INSTRUÇÕES - Criar Web Service no Render

## 🔧 DELETAR SERVIÇO ATUAL:

1. Acesse: https://dashboard.render.com
2. Encontre o serviço `sistema-finissimo`
3. Clique em **Settings**
4. Clique em **Delete Service**
5. Confirme a exclusão

## ✅ CRIAR NOVO WEB SERVICE:

### 1. Iniciar criação:
- Clique em **New** > **Web Service** (NÃO Static Site)
- **Name:** `sistema-finissimo`
- **Environment:** Node
- **Region:** South America (São Paulo)
- **Branch:** `main`
- **Root Directory:** `.` (raiz do projeto)

### 2. Configurar Build & Deploy:
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** Free

### 3. Configurar Environment Variables:
Clique em **Environment** > **Add Environment Variable**:

**Variável 1:**
- Key: `PORT`
- Value: `10000`

**Variável 2:**
- Key: `DATABASE_URL`
- Value: `postgresql://banco_finiisima_user:McwGm9nHxwU7748XqAy7dM4mQlDxz9a@dpg-d9tim06417fc73egtn30-a.oregon-postgres.render.com:5432/banco_finiisima`

**Variável 3:**
- Key: `NODE_ENV`
- Value: `production`

### 4. Criar serviço:
- Clique em **Create Web Service**
- **AGUARDE** o primeiro deploy (2-3 minutos)

## ✅ VERIFICAÇÃO APÓS DEPLOY:

1. **Status do serviço:** Deve ficar **verde**
2. **Logs:** Clique em **Logs** - deve ver:
   ```
   🚀 Servidor rodando na porta 10000
   📡 Ambiente: production
   🗄️  Database URL: Configurada
   ✅ Conectado ao PostgreSQL
   ```
3. **Testar API:** Acesse no navegador:
   - `https://sistema-finissimo.onrender.com/api/health`
   - Deve retornar: `{"status":"ok","database":"connected"}`

## 🧹 LIMPAR LOCALSTORAGE:

1. Abra o navegador onde estava usando o sistema
2. Pressione **F12** (Developer Tools)
3. Vá para aba **Application**
4. Clique em **Local Storage**
5. Clique no domínio do sistema
6. **Delete all** (ou apagar itens específicos)
7. Recarregue a página (**Ctrl + Shift + R**)

## 🎯 RESULTADO ESPERADO:

- ✅ Sistema conecta ao PostgreSQL do Render
- ✅ Rotas API funcionam
- ✅ Clientes salvam no banco em nuvem
- ✅ Sincronização entre dispositivos
- ✅ Não mais localStorage local

## ⚠️ IMPORTANTE:

- **Criar como Web Service (Node)** - NÃO Static Site
- **Start Command:** `node server.js` - ESSENCIAL
- **DATABASE_URL:** Copiar exatamente como está acima
- **Aguardar deploy ficar verde** antes de testar