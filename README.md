# Sistema Clínica Estética

Sistema web de acompanhamento para clínica de estética com login, dashboard, ficha de clientes e integração com banco de dados PostgreSQL.

## Funcionalidades

- Sistema de login com autenticação
- Dashboard com lista de clientes e pesquisa
- Cadastro completo de clientes em 5 etapas
- Ficha de cliente com histórico de atendimentos
- Sistema de planos (6 meses para cada procedimento)
- Análise de desempenho com evolução de medidas
- Design responsivo (funciona em celular e PC)
- Integração com PostgreSQL via API Node.js
- Fallback para localStorage quando API não disponível

## Credenciais de Teste

- **Administrador**: `admin@clinica.com` / `admin123`
- **Usuário**: `usuario@clinica.com` / `usuario123`

## Estrutura do Projeto

```
sistema-clinica/
├── public/
│   ├── index.html       # Página principal com login e dashboard
│   ├── cadastro.html    # Formulário de cadastro em 5 etapas
│   ├── ficha.html       # Ficha completa do cliente
│   ├── styles.css       # Estilos responsivos
│   ├── auth.js          # Lógica de autenticação
│   ├── cadastro.js      # Lógica do cadastro
│   ├── ficha.js         # Lógica da ficha do cliente
│   └── api.js          # Cliente API para comunicação com backend
├── database/
│   └── schema.sql       # Schema do banco de dados PostgreSQL
├── server.js            # API Node.js com Express
├── package.json         # Dependências do Node.js
├── render.yaml          # Configuração do Render
├── README.md            # Este arquivo
└── .gitignore           # Arquivos ignorados pelo Git
```

## Banco de Dados

O sistema utiliza PostgreSQL hospedado no Render. O schema inclui:

- **clientes**: Dados pessoais, anamnese e medidas iniciais
- **atendimentos**: Histórico de atendimentos com medidas atualizadas
- **planos**: Planos vinculados aos clientes
- **usuarios**: Sistema de autenticação

## Deploy no Render

### Configuração Automática

O arquivo `render.yaml` configura automaticamente:
- **Web Service**: Aplicação Node.js com Express
- **PostgreSQL Database**: Banco de dados gratuito
- **Variáveis de Ambiente**: Configuradas automaticamente

### Passo a Passo

1. **Prepare seu repositório Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistema Clínica Estética"
   git remote add origin https://github.com/finissima-estetica/sistem.git
   git branch -M main
   git push -u origin main
   ```

2. **Configure no Render:**
   - Acesse [render.com](https://render.com)
   - Clique em "New +"
   - Selecione "Blueprint" ou use o `render.yaml` existente
   - Conecte seu repositório Git
   - O Render detectará automaticamente a configuração
   - Clique em "Create Web Service"

3. **Inicializar o Banco de Dados:**
   - Após o deploy, acesse o endpoint `/api/database/init`
   - Isso criará as tabelas necessárias
   - Ou execute manualmente o arquivo `database/schema.sql`

4. **Acessar o site:**
   - Após o sucesso, acesse a URL fornecida pelo Render

## Desenvolvimento Local

### Pré-requisitos

- Node.js (>= 14.0.0)
- PostgreSQL (opcional, para desenvolvimento local)

### Instalação

```bash
npm install
```

### Executar Localmente

```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

### Variáveis de Ambiente

- `DATABASE_URL`: String de conexão PostgreSQL (configurada automaticamente no Render)
- `PORT`: Porta do servidor (padrão: 3000)

## Funcionalidades Implementadas

### Dashboard
- Lista de clientes com status de plano
- Barra de pesquisa por nome, email, telefone ou CPF
- Botão para cadastrar novos clientes
- Badges indicando clientes com plano ativo

### Cadastro de Clientes (5 Etapas)
1. **Dados Pessoais**: Nome, CPF, contato, endereço
2. **Anamnese**: Histórico médico, alergias, hábitos
3. **Medidas Corporais**: Peso, altura e medidas detalhadas
4. **Procedimentos**: Seleção múltipla de tratamentos
5. **Termo de Responsabilidade**: Aceite obrigatório

### Ficha do Cliente (4 Abas)
1. **Histórico de Atendimentos**: Lista completa com medidas
2. **Desempenho**: Análise de evolução com gráficos
3. **Planos**: Gestão de planos vinculados
4. **Dados Completos**: Visualização de todas as informações

### Sistema de Planos
- 10 planos disponíveis (6 meses cada)
- Vinculação no cadastro ou na ficha
- Distinção entre atendimentos de plano e únicos
- Controle automático de validade

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL
- **Hospedagem**: Render
- **API**: REST com Express

## Suporte

Para suporte, entre em contato com o desenvolvedor do projeto.
