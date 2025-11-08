# Frontend - SISEP (Sistema Interativo de Sistema Elétrico de Potência)

Interface moderna e interativa construída com Next.js para visualização e edição de sistemas elétricos de potência.

## 🎨 Funcionalidades

### 🔍 Visualização Interativa
- **Diagrama SVG Responsivo**: Sistema de 3 barras com elementos vetoriais
- **Pan & Zoom**: Navegação fluida com mouse e roda de scroll
- **Centralização Automática**: Diagrama posicionado automaticamente na tela
- **Tooltips Informativos**: Informações detalhadas ao passar o mouse

### ⚙️ Edição de Parâmetros
- **Edição de Barras**: Tensão, carga, tipo e status do gerador
- **Edição de Geradores**: Potências ativa/reativa, limites e tensão
- **Edição de Linhas**: Resistência, reatância, susceptância e limites
- **Validação em Tempo Real**: Verificação automática de valores

### 🔄 Gerenciamento Inteligente
- **Sistema de Geradores**: Adição/remoção automática com toggle iPhone-style
- **Restauração Granular**: Restaure elementos individuais aos valores originais
- **Confirmações Contextuais**: Modais específicos para cada tipo de operação
- **Backup Automático**: Sistema mantém dados originais para restauração

### 🎯 Interface Moderna
- **Design Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Animações Suaves**: Transições fluidas entre estados
- **Modais em Camadas**: Sistema de z-index para sobreposições
- **Legendas Visuais**: Identificação clara de elementos do diagrama

## 🛠️ Tecnologias

- **Next.js 15.3.0**: Framework React com App Router
- **TypeScript 5**: Tipagem estática para maior confiabilidade
- **React 19**: Biblioteca de componentes com hooks modernos
- **SVG Nativo**: Gráficos vetoriais para diagrama elétrico
- **CSS Modules**: Estilização componentizada e isolada
- **jsPDF 3.0.3**: Geração de relatórios em PDF

## 📁 Estrutura do Projeto

```
frontend/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx            # Página inicial
│   └── simulator/          # Módulo do simulador
│       ├── page.tsx        # Seleção de modelos
│       ├── interfaces.ts   # Interfaces TypeScript
│       ├── styles.d.ts     # Declarações de tipos CSS
│       ├── styles.module.css # Estilos do simulador
│       ├── components/     # Componentes React
│       │   ├── PowerSystemElements.tsx # Diagrama SVG interativo
│       │   └── Footer.tsx              # Rodapé
│       ├── numeric/        # Entrada/saída numérica
│       │   └── page.tsx
│       └── system/         # Visualização do sistema
│           └── page.tsx
├── public/                 # Arquivos estáticos (imagens)
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

### 1. 🖱️ Navegação no Diagrama
- **Pan (Arrastar)**: Clique e arraste para mover o diagrama
- **Zoom**: Use a roda do mouse para ampliar/reduzir
- **Centralização**: Recarregue a página para voltar à posição inicial

### 2. ✏️ Edição de Elementos

#### Barras (Círculos Azuis)
- Clique na barra para abrir o modal de edição
- Configure: tensão, ângulo, carga ativa/reativa, limites
- Toggle "Possui Gerador" para adicionar/remover geradores

#### Geradores (Quadrados Verdes com Triângulo)
- Clique no gerador para editar parâmetros
- Configure: potências, limites, tensão de referência
- Status de operação (ligado/desligado)

#### Linhas de Transmissão (Linhas Cinzas)
- Clique na linha para editar parâmetros elétricos
- Configure: resistência, reatância, susceptância
- Limites de corrente e status

### 3. 🔄 Sistema de Restauração
- **Botão ↻**: Disponível em cada modal de edição
- **Confirmação**: Sistema pergunta antes de restaurar
- **Escopo**: Restaura apenas o elemento selecionado
- **Dados Originais**: Baseados no sistema case3p.m

### 4. 🔌 Gerenciamento de Geradores
- **Ativar Gerador**: Toggle "Possui Gerador" = ON
- **Valores Padrão**: Sistema cria gerador com parâmetros típicos
- **Gerador Original**: Se existia originalmente, restaura valores originais
- **Desativar**: Toggle = OFF remove o gerador (exceto barra slack)

## 🎨 Componentes Principais

### PowerSystemElements.tsx
Componente principal que gerencia:
- **Estado do Sistema**: Dados MATPOWER editáveis
- **Interações**: Pan, zoom, cliques, hovers
- **Modais**: Sistema de edição em camadas
- **Validações**: Verificação de parâmetros em tempo real

### Componentes de Interface
- **Header/Footer**: Navegação e informações
- **Tooltips**: Informações contextuais
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
- **Sistema Original**: Backup imutável dos dados case3p.m
- **Sistema Editado**: Estado atual modificável
- **Deep Copy**: Clonagem profunda para evitar mutações

### Performance
- **SVG Otimizado**: Renderização eficiente de elementos vetoriais
- **React Portals**: Modais renderizados fora da árvore DOM
- **Callbacks Memoizados**: useCallback para otimizar re-renders

### Responsividade
- **ViewBox SVG**: Coordenadas fixas com scaling automático
- **Layout Flexível**: Adapta-se a diferentes resoluções
- **Touch Support**: Funciona em dispositivos móveis

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

2. **Modais não aparecem:**
   - Verifique se React Portal está funcionando
   - Confirme z-index dos elementos

3. **Edições não salvam:**
   - Verifique se o estado está sendo atualizado
   - Confirme se as validações estão passando

### Debug
```javascript
// Console do navegador mostra informações de centralização
console.log('Debug centralização:', { panX, panY, zoom });
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
