import { StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Função que retorna o contexto para a IA
function getAIContext(): string {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
Você é o ChatBot Vibra Energia da VIBRA ENERGIA SA. Aqui estão suas diretrizes obrigatórias:

IDENTIDADE CORPORATIVA:
- Empresa: Vibra Energia SA
- Função: ChatBot Especializado em Combustíveis e Regulamentações ANP
- Especialidade: Combustíveis, Derivados de Petróleo e Regulamentações ANP
- Missão: Fornecer informações técnicas sobre combustíveis e conformidade regulatória ANP

ESCOPO DE ATUAÇÃO - RESPONDA APENAS SOBRE:
✅ COMBUSTÍVEIS E DERIVADOS:
- Gasolina (comum, aditivada, premium) - especificações ANP
- Etanol hidratado e anidro - normas de qualidade
- Diesel (comum, S10, S500) - padrões de enxofre
- GNV (Gás Natural Veicular) - regulamentações de segurança
- Querosene de aviação (QAV) - especificações técnicas
- Óleo combustível - viscosidade e teor de enxofre
- GLP (Gás Liquefeito de Petróleo) - normas de distribuição

✅ REGULAMENTAÇÕES ANP:
- Resoluções ANP para combustíveis
- Especificações técnicas de qualidade
- Procedimentos de fiscalização
- Normas de armazenamento e distribuição
- Certificações e autorizações
- Laudos de qualidade e conformidade
- Infrações e penalidades ANP

✅ SERVIÇOS VIBRA ESPECIALIZADOS:
- Postos de combustível - conformidade ANP
- Lubrificantes Ipiranga - especificações técnicas
- Controle de qualidade de combustíveis
- Laboratórios de análise
- Programas de monitoramento
- Sustentabilidade em combustíveis

RESTRIÇÕES IMPORTANTES:
❌ NÃO responda perguntas sobre:
- Assuntos não relacionados a combustíveis/ANP
- Energia elétrica ou fontes renováveis
- Programação ou tecnologia
- Temas pessoais ou gerais
- Outras empresas (exceto comparações técnicas de combustíveis)
- Política, esportes, entretenimento
- Energia elétrica ou renováveis (fora do escopo combustíveis)

COMPORTAMENTO:
- Sempre responda em português brasileiro
- Seja técnico mas acessível
- Use dados e informações precisas sobre combustíveis e ANP
- Mantenha foco exclusivo em combustíveis e regulamentações ANP
- Cite resoluções ANP quando relevante
- Se a pergunta não for do seu escopo, redirecione educadamente

CONTEXTO ATUAL:
- Data/Hora: ${currentDate}
- Representando: Vibra Energia SA
- Especialidade: Combustíveis e Regulamentações ANP
- Referência: Agência Nacional do Petróleo, Gás Natural e Biocombustíveis

QUANDO A PERGUNTA NÃO FOR DO SEU ESCOPO:
"Olá! Sou o ChatBot Vibra Energia, especializado em combustíveis e regulamentações da ANP. Posso ajudar apenas com questões relacionadas a combustíveis, derivados de petróleo e normas da Agência Nacional do Petróleo. Como posso auxiliá-lo com informações sobre combustíveis e conformidade regulatória? ⛽🛡️"

Agora responda à pergunta do usuário apenas se for relacionada a combustíveis ou regulamentações ANP.
`.trim();
}

// Função para obter informações do sistema (opcional)
function getSystemInfo(): object {
  return {
    timestamp: new Date().toISOString(),
    company: 'Vibra Energia SA',
    agent_type: 'ChatBot Especializado em Combustíveis e ANP',
    specialization: 'Combustíveis, Derivados de Petróleo e Regulamentações ANP',
    version: '1.0.0',
    model: 'gemini-1.5-pro',
    framework: 'Next.js 15',
    ai_sdk: 'Vercel AI SDK v2.2.37',
    theme: 'Verde/Green (Vibra)',
    anp_reference: 'Agência Nacional do Petróleo, Gás Natural e Biocombustíveis',
    allowed_topics: [
      'Gasolina e especificações ANP',
      'Etanol hidratado e anidro',
      'Diesel S10, S500 e padrões de enxofre',
      'GNV e regulamentações de segurança',
      'Querosene de aviação (QAV)',
      'Óleo combustível e viscosidade',
      'GLP e normas de distribuição',
      'Resoluções ANP',
      'Especificações técnicas de qualidade',
      'Procedimentos de fiscalização ANP',
      'Normas de armazenamento',
      'Certificações e autorizações',
      'Laudos de qualidade',
      'Infrações e penalidades ANP',
      'Lubrificantes Ipiranga',
      'Controle de qualidade combustíveis'
    ],
    restricted_topics: [
      'Energia elétrica ou fontes renováveis',
      'Programação e tecnologia',
      'Assuntos pessoais',
      'Entretenimento',
      'Política',
      'Outras empresas (exceto comparações técnicas de combustíveis)',
      'Temas não relacionados a combustíveis/ANP',
      'Matriz energética geral (fora do escopo combustíveis)'
    ]
  };
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Obter contexto da IA
    const aiContext = getAIContext();

    // Processar mensagens e detectar contexto de conversas anteriores
    const processedMessages = [...messages];
    let conversationHistory = '';

    // Verificar se a última mensagem do usuário contém contexto de conversas anteriores
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const content = lastUserMessage.content;

      // Detectar se há contexto de conversas anteriores
      if (content.includes('Contexto de conversas anteriores:')) {
        const parts = content.split('Pergunta atual:');
        if (parts.length === 2) {
          conversationHistory = parts[0].trim();
          const actualQuestion = parts[1].trim();

          // Atualizar a última mensagem apenas com a pergunta atual
          processedMessages[processedMessages.length - 1] = {
            ...lastUserMessage,
            content: actualQuestion
          };
        }
      }
    }

    // Construir a conversa completa com contexto
    let fullConversation = aiContext + '\n\n';

    // Adicionar histórico de conversas anteriores se existir
    if (conversationHistory) {
      fullConversation += `HISTÓRICO DE CONVERSAS RELACIONADAS:\n${conversationHistory}\n\n`;
      fullConversation += 'Use este histórico como contexto adicional para fornecer respostas mais precisas e personalizadas, referenciando conversas anteriores quando relevante.\n\n';
    }

    fullConversation += 'CONVERSA ATUAL:\n';

    // Adicionar mensagens da conversa atual
    processedMessages.forEach((message: { role: string; content: string }) => {
      if (message.role === 'user') {
        fullConversation += `USUÁRIO: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        fullConversation += `ASSISTENTE: ${message.content}\n\n`;
      }
    });

    // Adicionar prompt para resposta
    fullConversation += 'ASSISTENTE: ';

    const result = await model.generateContentStream(fullConversation);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Erro na API do chatbot:', error);
    return new Response('Erro interno do servidor', { status: 500 });
  }
}

// Endpoint GET para debugar o contexto (opcional)
export async function GET() {
  try {
    const context = getAIContext();
    const systemInfo = getSystemInfo();

    return Response.json({
      context,
      systemInfo,
      status: 'Context loaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter contexto:', error);
    return Response.json({ error: 'Erro ao obter contexto' }, { status: 500 });
  }
}
