import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** A IA não aprovou o conteúdo: nada foi salvo. `message` já vem pronta para mostrar à pessoa. */
export class ContentRejectedError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "ContentRejectedError";
  }
}

export interface PostCheckInput {
  kind: "post";
  title?: string | null;
  body: string;
  tags: string[];
  recipe?: unknown;
  /** Foto como data URL, ou endereço de uma foto já enviada pela própria pessoa. */
  image?: string | null;
}

export interface CommentCheckInput {
  kind: "comment";
  postId: string;
  body: string;
}

export interface Approved {
  imageUrl: string | null;
  title: string | null;
  body: string;
  tags: string[];
}

interface Reply {
  ok?: boolean;
  approved?: boolean;
  code?: string;
  message?: string;
  imageUrl?: string | null;
  title?: string | null;
  body?: string;
  tags?: string[];
}

const UNAVAILABLE = "Não foi possível analisar o conteúdo agora. Tente de novo em instantes.";

/**
 * Manda o conteúdo para a análise da IA ANTES de salvar. Só devolve se foi aprovado (e então o banco
 * aceita exatamente estes valores); reprovado ou IA fora do ar lança erro e nada é publicado.
 */
export async function checkContent(input: PostCheckInput | CommentCheckInput): Promise<Approved> {
  const { data, error } = await supabase.functions.invoke<Reply>("check-content", { body: input });
  if (error) {
    let message = UNAVAILABLE;
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload?.error) message = payload.error;
    }
    throw new Error(message);
  }
  if (!data || data.ok === false) throw new Error(data?.message || UNAVAILABLE);
  if (!data.approved) {
    throw new ContentRejectedError(data.message || "Este conteúdo não pode ser publicado.", data.code ?? "inadequado");
  }
  return {
    imageUrl: data.imageUrl ?? null,
    title: data.title ?? null,
    body: data.body ?? "",
    tags: data.tags ?? [],
  };
}
