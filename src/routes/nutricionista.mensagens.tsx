import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, Search, CheckCheck, UtensilsCrossed, Paperclip, Bot, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getConversations,
  getMessages,
  sendMessage,
  type Conversation,
  type ChatMessage,
} from "@/lib/messages";

export const Route = createFileRoute("/nutricionista/mensagens")({
  component: Chat,
});

const presetReplies = [
  "👏 Parabéns pela constância! Continue assim.",
  "💧 Lembre-se de manter a hidratação diária.",
  "🥗 Pode fazer essa substituição sem problemas!",
  "📋 Atualizei as observações no seu plano alimentar.",
];

function Chat() {
  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("dra-camila");
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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

  useEffect(() => {
    if (activeId) {
      setMessages(getMessages(activeId));
    }
  }, [activeId]);

  const filteredConversas = conversas.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const currentPaciente = conversas.find((c) => c.id === activeId) || conversas[0];

  const handleSend = (customContent?: string) => {
    const msgText = customContent || text;
    if (!msgText.trim()) return;

    sendMessage(activeId, msgText.trim());
    if (!customContent) setText("");
  };

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-4 overflow-hidden rounded-3xl border bg-card shadow-card md:grid-cols-[300px_1fr]">
      {/* SIDEBAR PACIENTES */}
      <aside className="border-r border-border/80 flex flex-col">
        <div className="border-b border-border/80 p-4 space-y-3">
          <h2 className="font-display text-lg font-bold">Mensagens dos Pacientes</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por paciente..."
              className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        <ul className="divide-y divide-border/60 overflow-y-auto flex-1">
          {filteredConversas.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={`w-full p-4 text-left transition ${
                  activeId === c.id ? "bg-primary-soft/40 border-l-4 border-primary" : "hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{c.name}</span>
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

      {/* PAINEL DE CHAT */}
      <section className="flex min-w-0 flex-col bg-background/50">
        {/* HEADER DO PACIENTE ATIVO */}
        <div className="border-b border-border/80 p-4 bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {currentPaciente?.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{currentPaciente?.name}</div>
              <div className="text-xs text-muted-foreground">{currentPaciente?.role}</div>
            </div>
          </div>

          <Link
            to="/nutricionista/planos"
            className="rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-semibold hover:bg-secondary/80 flex items-center gap-1.5"
          >
            <UtensilsCrossed className="h-3.5 w-3.5 text-primary" /> Prescrever Plano Alimentar
          </Link>
        </div>

        {/* MENSAGENS */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] md:max-w-[65%] rounded-3xl px-5 py-3 text-xs sm:text-sm shadow-xs ${
                  m.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
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

        {/* RESPOSTAS RÁPIDAS PRE-DEFINIDAS */}
        <div className="px-4 py-2 bg-card/60 border-t border-border/40 flex items-center gap-2 overflow-x-auto">
          {presetReplies.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="rounded-full border bg-background px-3 py-1 text-[11px] font-medium text-foreground hover:bg-primary-soft hover:text-primary transition shrink-0 cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* CAIXA DE ENVIO */}
        <div className="flex items-center gap-2 border-t border-border/80 bg-card p-4">
          <button
            onClick={() => toast.info("Anexando arquivo ao prontuário do paciente...")}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary transition"
            title="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Responder para ${currentPaciente?.name.split(" ")[0]}...`}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => handleSend()}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}


