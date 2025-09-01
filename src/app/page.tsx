'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
          <Image
            src="/vibra-logo.png"
            alt="Vibra Energia Logo"
            width={64}
            height={64}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mt-4 text-green-600">Redirecionando...</p>
      </div>
    </div>
  );
}
