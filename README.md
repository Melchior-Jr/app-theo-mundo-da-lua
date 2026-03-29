# 🌙 Théo no Mundo da Lua

**Trabalho de Ciências – 5º Ano**  
Escola Arassuay Gomes de Castro | Professora Marta

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- npm (já vem com o Node.js)

### Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

### Build de produção

```bash
npm run build
npm run preview
```

---

## 📁 Estrutura do projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AppShell/        # Layout base da aplicação
│   ├── StarField/       # Fundo cósmico animado
│   └── TheoCharacter/   # Personagem Théo em SVG
├── pages/               # Páginas da aplicação
│   ├── HomePage/        # Tela inicial
│   └── NotFoundPage/    # Página 404
├── data/                # Dados e constantes
│   └── appInfo.ts       # Informações do projeto e tópicos
├── hooks/               # Hooks customizados
│   └── useViewport.ts   # Utilitários de viewport
├── styles/              # CSS global
│   └── globals.css      # Tokens, animações, reset
├── utils/               # Funções utilitárias
│   └── cn.ts            # Combinador de classes CSS
├── main.tsx             # Entry point
└── router.tsx           # Configuração de rotas
```

---

## 🎨 Stack tecnológica

- **React 18** — UI reativa
- **Vite 5** — Build tool ultrarrápido
- **TypeScript** — Tipagem estática
- **React Router v6** — Navegação entre páginas
- **CSS Modules** — Estilos escopados por componente
- **CSS puro** — Animações GPU-accelerated, sem bibliotecas externas

---

## 🌟 Design

**Tema:** Cosmic Storybook Brutalism  
**Paleta:** Azul meia-noite + Amarelo lunar + Ciano cometa  
**Tipografia:** Nunito (display) + Poppins (corpo)  
**Responsivo:** Mobile-first, funciona em todos os dispositivos

