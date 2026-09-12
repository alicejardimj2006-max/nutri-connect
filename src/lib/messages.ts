// Persistent messaging system & Support AI Bot for NutriConnect

export interface ChatMessage {
  id: string;
  sender: "me" | "them" | "support";
  text: string;
  time: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online?: boolean;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const STORAGE_KEY = "nutriconnect_chat_messages_v1";

// Initial seed conversations
const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: "suporte",
    name: "Suporte NutriConnect",
    role: "Atendimento & Assistente 24h",
    online: true,
    lastMessage: "Olá! Como posso ajudar você hoje?",
    lastTime: "Agora",
    unread: 0,
  },
  {
    id: "dra-camila",
    name: "Dra. Camila Jardim",
    role: "Nutricionista Principal (CRN-3 48921)",
    online: true,
    lastMessage: "Ótimo progresso na meta de hidratação!",
    lastTime: "14:32",
    unread: 0,
  },
  {
    id: "dra-maria",
    name: "Dra. Maria Lorena",
    role: "Especialista em Nutrição Esportiva",
    online: false,
    lastMessage: "Tente manter o aporte proteico no pós-treino.",
    lastTime: "Ontem",
    unread: 0,
  },
];

// Initial seed messages for each conversation
const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  suporte: [
    {
      id: "sup-1",
      sender: "support",
      text: "Olá! Seja bem-vindo(a) ao Suporte NutriConnect 🌿. Como posso te ajudar hoje? Pode perguntar sobre consultas, planos alimentares, substituições ou suporte técnico!",
      time: "10:00",
    },
  ],
  "dra-camila": [
    {
      id: "cam-1",
      sender: "them",
      text: "Olá! Como está sendo a adaptação ao seu novo plano alimentar nesta semana?",
      time: "14:28",
    },
    {
      id: "cam-2",
      sender: "me",
      text: "Oi Dra.! Consegui fazer as substituições no almoço. Fiquei apenas com dúvida na ceia.",
      time: "14:30",
    },
    {
      id: "cam-3",
      sender: "them",
      text: "Que excelente notícia! Na ceia você pode variar entre o chá de camomila ou um punhado pequeno de castanhas se sentir fome.",
      time: "14:32",
    },
  ],
  "dra-maria": [
    {
      id: "mar-1",
      sender: "them",
      text: "Oi! Vi seu último registro de treino. Lembre de ingerir bastante água durante a atividade.",
      time: "Ontem 16:45",
    },
  ],
};

// Retrieve messages from localStorage or default
export function getMessages(conversationId: string): ChatMessage[] {
  if (typeof window === "undefined") return DEFAULT_MESSAGES[conversationId] || [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_msgs_${conversationId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading chat messages", e);
  }
  return DEFAULT_MESSAGES[conversationId] || [];
}

// Save messages to localStorage
export function saveMessages(conversationId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_msgs_${conversationId}`, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent("nutri-chat-update", { detail: { conversationId } }));
  } catch (e) {
    console.error("Error saving chat messages", e);
  }
}

// Retrieve conversations list
export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return DEFAULT_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_conversations`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading conversations list", e);
  }
  return DEFAULT_CONVERSATIONS;
}

// Save conversations list
export function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_conversations`, JSON.stringify(conversations));
    window.dispatchEvent(new Event("nutri-conversations-update"));
  } catch (e) {
    console.error("Error saving conversations", e);
  }
}

// Intelligent response generator for Suporte NutriConnect
export function generateSupportBotReply(userQuestion: string): string {
  const q = userQuestion.toLowerCase().trim();

  if (q.includes("senha") || q.includes("esqueci") || q.includes("recuperar")) {
    return "🔐 Para recuperar ou redefinir sua senha, acesse a página de login e clique em 'Esqueceu a senha?' ou vá para /recuperar-senha. Você receberá um código de 6 dígitos no seu e-mail cadastrado!";
  }

  if (q.includes("plano") || q.includes("dieta") || q.includes("cardapio") || q.includes("cardápio")) {
    return "🥗 Seu plano alimentar pode ser acessado na aba 'Plano Alimentar' do seu painel. Lá você encontra as opções de refeição, calculador de calorias e a tabela com opções de substituição de alimentos!";
  }

  if (q.includes("agend") || q.includes("consulta") || q.includes("marcar") || q.includes("horario") || q.includes("horário")) {
    return "📅 Para agendar ou remarcar uma consulta, acesse a aba 'Agendamentos' no seu perfil ou vá na página de 'Profissionais'. Lá você pode escolher o melhor dia e horário disponível na agenda do seu nutricionista!";
  }

  if (q.includes("preco") || q.includes("preço") || q.includes("valor") || q.includes("pagamento") || q.includes("pix")) {
    return "💳 O uso da plataforma é gratuito para acompanhamento básico! Oferecemos o plano Paciente Premium por R$ 29/mês (com NutriAI ilimitada) e o plano Nutricionista Pro por R$ 89/mês. Aceitamos PIX e cartão de crédito.";
  }

  if (q.includes("agua") || q.includes("água") || q.includes("meta") || q.includes("hidrata")) {
    return "💧 A meta padrão sugerida de consumo de água é entre 35ml e 40ml por kg de peso corporal (aprox. 2.5 litros/dia). Você pode registrar o progresso no seu painel diário!";
  }

  if (q.includes("substitu") || q.includes("trocar") || q.includes("troca")) {
    return "🔄 Caso precise trocar um alimento da sua dieta (ex: trocar frango por peixe ou pão por tapioca), clique no botão de substituição ao lado do alimento no seu Plano Alimentar. As equivalências calóricas são calculadas automaticamente!";
  }

  if (q.includes("desafio") || q.includes("comunidade") || q.includes("post")) {
    return "🏆 No 'Espaço de Hoje' e na aba 'Desafios', você pode interagir com outros membros da comunidade, marcar presença em desafios semanais de hábitos e compartilhar suas receitas caseiras!";
  }

  if (q.includes("cancelar") || q.includes("reembolso")) {
    return "ℹ️ Cancelamentos de assinatura podem ser feitos a qualquer momento em 'Configurações > Conta' sem fidelidade ou taxas adicionais.";
  }

  return `🤖 Recebi sua mensagem: "${userQuestion}". Entendi sua dúvida! Nossa equipe de atendimento e assistentes nutricionais registraram essa solicitação. Se precisar de uma prescrição médica específica, não deixe de agendar com sua nutricionista responsável!`;
}

// Main function to send a message and trigger response if chatting with Support or Nutritionist
export function sendMessage(conversationId: string, text: string): ChatMessage {
  const current = getMessages(conversationId);
  const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: "me",
    text,
    time: nowTime,
  };

  const updatedMsgs = [...current, userMsg];
  saveMessages(conversationId, updatedMsgs);

  // Update conversation last message in list
  const convs = getConversations();
  const convIdx = convs.findIndex((c) => c.id === conversationId);
  if (convIdx !== -1) {
    convs[convIdx].lastMessage = text;
    convs[convIdx].lastTime = nowTime;
    saveConversations(convs);
  }

  // Trigger Automatic Bot / Nutritionist Response if Support or Active Contact
  setTimeout(() => {
    let replyText = "";
    if (conversationId === "suporte") {
      replyText = generateSupportBotReply(text);
    } else {
      replyText = `Olá! Recebi sua mensagem: "${text}". Já anotei no seu prontuário e estou avaliando a melhor recomendação para o seu plano! 💚`;
    }

    const replyMsg: ChatMessage = {
      id: `msg-reply-${Date.now()}`,
      sender: conversationId === "suporte" ? "support" : "them",
      text: replyText,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const msgsWithReply = [...getMessages(conversationId), replyMsg];
    saveMessages(conversationId, msgsWithReply);

    // Update conversation summary again
    const latestConvs = getConversations();
    const idx = latestConvs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      latestConvs[idx].lastMessage = replyText;
      latestConvs[idx].lastTime = replyMsg.time;
      saveConversations(latestConvs);
    }
  }, 1000);

  return userMsg;
}
