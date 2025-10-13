# Sistema de Simulação de Fluxo de Potência

## Descrição
Sistema web para simulação de fluxo de potência utilizando pandapower.

## Estrutura do Projeto
```
SIP/
├── backend/         # API FastAPI
├── frontend/        # Interface Next.js
├── data/           # Casos de teste MATPOWER
└── docker-compose.yml
```

## Requisitos
- Docker
- Docker Compose

## Como Executar

1. Clone o repositório:
```bash
git clone <repository-url>
cd SIP
```

2. Inicie os containers:
```bash
docker-compose up --build
```

3. Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Desenvolvimento

Para desenvolvimento local com hot-reload:
```bash
docker-compose up
```

## Testes

Para executar os testes do backend:
```bash
docker-compose exec backend pytest
```