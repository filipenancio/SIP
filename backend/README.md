# Backend - SISEP (Simulador Interativo de Sistemas Elétricos de Potência)

API robusta construída com FastAPI para simulação de sistemas elétricos de potência utilizando Pandapower.

## 🚀 Funcionalidades

### 🔌 Simulação de Fluxo de Potência
- **Processamento Pandapower**: Análise de casos elétricos padrão (formato MATPOWER .m)
- **Suporte a Transformadores**: Conversão automática de transformadores para formato LineResult
- **Validação de baseKV**: Correção automática de valores zerados (baseKV=0 → 230 kV)
- **Múltiplos Casos**: Suporte a diferentes sistemas (3, 4, 5, 6, 9, 14 barras)
- **Resultados Detalhados**: Tensões, fluxos de potência, perdas e capacidades
- **Modo Debug Configurável**: Flag `DEBUG_ENABLED` para controlar logs de depuração

### 📊 API RESTful
- **Endpoints Documentados**: Swagger UI e ReDoc automáticos
- **Modelos Pydantic**: Validação robusta de entrada e saída
- **Tratamento de Erros**: Respostas padronizadas para diferentes cenários
- **CORS Configurado**: Integração completa com frontend
- **Upload de Arquivos**: Suporte a upload de arquivos MATPOWER customizados

## 🛠️ Tecnologias

- **FastAPI**: Framework web moderno e de alta performance
- **Pandapower**: Simulação de sistemas elétricos de potência
- **Pydantic**: Validação e serialização de dados
- **Pytest**: Framework de testes automatizados
- **Uvicorn**: Servidor ASGI de produção
- **NumPy & Pandas**: Processamento de dados numéricos
- **httpx**: Cliente HTTP para testes

## 🔧 Configuração de Debug

O backend possui um sistema de debug configurável via flag no código:

```python
# backend/app/services/matpower_service.py
class MatpowerService:
    DEBUG_ENABLED = False  # True para ativar logs de debug
```

**Logs de Debug incluem:**
- Criação e conversão de redes Pandapower
- Correção de baseKV zerado
- Conversão de transformadores para linhas
- Detalhes de barras, linhas, geradores e cargas
- Erros e exceções durante simulação

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── models/              # Modelos de dados Pydantic
│   │   └── power_system_results.py # Modelos de resultado
│   ├── routes/              # Rotas da API
│   │   └── simulation_routes.py    # Endpoints de simulação
│   └── services/            # Lógica de negócio
│       └── matpower_service.py     # Serviço de simulação
├── data/                    # Casos de teste (formato MATPOWER)
│   ├── case3p.m            # Sistema de 3 barras
│   ├── case4gs.m           # Sistema de 4 barras
│   ├── case5.m             # Sistema de 5 barras
│   ├── case6ww.m           # Sistema de 6 barras
│   ├── case9.m             # Sistema IEEE 9 barras
│   └── case14.m            # Sistema IEEE 14 barras
├── tests/                   # Testes automatizados
│   └── test_simulation.py   # Testes da API
├── requirements.txt         # Dependências Python (8 pacotes)
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

### `GET /sisep/matpower/files`
Lista todos os arquivos MATPOWER disponíveis no sistema.

**Response:**
```json
[
  "case3p.m",
  "case4gs.m",
  "case5.m",
  "case6ww.m",
  "case9.m",
  "case14.m"
]
```

### `GET /sisep/matpower/{filename}`
Simula um sistema a partir de um arquivo MATPOWER pré-carregado.

**Parâmetros:**
- `filename`: Nome do arquivo (ex: case3p.m, case9.m)

**Response:**
```json
{
  "buses": [
    {
      "bus_id": 0,
      "vm_pu": 1.05,
      "va_degree": 0.0,
      "p_mw": 30.5,
      "q_mvar": 15.2
    }
  ],
  "lines": [
    {
      "from_bus": 0,
      "to_bus": 1,
      "p_from_mw": 25.0,
      "q_from_mvar": 12.5,
      "p_to_mw": -24.5,
      "q_to_mvar": -12.0,
      "pl_mw": 0.5,
      "ql_mvar": 0.5,
      "i_from_ka": 0.123,
      "i_to_ka": 0.122,
      "i_ka": 0.123,
      "vm_from_pu": 1.05,
      "va_from_degree": 0.0,
      "vm_to_pu": 1.03,
      "va_to_degree": -2.5,
      "loading_percent": 45.2,
      "in_service": true
    }
  ],
  "generators": [...],
  "loads": [...],
  "ext_grid": {...},
  "genCapacityP": 150.0,
  "genCapacityQmin": -50.0,
  "genCapacityQmax": 100.0,
  "loadSystemP": 65.0,
  "loadSystemQ": 35.0
}
```

**Observação:** O campo `lines` inclui tanto linhas de transmissão quanto transformadores. Os transformadores são automaticamente convertidos para o formato `LineResult` usando as barras de alta e baixa tensão (hv_bus → from_bus, lv_bus → to_bus).

### `POST /sisep/simulate/matpower/upload`
Simula um sistema a partir de um arquivo MATPOWER enviado.

**Body:** `multipart/form-data`
- `file`: Arquivo .m no formato MATPOWER

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
  - Teste de simulação com arquivo pré-carregado
  - Teste de upload de arquivo
  - Validação de resultados e tensões

## 🔧 Configuração de Desenvolvimento

### Dependências de Produção
```bash
# requirements.txt (8 pacotes essenciais)
fastapi
uvicorn
pandas
numpy
pydantic
pandapower
pytest
httpx
```

## 📦 Deploy

### Docker
```bash
# Via docker-compose (recomendado)
docker-compose up backend

# Build manual
docker build -t sisep-backend ./backend

# Executar container
docker run -p 8000:8000 sisep-backend
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro na simulação Pandapower:**
   - Verifique se o arquivo .m está no formato correto MATPOWER
   - Confirme que todos os parâmetros elétricos são válidos
   - Ative o modo debug (`DEBUG_ENABLED = True`) para mais informações

2. **baseKV zerado:**
   - O sistema corrige automaticamente baseKV=0 para 230 kV
   - Ative debug para ver logs de correção

3. **Transformadores não aparecem:**
   - Transformadores são automaticamente convertidos para linhas
   - Verifique o campo `lines` na resposta da API

4. **Erro de CORS:**
   - Verifique as configurações de CORS no `main.py`
   - Confirme se o frontend está em http://localhost:3000

5. **Dependências:**
   - Use Python >= 3.9
   - Reinstale: `pip install -r requirements.txt --force-reinstall`

### Logs de Debug
```bash
# Ativar debug no código
# backend/app/services/matpower_service.py
DEBUG_ENABLED = True

# Docker logs
docker-compose logs backend -f

# Local logs
uvicorn app.main:app --reload --log-level debug
```

## 🤝 Contribuição

1. Siga as convenções de código Python (PEP 8)
2. Adicione testes para novas funcionalidades
3. Atualize a documentação quando necessário
4. Verifique se todos os testes passam antes do commit

## 📚 Recursos Adicionais

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pandapower Documentation](https://pandapower.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Pytest Documentation](https://docs.pytest.org/)

---