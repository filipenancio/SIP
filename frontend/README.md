# Frontend - SISEP (Sistema Interativo de Sistema Elétrico de Potência)

Interface moderna e interativa construída com Next.js para visualização e edição de sistemas elétricos de potência. Oferece dois modos completos: **Modelo Interativo** com diagramas SVG editáveis e **Modelo Numérico** com entrada/saída tabular.

## 🎨 Funcionalidades

### 🎯 Dois Modelos de Operação

#### 📊 Modelo Numérico
- **Entrada Tabular**: Edição de dados em formato de tabela
- **Dados Estruturados**: Barras, geradores e linhas de transmissão
- **Validação Automática**: Verificação de valores em tempo real
- **Importação/Exportação**: Suporte a arquivos MATPOWER (.m)
- **Casos Pré-Carregados**: Sistemas de 3, 4, 5, 6, 9 e 14 barras
- **Relatórios PDF**: Exportação completa de dados e resultados

#### 🖼️ Modelo Interativo
- **Sistemas Suportados**: 3, 4, 5 e 14 barras com diagramas dedicados
- **Diagrama SVG Responsivo**: Visualização gráfica escalável
- **Pan & Zoom**: Navegação fluida com mouse e roda de scroll
- **Edição Visual**: Clique nos elementos para editar parâmetros
- **Legendas Integradas**: Identificação visual de elementos
- **Exportação PDF com Diagrama**: Relatório completo com imagem colorida

### 🔍 Visualização Interativa
- **Tooltips Informativos**: Informações detalhadas ao passar o mouse
- **Cores por Estado**: Elementos mudam de cor após simulação
- **Centralização Automática**: Diagrama posicionado automaticamente na tela
- **ViewPort Responsivo**: Adapta-se ao tamanho da tela

### ⚙️ Edição de Parâmetros
- **Edição de Barras**: Tensão, carga, tipo e status do gerador
- **Edição de Geradores**: Potências ativa/reativa, limites e tensão
- **Edição de Linhas**: Resistência, reatância, susceptância e limites
- **Validação em Tempo Real**: Verificação automática de valores
- **Inputs Numéricos Formatados**: Campos com validação e formatação

### 🔄 Gerenciamento Inteligente
- **Sistema de Geradores**: Adição/remoção automática com toggle iPhone-style
- **Restauração Granular**: Restaure elementos individuais aos valores originais
- **MessageModal**: Feedback visual para operações e erros
- **Confirmações Contextuais**: Modais específicos para cada tipo de operação
- **Backup Automático**: Sistema mantém dados originais para restauração

### 🎯 Interface Moderna
- **Design Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Animações Suaves**: Transições fluidas entre estados
- **Modais em Camadas**: Sistema de z-index para sobreposições corretas
- **Legendas Visuais**: Identificação clara de elementos do diagrama
- **Footer Informativo**: Links e informações do projeto

## 🛠️ Tecnologias

- **Next.js 15.3.0**: Framework React com App Router
- **TypeScript 5**: Tipagem estática para maior confiabilidade
- **React 19**: Biblioteca de componentes com hooks modernos
- **SVG Nativo**: Gráficos vetoriais para diagramas elétricos
- **CSS Modules**: Estilização componentizada e isolada
- **jsPDF 2.5.2**: Geração de relatórios em PDF
- **html2canvas 1.4.1**: Captura de diagrama SVG para imagem

## 📁 Estrutura do Projeto

```
frontend/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx            # Página de seleção de modelo
│   └── simulator/          # Módulo do simulador
│       ├── page.tsx        # Seleção de sistemas (deprecated)
│       ├── styles.d.ts     # Declarações de tipos CSS
│       ├── styles.module.css # Estilos do simulador
│       ├── components/     # Componentes React
│       │   ├── Diagram3Bus.tsx         # Diagrama de 3 barras
│       │   ├── Diagram4Bus.tsx         # Diagrama de 4 barras
│       │   ├── Diagram5Bus.tsx         # Diagrama de 5 barras
│       │   ├── Diagram14Bus.tsx        # Diagrama de 14 barras
│       │   ├── PowerSystemElements.tsx # Componente base SVG
│       │   ├── EditModalBus.tsx        # Modal de edição de barra
│       │   ├── EditModalGenerator.tsx  # Modal de edição de gerador
│       │   ├── EditModalBranch.tsx     # Modal de edição de linha
│       │   ├── MessageModal.tsx        # Modal de feedback
│       │   ├── TooltipBus.tsx          # Tooltip de barra
│       │   ├── TooltipGenerator.tsx    # Tooltip de gerador
│       │   ├── TooltipBranch.tsx       # Tooltip de linha
│       │   ├── TooltipLoad.tsx         # Tooltip de carga
│       │   ├── ViewPortBaseSVG.tsx     # Container SVG com pan/zoom
│       │   ├── NumericInput.tsx        # Input numérico formatado
│       │   ├── HeaderChild.tsx         # Cabeçalho das páginas
│       │   └── Footer.tsx              # Rodapé
│       ├── data/           # Casos de teste pré-carregados
│       │   ├── case3p.ts
│       │   ├── case4p.ts
│       │   ├── case5p.ts
│       │   └── case14p.ts
│       ├── utils/          # Utilitários
│       │   ├── SimulateUtils.ts        # Lógica de simulação
│       │   ├── MPCToMatpower.ts        # Conversão MPC → MATPOWER
│       │   ├── FormattedInput.ts       # Formatação de inputs
│       │   └── LabelPositioning.ts     # Posicionamento de labels
│       ├── numeric/        # Modelo Numérico
│       │   └── page.tsx
│       └── system/         # Modelo Interativo
│           └── page.tsx
├── public/                 # Arquivos estáticos (logo, etc)
├── next.config.ts         # Configuração Next.js
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
└── README.md              # Este arquivo
```

## ⚡ Como Executar

### 🐳 Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up frontend
```

### 🔧 Desenvolvimento Local

1. **Instale as dependências:**
```bash
cd frontend
npm install
```

2. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Acesse a aplicação:**
```bash
# Desenvolvimento
http://localhost:3000

# Produção
npm run build
npm start
```

### 🌐 Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Build de produção
npm run build

# Servidor de produção
npm start

# Linting
npm run lint

# Verificação de tipos
npm run type-check
```

## 🎮 Como Usar

### 1. 🎯 Seleção de Modelo
Na página inicial (`/`), escolha:
- **Modelo Numérico** (`/simulator/numeric`): Entrada/saída tabular
- **Modelo Interativo** (`/simulator/system`): Visualização gráfica

### 2. 📊 Modelo Numérico
1. **Selecione um sistema**: Escolha entre 3, 4, 5, 6, 9 ou 14 barras
2. **Carregue ou importe**: Use caso pré-carregado ou arquivo .m
3. **Edite dados**: Modifique valores nas tabelas
4. **Simule**: Execute o fluxo de potência
5. **Visualize**: Analise resultados nas tabelas
6. **Exporte**: Gere relatório PDF completo

### 3. 🖼️ Modelo Interativo

#### 3.1 🖱️ Navegação no Diagrama
- **Pan (Arrastar)**: Clique e arraste para mover o diagrama
- **Zoom**: Use a roda do mouse para ampliar/reduzir
- **Centralização**: Recarregue a página para voltar à posição inicial
- **Sistemas Disponíveis**: 3, 4, 5 e 14 barras

#### 3.2 ✏️ Edição de Elementos

**Barras (Círculos Azuis)**
- Clique na barra para abrir o modal de edição
- Configure: tensão, ângulo, carga ativa/reativa, tipo de barra
- Toggle "Possui Gerador" para adicionar/remover geradores
- Botão ↻ restaura valores originais da barra

**Geradores (Quadrados Verdes com Triângulo)**
- Clique no gerador para editar parâmetros
- Configure: potências ativa/reativa, limites, tensão de referência
- Status de operação (ligado/desligado)
- Botão ↻ restaura valores originais do gerador

**Linhas de Transmissão (Linhas Cinzas)**
- Clique na linha para editar parâmetros elétricos
- Configure: resistência, reatância, susceptância
- Limites de corrente e status de operação
- Botão ↻ restaura valores originais da linha

#### 3.3 🔄 Sistema de Restauração
- **Botão ↻ Individual**: Disponível em cada modal de edição
- **Botão "Restaurar Sistema"**: Restaura todos os elementos
- **Confirmação MessageModal**: Sistema pergunta antes de restaurar
- **Escopo**: Restaura apenas o que foi selecionado
- **Dados Originais**: Baseados nos arquivos case*.m

#### 3.4 🔌 Gerenciamento de Geradores
- **Ativar Gerador**: Toggle "Possui Gerador" = ON na edição de barra
- **Valores Padrão**: Sistema cria gerador com parâmetros típicos
- **Gerador Original**: Se existia originalmente, restaura valores
- **Desativar**: Toggle = OFF remove o gerador (exceto barra slack)
- **Restrição**: Barra slack sempre mantém gerador

#### 3.5 📄 Exportação de Relatórios
- **Botão "Exportar Relatório"**: Gera PDF com diagrama e dados
- **Conteúdo do PDF**:
  - Diagrama do sistema colorido (estado atual)
  - Legenda de elementos visuais
  - Tabela de resultados das barras
  - Tabela de fluxos nas linhas
  - Dados dos geradores e cargas
- **MessageModal**: Feedback visual de sucesso ou erro
- **Formato**: PDF otimizado para impressão

### 4. 💬 MessageModal
Sistema de feedback visual para:
- ✅ Confirmações de ações (restaurar, exportar)
- ⚠️ Alertas e avisos
- ❌ Erros e problemas
- ℹ️ Informações gerais

## 🎨 Componentes Principais

### PowerSystemElements.tsx
Componente base que gerencia:
- **Estado do Sistema**: Dados MATPOWER editáveis
- **Interações**: Pan, zoom, cliques, hovers
- **Modais**: Sistema de edição em camadas (z-index correto)
- **Validações**: Verificação de parâmetros em tempo real
- **Eventos**: Sistema de eventos customizados para comunicação entre componentes

### Diagramas Específicos
- **Diagram3Bus.tsx**: Sistema de 3 barras (2 geradores, 3 linhas)
- **Diagram4Bus.tsx**: Sistema de 4 barras (1 gerador, 4 linhas)
- **Diagram5Bus.tsx**: Sistema de 5 barras (2 geradores, 6 linhas)
- **Diagram14Bus.tsx**: Sistema de 14 barras (5 geradores, 20 linhas)

### Modais de Edição
- **EditModalBus.tsx**: Edição de barras com toggle de gerador
- **EditModalGenerator.tsx**: Edição de parâmetros de geradores
- **EditModalBranch.tsx**: Edição de linhas de transmissão
- **EditModalBaseValues.tsx**: Modal base para valores base do sistema
- **MessageModal.tsx**: Feedback visual unificado

### Tooltips
- **TooltipBus.tsx**: Informações de barras (tensão, carga)
- **TooltipGenerator.tsx**: Informações de geradores (potências)
- **TooltipBranch.tsx**: Informações de linhas (fluxos, perdas)
- **TooltipLoad.tsx**: Informações de cargas

### Utilitários
- **SimulateUtils.ts**: Lógica de chamada da API e processamento
- **MPCToMatpower.ts**: Conversão de estrutura MPC para string MATPOWER
- **FormattedInput.ts**: Formatação e validação de inputs numéricos
- **LabelPositioning.ts**: Algoritmo de posicionamento inteligente de labels
- **ViewPortBaseSVG.tsx**: Container SVG com pan/zoom suave
- **Modais**: Edição de parâmetros com confirmações
- **ToggleSwitch**: Controle iPhone-style para geradores

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 🎯 Características Técnicas

### Estado de Dados
- **Sistema Original**: Backup imutável dos dados dos arquivos .m
- **Sistema Editado**: Estado atual modificável via React useState
- **Deep Copy**: Clonagem profunda para evitar mutações acidentais
- **Restauração**: Sistema mantém referência aos dados originais

### Performance
- **SVG Otimizado**: Renderização eficiente de elementos vetoriais
- **React Portals**: Modais renderizados fora da árvore DOM principal
- **Callbacks Memoizados**: useCallback para otimizar re-renders
- **Lazy Loading**: Componentes carregados sob demanda
- **Event Delegation**: Eventos gerenciados eficientemente

### Responsividade
- **ViewBox SVG**: Coordenadas fixas com scaling automático
- **Layout Flexível**: Adapta-se a diferentes resoluções (mobile, tablet, desktop)
- **Touch Support**: Funciona em dispositivos móveis e touch screens
- **Zoom Responsivo**: Pan e zoom funcionam em qualquer dispositivo

### Acessibilidade
- **Botões Semânticos**: Uso correto de elementos HTML
- **Labels Descritivos**: Campos de formulário bem identificados
- **Feedback Visual**: MessageModal para comunicação clara
- **Navegação por Teclado**: Suporte a Tab e Enter

## 🔧 Configuração de Desenvolvimento

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Configuração TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Diagrama não centraliza:**
   - Verifique os cálculos de pan/zoom no console (F12)
   - Confirme se o viewBox está correto

## 🐛 Troubleshooting

### Problemas Comuns

1. **Diagrama não centraliza:**
   - Recarregue a página (F5)
   - Verifique dimensões do container SVG
   - Confirme se ViewPortBaseSVG está montado

2. **Modais não aparecem:**
   - Verifique se React Portal está funcionando
   - Confirme z-index dos elementos (EditModal = 1001, MessageModal = 1002)
   - Verifique se há erros no console

3. **Edições não salvam:**
   - Verifique se o estado está sendo atualizado corretamente
   - Confirme se as validações numéricas estão passando
   - Verifique tipos de dados (string vs number)

4. **Exportação de PDF falha:**
   - Certifique-se de ter executado a simulação primeiro
   - Verifique se html2canvas capturou o SVG corretamente
   - MessageModal deve mostrar a mensagem de erro

5. **Backend não responde:**
   - Confirme que o backend está rodando em http://localhost:8000
   - Verifique logs do Docker: `docker-compose logs backend`
   - Teste os endpoints em http://localhost:8000/docs

### Debug
```javascript
// Console do navegador (comentados em produção)
// Logs de debug foram comentados mas podem ser reativados:
// - console.log('[DEBUG] Linhas recebidas:', ...)
// - console.log('Evento triggerSimulation recebido', ...)
// - console.log('handleSimulate chamado', ...)
```

## 📱 Compatibilidade

### Navegadores Suportados
- **Chrome** >= 90
- **Firefox** >= 88
- **Safari** >= 14
- **Edge** >= 90

### Dispositivos
- **Desktop**: Experiência completa com mouse
- **Tablet**: Suporte a touch para pan/zoom
- **Mobile**: Interface adaptada para telas menores

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte o repositório ao Vercel
# Deploy automático a cada push
```

### Build Manual
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t sifp-frontend .
docker run -p 3000:3000 sifp-frontend
```

## 🤝 Contribuição

1. **Padrões de Código**: Use ESLint + Prettier
2. **Componentes**: Crie componentes reutilizáveis
3. **TypeScript**: Mantenha tipagem forte
4. **Testes**: Adicione testes para novas funcionalidades
5. **Documentação**: Comente código complexo

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SVG MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/SVG)
