# Simulador Interativo de Sistema Elétrico de de Potência - SISEP

## Descrição
Sistema web para simulação e visualização interativa de sistemas elétricos de potência. O projeto combina uma interface moderna em Next.js com uma API robusta em FastAPI, utilizando o Pandapower para análise de fluxo de potência.

## Funcionalidades

### 🔋 Interface Interativa
- **Diagrama SVG Interativo**: Visualização do sistema de 3 barras com pan, zoom e edição
- **Edição de Parâmetros**: Clique nos elementos (barras, geradores, linhas) para editar valores
- **Gerenciamento de Geradores**: Sistema inteligente para adicionar/remover geradores
- **Tooltips Informativos**: Hover sobre elementos para ver informações detalhadas
- **Sistema de Restauração**: Restaure elementos individuais ou todo o sistema aos valores originais

### ⚡ Backend Robusto
- **API FastAPI**: Endpoints para simulação de fluxo de potência
- **Integração Pandapower**: Processamento de casos elétricos padrão
- **Validação de Dados**: Verificação automática de parâmetros elétricos
- **Documentação Automática**: Swagger UI disponível

## Estrutura do Projeto
```
SISEP/
├── backend/            # API FastAPI + Pandapower
│   ├── app/
│   │   ├── main.py    # Aplicação principal
│   │   ├── models/    # Modelos de dados
│   │   ├── routes/    # Rotas da API
│   │   └── services/  # Lógica de negócio
│   ├── data/          # Casos de teste (.m files)
│   └── tests/         # Testes automatizados
├── frontend/          # Interface Next.js + React
│   └── app/
│       └── simulator/ # Componentes do simulador
└── docker-compose.yml # Configuração de containers
```

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.6**: Framework React moderno
- **TypeScript**: Tipagem estática para maior confiabilidade
- **SVG Interativo**: Diagramas vetoriais responsivos
- **CSS Modules**: Estilização componentizada

### Backend
- **FastAPI**: Framework Python para APIs de alta performance
- **Pandapower**: Simulação de sistemas elétricos
- **Pydantic**: Validação de dados
- **Pytest**: Framework de testes

## Requisitos
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 18 (para desenvolvimento local)
- **Python** >= 3.9 (para desenvolvimento local)

## Como Executar

### 🚀 Execução com Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/filipenancio/SISEP.git
cd SISEP
```

2. **Inicie os containers:**
```bash
docker-compose up --build
```

3. **Acesse as aplicações:**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 🛠️ Desenvolvimento Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Como Usar

### 1. Navegação no Diagrama
- **Pan**: Clique e arraste para mover o diagrama
- **Zoom**: Use a roda do mouse para ampliar/reduzir
- **Centralização**: Recarregue a página para voltar à visualização inicial

### 2. Edição de Elementos
- **Barras**: Clique na barra azul para editar tensão, carga e status do gerador
- **Geradores**: Clique no quadrado verde para editar potências e limites
- **Linhas**: Clique na linha cinza para editar parâmetros elétricos

### 3. Gerenciamento de Geradores
- **Adicionar**: Ative o toggle "Possui Gerador" na edição da barra
- **Remover**: Desative o toggle "Possui Gerador"
- **Restaurar**: Use o botão ↻ para voltar aos valores originais

### 4. Sistema de Restauração
- **Elemento Individual**: Botão ↻ em cada modal de edição
- **Confirmação**: Sistema pergunta antes de restaurar
- **Valores Originais**: Baseados no arquivo case3p.m original

## Casos de Teste
O sistema inclui casos de teste padrão:
- **case3p.m**: Sistema de 3 barras (principal)
- **case4gs.m**: Sistema de 4 barras
- **case5.m**: Sistema de 5 barras
- **case6ww.m**: Sistema de 6 barras
- **case9.m**: Sistema IEEE de 9 barras
- **case14.m**: Sistema IEEE de 14 barras

## Testes

### Backend
```bash
cd backend
docker-compose exec backend pytest
# ou desenvolvimento local:
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Desenvolvimento

### Hot Reload
```bash
# Com Docker
docker-compose up

# Desenvolvimento local
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

### Debug
- **Backend**: Logs disponíveis via `docker-compose logs backend`
- **Frontend**: Console do navegador (F12) para debug de centralização

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Filipe Venancio** - [@filipenancio](https://github.com/filipenancio)

**Link do Projeto**: [https://github.com/filipenancio/SISEP](https://github.com/filipenancio/SISEP)