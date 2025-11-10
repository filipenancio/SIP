# Simulador Interativo de Sistema Elétrico de Potência - SISEP

## Descrição
Sistema web completo para simulação e visualização interativa de sistemas elétricos de potência. O projeto combina uma interface moderna em Next.js com uma API robusta em FastAPI, utilizando o Pandapower para análise de fluxo de potência. Oferece dois modos de operação: **Modelo Interativo** com diagramas SVG editáveis e **Modelo Numérico** com entrada/saída de dados tabulares.

## Funcionalidades

### 🎯 Dois Modelos de Operação

#### 📊 Modelo Numérico
- **Entrada Tabular**: Edição de dados em formato de tabela
- **Dados Estruturados**: Barras, geradores e linhas de transmissão
- **Validação Automática**: Verificação de valores em tempo real
- **Importação/Exportação**: Suporte a arquivos MATPOWER (.m)
- **Casos Pré-Carregados**: Sistemas de 3, 4, 5 e 14 barras
- **Relatórios PDF**: Exportação de resultados completos

#### 🖼️ Modelo Interativo  
- **Diagrama SVG Interativo**: Visualização gráfica dos sistemas elétricos
- **Pan & Zoom**: Navegação fluida com mouse e roda de scroll
- **Edição Visual**: Clique nos elementos para editar parâmetros
- **Sistemas Suportados**: 3, 4, 5 e 14 barras com diagramas dedicados
- **Tooltips Informativos**: Informações detalhadas ao passar o mouse
- **Legendas Visuais**: Identificação clara de elementos do sistema
- **Exportação de Relatórios**: Geração de PDF com diagrama e resultados

### ⚡ Backend Robusto
- **API FastAPI**: Endpoints RESTful para simulação de fluxo de potência
- **Integração Pandapower**: Processamento de casos elétricos padrão
- **Suporte a Transformadores**: Conversão automática de transformadores para linhas
- **Validação de baseKV**: Correção automática de valores zerados
- **Modo Debug Configurável**: Flag para controlar logs de depuração
- **Documentação Automática**: Swagger UI e ReDoc disponíveis

### 🔧 Recursos Avançados
- **Gerenciamento de Geradores**: Sistema inteligente para adicionar/remover
- **Sistema de Restauração**: Restaure elementos ou sistema completo
- **MessageModal**: Feedback visual para operações e erros
- **Validação em Tempo Real**: Verificação automática de parâmetros elétricos
- **Backup Automático**: Dados originais preservados para restauração

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
- **Next.js 15.3.0**: Framework React moderno com App Router
- **React 19**: Biblioteca de componentes com hooks avançados
- **TypeScript 5**: Tipagem estática para maior confiabilidade
- **SVG Interativo**: Diagramas vetoriais responsivos e editáveis
- **CSS Modules**: Estilização componentizada e isolada
- **jsPDF 3.0.3**: Geração de relatórios em PDF com diagrama

### Backend
- **FastAPI**: Framework Python para APIs de alta performance
- **Pandapower**: Simulação de sistemas elétricos de potência
- **Pydantic**: Validação de dados e serialização
- **Pytest**: Framework de testes automatizados
- **NumPy & Pandas**: Processamento de dados numéricos

## Casos de Teste Disponíveis
O sistema inclui arquivos MATPOWER pré-carregados:
- **case3p.m**: Sistema de 3 barras (modelo numérico e interativo)
- **case4gs.m**: Sistema de 4 barras (modelo numérico e interativo)
- **case5.m**: Sistema de 5 barras (modelo numérico e interativo)
- **case6ww.m**: Sistema de 6 barras (somente modelo numérico)
- **case9.m**: Sistema IEEE de 9 barras (somente modelo numérico)
- **case14.m**: Sistema IEEE de 14 barras (modelo numérico e interativo)

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

### 🎯 Seleção de Modelo
Na página inicial, escolha entre:
- **Modelo Numérico**: Entrada/saída tabular de dados
- **Modelo Interativo**: Visualização gráfica e edição visual

### 📊 Modelo Numérico
1. **Selecione ou carregue um caso**: Escolha um sistema pré-carregado ou importe arquivo .m
2. **Edite os dados**: Modifique valores nas tabelas de barras, geradores e linhas
3. **Simule**: Clique em "Simular" para executar o fluxo de potência
4. **Visualize resultados**: Analise tensões, fluxos e perdas
5. **Exporte relatório**: Gere PDF com todos os dados e resultados

### 🖼️ Modelo Interativo
1. **Navegação no Diagrama**:
   - **Pan**: Clique e arraste para mover o diagrama
   - **Zoom**: Use a roda do mouse para ampliar/reduzir
   - **Centralização**: Recarregue a página para voltar à posição inicial

2. **Edição de Elementos**:
   - **Barras**: Clique no círculo azul para editar tensão, carga e tipo
   - **Geradores**: Clique no quadrado verde para editar potências e limites
   - **Linhas**: Clique na linha cinza para editar impedâncias

3. **Gerenciamento de Geradores**:
   - **Adicionar**: Ative o toggle "Possui Gerador" na edição da barra
   - **Remover**: Desative o toggle "Possui Gerador"
   - **Restaurar**: Use o botão ↻ para voltar aos valores originais

4. **Simulação e Resultados**:
   - Clique em "Simular" para executar o fluxo de potência
   - Visualize resultados nas tooltips (passe o mouse sobre elementos)
   - Exporte relatório PDF com diagrama colorido e tabelas de resultados

5. **Sistema de Restauração**:
   - **Elemento Individual**: Botão ↻ em cada modal de edição
   - **Sistema Completo**: Botão "Restaurar Sistema" restaura todos os elementos
   - **Confirmação**: Sistema solicita confirmação antes de restaurar

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