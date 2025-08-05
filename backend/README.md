# Como Rodar o Backend – SIP (Simulador Interativo de Potência)

Este guia descreve como configurar e executar o backend baseado em FastAPI e pandapower.

---

## ✅ Passos para execução

### 1. Crie e ative um ambiente virtual

```bash
cd backend
python -m venv venv
source venv/bin/activate
```

### 2. Instale as dependências

```bash
pip install -r requirements.txt
```

### 3. Rode o servidor FastAPI

```bash
uvicorn app.main:app --reload
```

A aplicação estará disponível em:

[http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📥 Exemplo de Payload (para testes via Swagger)

```json
{
  "baseMVA": 100,
  "buses": [
    { "id": 1, "Pd": 90, "Qd": 30, "Vm": 138, "Va": 0 },
    { "id": 2, "Pd": 100, "Qd": 35, "Vm": 138, "Va": 0 }
  ],
  "lines": [
    { "from_bus": 1, "to_bus": 2, "r": 0.01, "x": 0.03, "b": 0.001 }
  ]
}
```

Use este JSON para testar o endpoint `/simular` na interface interativa do Swagger UI.

---