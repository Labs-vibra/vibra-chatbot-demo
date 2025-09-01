# 🤖 Chatbot IA - Powered by Gemini Pro

Um chatbot moderno e inteligente com interface verde, desenvolvido com Next.js e integrado ao Google Gemini Pro através do Vercel AI SDK.

## ✨ Características

- 🎨 **Interface Verde Moderna**: Design responsivo com tema verde em todas as variações
- 🤖 **IA Avançada**: Integração com Google Gemini Pro para respostas inteligentes
- ⚡ **Streaming em Tempo Real**: Respostas aparecem em tempo real conforme são geradas
- 📱 **Totalmente Responsivo**: Funciona perfeitamente em desktop e mobile
- 🎯 **UX Intuitiva**: Interface limpa com diferenciação visual clara entre usuário e IA

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **Estilização**: Tailwind CSS
- **IA**: Vercel AI SDK + Google Gemini Pro
- **Hooks**: useChat, useEffect, useRef para gerenciamento de estado

## 🛠️ Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_gemini_aqui
```

### 3. Obter chave da API do Google Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env.local`

### 4. Executar o projeto
```bash
npm run dev
```

Acesse `http://localhost:3000` para ver o chatbot em ação!

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route para integração com Gemini
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Componente principal do chatbot
└── ...
```

## 🎨 Design

A interface foi cuidadosamente projetada com:
- **Cores**: Paleta verde (green-50 a green-600)
- **Tipografia**: Fontes modernas e legíveis
- **Animações**: Efeitos suaves de loading e transições
- **Responsividade**: Adaptável a todos os tamanhos de tela

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa linting do código

## 📝 Como Usar

1. Digite sua pergunta no campo de texto
2. Clique no botão enviar (📤) ou pressione Enter
3. Aguarde a resposta da IA aparecer em tempo real
4. Continue a conversa naturalmente

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Submeter pull requests

## 📄 Licença

Este projeto está sob a licença MIT.
