# Backend - SISEP (Simulador Interativo de Sistemas Elétricos de Potência)

API robusta construída com FastAPI para simulação de sistemas elétricos de potência utilizando MATPOWER.

## 🚀 Funcionalidades

### 🔌 Simulação de Fluxo de Potência
- **Processamento Pandapower**: Análise de casos elétricos padrão (.m files)
- **Validação de Dados**: Verificação automática de parâmetros elétricos
- **Múltiplos Casos**: Suporte a diferentes sistemas (3, 5, 9, 14 barras)
- **Resultados Detalhados**: Tensões, fluxos de potência e perdas

### 📊 API RESTful
- **Endpoints Documentados**: Swagger UI automático
- **Modelos Pydantic**: Validação robusta de entrada e saída
- **Tratamento de Erros**: Respostas padronizadas para diferentes cenários
- **CORS Configurado**: Integração completa com frontend

## 🛠️ Tecnologias

- **FastAPI**: Framework web moderno e de alta performance
- **Pandapower**: Simulação de sistemas elétricos
- **Pydantic**: Validação e serialização de dados
- **Pytest**: Framework de testes automatizados
- **Uvicorn**: Servidor ASGI de produção

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── models/              # Modelos de dados Pydantic
│   │   ├── power_system_input.py   # Modelos de entrada
│   │   └── power_system_results.py # Modelos de resultado
│   ├── routes/              # Rotas da API
│   │   └── simulation_routes.py    # Endpoints de simulação
│   └── services/            # Lógica de negócio
│       └── matpower_service.py     # Interface com MATPOWER
├── data/                    # Casos MATPOWER
│   ├── case3p.m            # Sistema de 3 barras
│   ├── case5.m             # Sistema de 5 barras
│   ├── case9.m             # Sistema IEEE 9 barras
│   └── case14.m            # Sistema IEEE 14 barras
├── tests/                   # Testes automatizados
│   └── test_simulation.py   # Testes da API
├── requirements.txt         # Dependências Python
├── pytest.ini             # Configuração do pytest
├── Dockerfile              # Container Docker
└── README.md               # Este arquivo
```

## ⚡ Como Executar

### 🐳 Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up backend
```

### 🔧 Desenvolvimento Local

1. **Crie um ambiente virtual:**
```bash
cd backend
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Execute o servidor:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 🌐 Acesso às Aplicações

- **API**: [http://localhost:8000](http://localhost:8000)
- **Documentação**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 📋 Endpoints da API

### `POST /simular`
Executa simulação de fluxo de potência.

**Exemplo de Request:**
```json
{
  "baseMVA": 100,
  "buses": [
    {
      "id": 1,
      "type": 3,
      "Pd": 0.0,
      "Qd": 0.0,
      "Vm": 1.05,
      "Va": 0.0,
      "baseKV": 230
    },
    {
      "id": 2,
      "type": 1,
      "Pd": 40.0,
      "Qd": 20.0,
      "Vm": 1.0,
      "Va": 0.0,
      "baseKV": 230
    }
  ],
  "generators": [
    {
      "bus": 1,
      "Pg": 30.0,
      "Qg": 0.0,
      "Vg": 1.05,
      "Pmax": 100.0,
      "Pmin": 0.0
    }
  ],
  "lines": [
    {
      "from_bus": 1,
      "to_bus": 2,
      "r": 0.01,
      "x": 0.06,
      "b": 0.03,
      "rateA": 250
    }
  ]
}
```

**Exemplo de Response:**
```json
{
  "success": true,
  "converged": true,
  "iterations": 3,
  "buses": [
    {
      "id": 1,
      "Vm": 1.05,
      "Va": 0.0,
      "Pg": 30.0,
      "Qg": 15.2
    }
  ],
  "lines": [
    {
      "from_bus": 1,
      "to_bus": 2,
      "Pf": 25.0,
      "Qf": 12.5,
      "losses": 0.5
    }
  ],
  "total_generation": 30.0,
  "total_load": 40.0,
  "total_losses": 0.5
}
```

## 🧪 Testes

### Executar Testes
```bash
# Com Docker
docker-compose exec backend pytest

# Desenvolvimento local
pytest

# Com cobertura
pytest --cov=app --cov-report=html
```

### Estrutura de Testes
- **test_simulation.py**: Testes dos endpoints de simulação
- **Fixtures**: Dados de teste padronizados
- **Mocks**: Simulação de serviços externos

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente
```bash
# .env (opcional)
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
API_V1_STR="/api/v1"
```

### Dependências de Desenvolvimento
```bash
# Instalar dependências extras
pip install -r requirements-dev.txt

# Ou individualmente
pip install pytest pytest-asyncio pytest-cov black flake8
```

### Formatação de Código
```bash
# Formatação automática
black app/ tests/

# Linting
flake8 app/ tests/
```

## 📦 Deploy

### Docker Production
```bash
# Build da imagem
docker build -t sifp-backend .

# Executar container
docker run -p 8000:8000 sifp-backend
```

### Variáveis de Produção
- `DEBUG=False`
- `CORS_ORIGINS`: Lista de origens permitidas
- `SECRET_KEY`: Chave secreta para autenticação (se implementada)

## 🐛 Troubleshooting

### Problemas Comuns

1. **MATPOWER não encontrado:**
   - Verifique se o MATLAB/Octave está instalado
   - Configure o PATH corretamente

2. **Erro de CORS:**
   - Verifique as configurações de CORS no `main.py`
   - Confirme a origem do frontend

3. **Dependências:**
   - Use Python >= 3.9
   - Reinstale requirements: `pip install -r requirements.txt --force-reinstall`

### Logs de Debug
```bash
# Docker logs
docker-compose logs backend -f

# Local logs
uvicorn app.main:app --reload --log-level debug
```

## 🤝 Contribuição

1. Siga o padrão de código (Black + Flake8)
2. Adicione testes para novas funcionalidades
3. Atualize a documentação
4. Verifique se todos os testes passam

## 📚 Recursos Adicionais

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MATPOWER Documentation](https://matpower.org/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [Pytest Documentation](https://docs.pytest.org/)

---