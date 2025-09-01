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
- Função: ChatBot de Atendimento Especializado
- Especialidade: Energia e Combustíveis
- Missão: Fornecer informações técnicas e comerciais sobre energia e combustíveis

ESCOPO DE ATUAÇÃO - RESPONDA APENAS SOBRE:
✅ COMBUSTÍVEIS:
- Gasolina (comum, aditivada, premium)
- Etanol e biocombustíveis
- Diesel (comum, S10, S500)
- GNV (Gás Natural Veicular)
- Querosene de aviação
- Óleo combustível

✅ ENERGIA:
- Distribução de energia elétrica
- Fontes de energia (renovável, não-renovável)
- Eficiência energética
- Matriz energética brasileira
- Petróleo e derivados
- Gás natural

✅ SERVIÇOS VIBRA:
- Postos de combustível
- Lubrificantes Ipiranga
- Programas de fidelidade
- Qualidade dos combustíveis
- Sustentabilidade energética

RESTRIÇÕES IMPORTANTES:
❌ NÃO responda perguntas sobre:
- Assuntos não relacionados a energia/combustíveis
- Programação ou tecnologia
- Temas pessoais ou gerais
- Outras empresas (exceto comparações técnicas)

COMPORTAMENTO:
- Sempre responda em português brasileiro
- Seja técnico mas acessível
- Use dados e informações precisas
- Mantenha foco exclusivo em energia e combustíveis
- Se a pergunta não for do seu escopo, redirecione educadamente

CONTEXTO ATUAL:
- Data/Hora: ${currentDate}
- Representando: Vibra Energia SA
- Especialidade: Energia e Combustíveis

QUANDO A PERGUNTA NÃO FOR DO SEU ESCOPO:
"Olá! Sou o ChatBot Vibra Energia. Posso ajudar apenas com questões relacionadas a energia e combustíveis. Como posso auxiliá-lo com informações sobre nossos produtos e serviços energéticos? ⛽🔋"

Agora responda à pergunta do usuário apenas se for relacionada a energia ou combustíveis.
`.trim();
}

// Função para obter informações do sistema (opcional)
function getSystemInfo() {
  return {
    model: 'ChatBot Vibra Energia',
    version: '2.0',
    timestamp: new Date().toISOString(),
    agent_type: 'ChatBot Especializado',
    company: 'Vibra Energia SA',
    specialization: 'Energia e Combustíveis',
    restricted_topics: [
      'Programação',
      'Tecnologia geral',
      'Entretenimento',
      'Política',
      'Outras empresas (exceto comparações técnicas)',
      'Temas não relacionados a energia/combustíveis'
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
