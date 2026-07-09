import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/nutricionista/mensagens")({
  component: Chat,
});

const conversas = [
  { id: 1, nome: "Ana Souza", ultima: "Obrigada!", hora: "10:12", unread: 0 },
  { id: 2, nome: "João Silva", ultima: "Consegui seguir o cardápio.", hora: "14:31", unread: 1 },
  { id: 3, nome: "Bruno Lima", ultima: "Posso trocar o lanche?", hora: "Ontem", unread: 3 },
];

function Chat() {
  const [active, setActive] = useState(2);
  const [text, setText] = useState("");
  const [list, setList] = useState([
    { from: "them", t: "Oi doutora, consegui seguir o cardápio!", h: "14:31" },
    { from: "me", t: "Que ótimo, João! Como se sentiu?", h: "14:32" },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setList([...list, { from: "me", t: text, h: "agora" }]);
    setText("");
  };

  return (
    <div className="grid h-[calc(100vh-10rem)] gap-4 overflow-hidden rounded-2xl border bg-card shadow-card md:grid-cols-[280px_1fr]">
      <aside className="border-r">
        <div className="border-b p-4"><h2 className="font-semibold">Pacientes</h2></div>
        <ul>
          {conversas.map((c) => (
            <li key={c.id}>
              <button onClick={() => setActive(c.id)} className={`w-full border-b p-4 text-left transition ${active === c.id ? "bg-accent" : "hover:bg-secondary"}`}>
                <div className="flex items-center justify-between"><div className="text-sm font-semibold">{c.nome}</div><div className="text-xs text-muted-foreground">{c.hora}</div></div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">{c.ultima}</p>
                  {c.unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex min-w-0 flex-col">
        <div className="border-b p-4"><div className="font-semibold">{conversas.find((c) => c.id === active)?.nome}</div><div className="text-xs text-muted-foreground">Paciente</div></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {list.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                <p>{m.t}</p><div className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.h}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Digite uma mensagem…" className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:border-primary" />
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><Send className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
}
