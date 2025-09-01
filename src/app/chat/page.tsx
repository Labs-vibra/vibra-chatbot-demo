'use client';
import { useChat } from 'ai/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faGasPump,
  faPaperPlane,
  faSpinner,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faTrash,
  faSignOutAlt,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import type { Message } from 'ai';

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  email: string;
  name: string;
  role: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Vic');
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gerar ID único para chat
  const generateChatId = () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Gerar título do chat baseado na primeira mensagem
  const generateChatTitle = (messages: Message[]) => {
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

  // useChat hook com configuração personalizada
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat({
    onFinish: () => {
      // Usar setTimeout para garantir que as mensagens foram atualizadas
      setTimeout(() => {
        saveCurrentChat();
      }, 100);
    },
  });

  // Salvar chat atual - usando useCallback para evitar dependência circular
  const saveCurrentChat = useCallback((currentMessages?: Message[]) => {
    if (!currentChatId) return;

    const messagesToSave = currentMessages || messages;
    if (messagesToSave.length === 0) return;

    const histories = loadChatHistories();
    const existingIndex = histories.findIndex((h: ChatHistory) => h.id === currentChatId);

    const chatData: ChatHistory = {
      id: currentChatId,
      title: generateChatTitle(messagesToSave),
      messages: messagesToSave,
      createdAt: existingIndex === -1 ? new Date().toISOString() : histories[existingIndex].createdAt,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex === -1) {
      histories.unshift(chatData);
    } else {
      histories[existingIndex] = chatData;
    }

    saveChatHistories(histories);
  }, [currentChatId, messages]);

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
      setMessages(chat.messages);
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
        const summary = history.messages.slice(0, 4).map((m: Message) => `${m.role}: ${m.content.slice(0, 100)}`).join('\n');
        return `[Conversa anterior - ${new Date(history.createdAt).toLocaleDateString()}]:\n${summary}`;
      }).join('\n\n');

      finalInput = `Contexto de conversas anteriores:\n${contextSummary}\n\nPergunta atual: ${input}`;
    }

    // Temporariamente alterar o input para incluir contexto
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
  }, [messages, currentChatId, saveCurrentChat]);

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
              <FontAwesomeIcon
                icon={sidebarOpen ? faChevronLeft : faChevronRight}
                className="w-4 h-4 text-green-600"
              />
            </button>
          </div>

          {sidebarOpen && (
            <button
              onClick={createNewChat}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Nova Conversa
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
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
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
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 shadow-lg flex items-center" style={{ height: '74px' }}>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-18 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md border border-green-300 overflow-auto">
                <Image
                  src="/vic_image.png"
                  alt="Vic Logo"
                  width={72}
                  height={56}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Victória AI</h1>
                <div className="mt-1 flex items-center space-x-2">
                  {currentChatId ? (
                    <p className="text-green-100">Chat Ativo</p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-green-800 text-white border border-green-500 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="Vic" className="text-white">Modelo: N/A</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-green-200">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
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
                <div className="text-4xl mb-4 text-green-600">
                  <FontAwesomeIcon icon={faRobot} className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Olá! Sou o ChatBot Vibra Energia</h2>
                <p className="text-green-500">Especialista em combustíveis e regulamentações ANP. Como posso auxiliá-lo com informações sobre combustíveis, derivados de petróleo e normas da Agência Nacional do Petróleo?</p>
              </div>
            </div>
          )}

          {messages.map((message: Message) => (
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
                    <FontAwesomeIcon
                      icon={message.role === 'user' ? faUser : faGasPump}
                      className={`w-4 h-4 ${message.role === 'user' ? 'text-white' : 'text-green-600'}`}
                    />
                  </div>                  <div className="flex-1">
                    {message.role === 'assistant' ? (
                      <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-800 prose-a:text-green-600 prose-strong:text-gray-900 prose-code:text-green-700 prose-code:bg-green-50 prose-pre:bg-gray-100 prose-pre:text-gray-800">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight, rehypeRaw]}
                          components={{
                            code: ({ className, children, ...props }: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              return isInline ? (
                                <code className="bg-green-50 text-green-700 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-gray-100 rounded-lg p-3 overflow-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            p: ({ children }: any) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }: any) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                            ),
                            ol: ({ children }: any) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                            ),
                            h1: ({ children }: any) => (
                              <h1 className="text-lg font-bold mb-2">{children}</h1>
                            ),
                            h2: ({ children }: any) => (
                              <h2 className="text-base font-bold mb-2">{children}</h2>
                            ),
                            h3: ({ children }: any) => (
                              <h3 className="text-sm font-bold mb-1">{children}</h3>
                            ),
                            blockquote: ({ children }: any) => (
                              <blockquote className="border-l-4 border-green-300 pl-3 italic text-gray-600 my-2">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }: any) => (
                              <div className="overflow-x-auto my-2">
                                <table className="min-w-full border border-gray-300 text-xs">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }: any) => (
                              <th className="border border-gray-300 px-2 py-1 bg-green-50 font-semibold text-left">
                                {children}
                              </th>
                            ),
                            td: ({ children }: any) => (
                              <td className="border border-gray-300 px-2 py-1">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-green-200 max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">
                    <FontAwesomeIcon icon={faGasPump} className="w-4 h-4 text-green-600" />
                  </div>
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
              <FontAwesomeIcon
                icon={isLoading ? faSpinner : faPaperPlane}
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
