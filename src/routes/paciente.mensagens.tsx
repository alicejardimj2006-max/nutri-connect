import { createFileRoute } from "@tanstack/react-router";
import { Send, Image, CheckCheck, Sparkles, Bot, User, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getConversations,
  getMessages,
  sendMessage,
  type Conversation,
  type ChatMessage,
} from "@/lib/messages";

export const Route = createFileRoute("/paciente/mensagens")({
  component: Mensagens,
});

const quickChips = [
  "📸 Enviar foto da refeição",
  "❓ Dúvida sobre substituição",
  "💧 Registrei 2.5L de água hoje!",
  "⏰ Como funciona o agendamento?",
];

function Mensagens() {
  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("suporte");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load conversations and messages on mount and subscribe to updates
  useEffect(() => {
    const loadData = () => {
      const convList = getConversations();
      setConversas(convList);
      if (!activeId && convList.length > 0) {
        setActiveId(convList[0].id);
      }
    };

    loadData();

    const handleChatUpdate = () => {
      setConversas(getConversations());
      if (activeId) {
        setMessages(getMessages(activeId));
      }
    };

    window.addEventListener("nutri-chat-update", handleChatUpdate);
    window.addEventListener("nutri-conversations-update", handleChatUpdate);

    return () => {
      window.removeEventListener("nutri-chat-update", handleChatUpdate);
      window.removeEventListener("nutri-conversations-update", handleChatUpdate);
    };
  }, [activeId]);

  // Sync messages when active contact changes
  useEffect(() => {
    if (activeId) {
      setMessages(getMessages(activeId));
    }
  }, [activeId]);

  const handleSend = (customText?: string) => {
    const content = customText || text;
    if (!content.trim()) return;

    sendMessage(activeId, content.trim());
    if (!customText) setText("");
  };

  const activeConv = conversas.find((c) => c.id === activeId) || conversas[0];

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-4 overflow-hidden rounded-3xl border bg-card shadow-card md:grid-cols-[300px_1fr]">
      {/* SIDEBAR DE CONVERSAS */}
      <aside className="border-r border-border/80 flex flex-col">
        <div className="border-b border-border/80 p-4">
          <h2 className="font-display text-lg font-bold">Suas Mensagens & Suporte</h2>
          <p className="text-xs text-muted-foreground">Conversas salvas no seu perfil</p>
        </div>
        <ul className="divide-y divide-border/60 overflow-y-auto flex-1">
          {conversas.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={`w-full p-4 text-left transition ${
                  activeId === c.id ? "bg-primary-soft/40 border-l-4 border-primary" : "hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.online && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                    <span className="text-sm font-bold text-foreground">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.lastTime}</span>
                </div>
                <div className="text-xs text-primary font-medium mt-0.5">{c.role}</div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ÁREA DE CHAT */}
      <section className="flex min-w-0 flex-col bg-background/50">
        {/* HEADER DO CHAT */}
        <div className="border-b border-border/80 p-4 bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary font-bold text-sm">
              {activeConv?.id === "suporte" ? <Bot className="h-5 w-5 text-accent" /> : activeConv?.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{activeConv?.name}</div>
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Respostas salvas automaticamente
              </div>
            </div>
          </div>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-3xl px-5 py-3 text-xs sm:text-sm shadow-xs ${
                  m.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : m.sender === "support"
                    ? "bg-accent-soft/60 border border-accent/30 text-foreground rounded-bl-none"
                    : "bg-card border border-border text-foreground rounded-bl-none"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                <div
                  className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                    m.sender === "me" ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  <span>{m.time}</span>
                  {m.sender === "me" && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHIPS DE ATALHO RÁPIDO */}
        <div className="px-4 py-2 bg-card/60 border-t border-border/40 flex items-center gap-2 overflow-x-auto">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="rounded-full border bg-background px-3 py-1 text-[11px] font-medium text-foreground hover:bg-primary-soft hover:text-primary transition shrink-0 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* INPUT DE MENSAGEM */}
        <div className="flex items-center gap-2 border-t border-border/80 bg-card p-4">
          <button
            onClick={() => toast.info("Simulação: Imagem ou comprovante anexado.")}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary transition cursor-pointer"
            title="Anexar Imagem"
          >
            <Image className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              activeId === "suporte"
                ? "Pergunte algo ao Suporte NutriConnect (ex: planos, senha, água, consultas)..."
                : "Escreva sua mensagem..."
            }
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => handleSend()}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}


