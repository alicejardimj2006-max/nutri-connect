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
      text: "Olá! Seja bem-vindo(a) à sua Jornada NutriConnect 🌿. Como posso ajudar você hoje? Fique à vontade para perguntar sobre sua jornada alimentar, comunidades, receitas ou dúvidas com a plataforma!",
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
    return "🔐 Para recuperar sua senha, acesse a página inicial e clique em 'Esqueceu a senha?' ou vá para /recuperar-senha. Nós enviaremos um link de acesso para o seu e-mail com toda a segurança!";
  }

  if (
    q.includes("plano") ||
    q.includes("dieta") ||
    q.includes("cardapio") ||
    q.includes("cardápio")
  ) {
    return "🥗 Seu plano alimentar agora faz parte da sua 'Minha Jornada'. Nele você encontra inspirações de refeição e trocas inteligentes, tudo pensado para respeitar o seu ritmo, sem dietas restritivas!";
  }

  if (
    q.includes("agend") ||
    q.includes("consulta") ||
    q.includes("marcar") ||
    q.includes("horario") ||
    q.includes("horário")
  ) {
    return "📅 Você pode agendar ou remarcar um encontro com seu profissional acessando a área 'Agendamentos' na sua Jornada. É só escolher o dia e horário que melhor se encaixam na sua rotina!";
  }

  if (
    q.includes("preco") ||
    q.includes("preço") ||
    q.includes("valor") ||
    q.includes("pagamento") ||
    q.includes("pix")
  ) {
    return "💳 O acesso à comunidade e às funcionalidades básicas da sua Jornada é gratuito! Caso tenha interesse em ferramentas avançadas, temos planos acessíveis para você e para profissionais da nutrição.";
  }

  if (q.includes("agua") || q.includes("água") || q.includes("meta") || q.includes("hidrata")) {
    return "💧 Uma hidratação constante é um lindo passo na sua jornada. A sugestão inicial costuma ser entre 35ml a 40ml por kg de peso, mas ouça o seu corpo e vá adaptando aos poucos!";
  }

  if (
    q.includes("substitu") ||
    q.includes("trocar") ||
    q.includes("troca") ||
    q.includes("vontade")
  ) {
    return "🔄 Na sua Jornada, nós abraçamos a flexibilidade. Você pode trocar alimentos no seu plano buscando o que mais te acolhe no dia. Explore também o 'Espaço de Hoje' para encontrar receitas inspiradoras!";
  }

  if (
    q.includes("desafio") ||
    q.includes("comunidade") ||
    q.includes("post") ||
    q.includes("tema")
  ) {
    return "🏆 O 'Espaço de Hoje' e os 'Temas da Semana' são o coração pulsante da nossa comunidade. Participe sem medo, compartilhe suas experiências e celebre cada pequeno passo com pessoas reais!";
  }

  if (q.includes("cancelar") || q.includes("reembolso")) {
    return "ℹ️ Entendemos que as rotinas mudam. Você pode cancelar qualquer assinatura em 'Configurações > Conta' de forma simples e acolhedora, sem burocracias.";
  }

  return `🌿 Entendi sua dúvida! Recebemos sua mensagem: "${userQuestion}". Nossa equipe e os profissionais da comunidade estão aqui para te apoiar. Lembre-se, cada jornada é única e estamos juntos nessa caminhada!`;
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
      replyText = `Olá! Recebi sua mensagem: "${text}". Já anotei aqui com carinho e estou avaliando a melhor sugestão para a sua jornada! 💚`;
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
