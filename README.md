# Exemplo de Autenticação usando JWT com Node.js e React

> Exemplo completo de um sistema de autenticação usando JWT (JSON Web Tokens) com Node.js no backend e React no frontend.

## 📋 Características

- **Backend (Node.js + Express)**
  - Autenticação via JWT
  - Hash de senhas com bcrypt
  - API RESTful documentada com Swagger
  - Banco de dados PostgreSQL
  - Transações ACID
  - Middleware de autenticação

- **Frontend (React + Vite)**
  - Interface baseada em Bulma CSS
  - Gerenciamento de estado de autenticação
  - Proteção de rotas
  - Formulários de login e cadastro
  - Sistema de mensagens privadas

## 🚀 Começando

### Pré-requisitos

- Docker

### 🐳 Rodando com Docker

1. Clone o repositório:
```bash
git clone https://github.com/Trojahn/exemplo_autenticacao_jwt.git
cd exemplo_autenticacao_jwt
```

2. Inicie os containers:
```bash
docker-compose up --build
```

3. Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Documentação API: http://localhost:3000/docs

## 📚 Documentação

A documentação completa da API está disponível em:
- Swagger UI: http://localhost:3000/docs
- Documentação do código fonte nos respectivos diretórios


## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
