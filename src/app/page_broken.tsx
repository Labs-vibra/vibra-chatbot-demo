'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const authenticated = localStorage.getItem('vibra_authenticated');
    
    if (authenticated === 'true') {
      // Se já está logado, redirecionar para o chat
      router.push('/chat');
    } else {
      // Se não está logado, redirecionar para o login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center animate-pulse shadow-lg border-2 border-green-300 p-2">
          <img 
            src="/vibra-logo.png" 
            alt="Vibra Energia Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mt-4 text-green-600">Redirecionando...</p>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">⛽ Agente Vibra Energia</h1>
        <p className="text-center text-green-100 mt-1">Especialista em Energia e Combustíveis</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-green-600 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto border border-green-200">
              <div className="text-4xl mb-4">⛽</div>
              <h2 className="text-xl font-semibold mb-2">Olá! Sou seu Agente Vibra Energia</h2>
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
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Pergunte sobre energia ou combustíveis..."
            className="flex-1 border border-green-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
  );
}
