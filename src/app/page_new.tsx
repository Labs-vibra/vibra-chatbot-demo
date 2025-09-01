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
        <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-2xl font-bold">V</span>
        </div>
        <p className="mt-4 text-green-600">Redirecionando...</p>
      </div>
    </div>
  );
}
