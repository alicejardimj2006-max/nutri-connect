import { createContext } from "react";

/** Fotos publicadas no painel (índice do integrante → URL); vazio mostra as fotos do código. */
export const AvatarContext = createContext<Record<string, string>>({});
