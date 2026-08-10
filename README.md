# Sistema Clínica Estética

Sistema web de acompanhamento para clínica de estética com login e dashboard.

## Funcionalidades

- Sistema de login com autenticação
- Dashboard com estatísticas e ações rápidas
- Design responsivo (funciona em celular e PC)
- Persistência de sessão usando localStorage

## Credenciais de Teste

- **Administrador**: `admin@clinica.com` / `admin123`
- **Usuário**: `usuario@clinica.com` / `usuario123`

## Estrutura do Projeto

```
sistema-clinica/
├── public/
│   ├── index.html    # Página principal com login e dashboard
│   ├── styles.css    # Estilos responsivos
│   └── auth.js       # Lógica de autenticação
├── render.yaml       # Configuração do Render
├── README.md         # Este arquivo
└── .gitignore        # Arquivos ignorados pelo Git
```

## Deploy no Render

### Pré-requisitos

1. Tenha uma conta no [Render.com](https://render.com)
2. Tenha um repositório Git (GitHub, GitLab, etc.)

### Passo a Passo

1. **Prepare seu repositório Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Configure no Render:**
   - Acesse [render.com](https://render.com)
   - Clique em "New +" e selecione "Static Site"
   - Conecte seu repositório Git
   - Configure:
     - **Name**: sistema-clinica-estetica
     - **Branch**: main
     - **Root Directory**: (deixe vazio)
     - **Publish Directory**: public
     - **Build Command**: (deixe vazio)
   - Clique em "Create Static Site"

3. **Aguardar Deploy:**
   - O Render fará o deploy automaticamente
   - Você receberá uma URL pública do seu site
   - O processo geralmente leva 1-2 minutos

### Configuração Alternativa (render.yaml)

O projeto inclui um arquivo `render.yaml` que automatiza a configuração. O Render detectará este arquivo automaticamente e configurará o deploy.

## Teste Local

Para testar localmente antes do deploy:

1. Abra o arquivo `public/index.html` diretamente no navegador
2. Ou use um servidor simples:
   ```bash
   # Usando Python (se disponível)
   python -m http.server 8080 --directory public
   
   # Usando Node.js (se disponível)
   npx http-server public -p 8080
   ```

## Funcionalidades Futuras

- Cadastro de clientes
- Registro de tratamentos
- Histórico de acompanhamento
- Agendamento de consultas
- Relatórios e estatísticas
- Integração com banco de dados real
- Sistema de backup

## Tecnologias Utilizadas

- HTML5
- CSS3 (com design responsivo)
- JavaScript (Vanilla)
- Render (hospedagem)

## Suporte

Para suporte, entre em contato com o desenvolvedor do projeto.
