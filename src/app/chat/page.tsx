'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ChatHistory {
  id: string;
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // useChat hook com configuração personalizada
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat({
    onFinish: (message) => {
      saveCurrentChat();
    },
  });

  // Gerar ID único para chat
  const generateChatId = () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Gerar título do chat baseado na primeira mensagem
  const generateChatTitle = (messages: any[]) => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
    return 'Nova Conversa';
  };

  // Carregar históricos do localStorage
  const loadChatHistories = () => {
    try {
      const saved = localStorage.getItem('vibra_chat_histories');
      if (saved) {
        const histories = JSON.parse(saved);
        setChatHistories(histories);
        return histories;
      }
    } catch (error) {
      console.error('Erro ao carregar históricos:', error);
    }
    return [];
  };

  // Salvar históricos no localStorage
  const saveChatHistories = (histories: ChatHistory[]) => {
    try {
      localStorage.setItem('vibra_chat_histories', JSON.stringify(histories));
      setChatHistories(histories);
    } catch (error) {
      console.error('Erro ao salvar históricos:', error);
    }
  };

  // Salvar chat atual
  const saveCurrentChat = () => {
    if (!currentChatId || messages.length === 0) return;

    const histories = loadChatHistories();
    const existingIndex = histories.findIndex((h: ChatHistory) => h.id === currentChatId);

    const chatData: ChatHistory = {
      id: currentChatId,
      title: generateChatTitle(messages),
      messages: messages as any,
      createdAt: existingIndex === -1 ? new Date().toISOString() : histories[existingIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex === -1) {
      histories.unshift(chatData);
    } else {
      histories[existingIndex] = chatData;
    }

    saveChatHistories(histories);
  };

  // Criar nova conversa
  const createNewChat = () => {
    if (messages.length > 0) {
      saveCurrentChat();
    }

    const newChatId = generateChatId();
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  // Carregar conversa específica
  const loadChat = (chatId: string) => {
    if (currentChatId && messages.length > 0) {
      saveCurrentChat();
    }

    const histories = loadChatHistories();
    const chat = histories.find((h: ChatHistory) => h.id === chatId);

    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages as any);
    }
  };

  // Deletar conversa
  const deleteChat = (chatId: string) => {
    const histories = loadChatHistories();
    const filteredHistories = histories.filter((h: ChatHistory) => h.id !== chatId);
    saveChatHistories(filteredHistories);

    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  // Custom handleSubmit para incluir contexto do histórico
  const handleSubmitWithContext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentChatId) {
      const newChatId = generateChatId();
      setCurrentChatId(newChatId);
    }

    // Preparar contexto com histórico de outras conversas
    const histories = loadChatHistories();
    const recentHistories = histories.slice(0, 3); // Últimas 3 conversas como contexto

    let finalInput = input;

    if (recentHistories.length > 0) {
      const contextSummary = recentHistories.map((history: ChatHistory) => {
        const summary = history.messages.slice(0, 4).map((m: any) => `${m.role}: ${m.content.slice(0, 100)}`).join('\n');
        return `[Conversa anterior - ${new Date(history.createdAt).toLocaleDateString()}]:\n${summary}`;
      }).join('\n\n');

      finalInput = `Contexto de conversas anteriores:\n${contextSummary}\n\nPergunta atual: ${input}`;
    }

    // Temporariamente alterar o input para incluir contexto
    const originalInput = input;
    setInput(finalInput);

    // Chamar handleSubmit original
    setTimeout(() => {
      handleSubmit(e);
      // Restaurar input original após o envio
      setInput('');
    }, 50);
  };

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const authenticated = localStorage.getItem('vibra_authenticated');
    const userData = localStorage.getItem('vibra_user');

    if (authenticated === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      // Carregar histórico de chats
      loadChatHistories();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // Auto-salvar a cada mudança nas mensagens
    if (currentChatId && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 1000); // Salva 1 segundo após a última alteração

      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('vibra_authenticated');
    localStorage.removeItem('vibra_user');
    localStorage.removeItem('vibra_chat_histories');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Sidebar com histórico */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-green-200 flex flex-col transition-all duration-300`}>
        {/* Header do Sidebar */}
        <div className="p-4 border-b border-green-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-gray-800">Histórico</h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {sidebarOpen && (
            <button
              onClick={createNewChat}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
            >
              ➕ Nova Conversa
            </button>
          )}
        </div>

        {/* Lista de conversas */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto">
            {chatHistories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Nenhuma conversa ainda
              </div>
            ) : (
              <div className="p-2">
                {chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-green-100 border-l-4 border-green-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => loadChat(chat.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(chat.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-green-600">
                          {chat.messages.length} mensagens
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md border border-green-300 p-1">
                <img
                  src="/vibra-logo.png"
                  alt="Vibra Energia Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ChatBot Vibra Energia</h1>
                <p className="text-green-100 mt-1">
                  {currentChatId ? 'Chat Ativo' : 'Sistema de Atendimento Especializado'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-green-200">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded-lg text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-green-600 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto border border-green-200">
                <div className="text-4xl mb-4">⛽</div>
                <h2 className="text-xl font-semibold mb-2">Olá! Sou o ChatBot Vibra Energia</h2>
                <p className="text-green-500">Posso ajudar com informações sobre energia e combustíveis. Como posso auxiliá-lo?</p>
              </div>
            </div>
          )}

          {messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
                  message.role === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-800 border border-green-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="text-lg">
                    {message.role === 'user' ? '👤' : '⛽'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-green-200 max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">⛽</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-green-200 bg-white p-4">
          <form onSubmit={handleSubmitWithContext} className="flex space-x-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Pergunte sobre energia ou combustíveis..."
              className="flex-1 border border-green-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
