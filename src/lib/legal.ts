// Dados legais da plataforma. Preencha os campos vazios com os dados reais da empresa antes de
// divulgar o site: eles aparecem no rodapé e nos Termos/Política de Privacidade (Decreto 7.962/2013
// e LGPD exigem identificar quem opera o serviço e quem é o encarregado de dados).
export const COMPANY = {
  /** Nome de fantasia. */
  name: "NutriConnect",
  /** Razão social, como no CNPJ. Ex.: "NutriConnect Tecnologia Ltda." */
  legalName: "",
  /** CNPJ. Ex.: "00.000.000/0001-00" */
  cnpj: "",
  /** Endereço completo da sede. */
  address: "",
  /** Canal geral de atendimento. */
  supportEmail: "suporte@nutriconnect.com.br",
  /** Encarregado pelo tratamento de dados pessoais (DPO), art. 41 da LGPD. */
  dpoName: "",
  dpoEmail: "suporte@nutriconnect.com.br",
} as const;

/**
 * Versão dos Termos e da Política de Privacidade. Mude este valor (AAAA-MM-DD) quando os textos
 * mudarem de forma relevante: todos os usuários voltam a ver o pedido de aceite.
 */
export const LEGAL_VERSION = "2026-10-04";
export const LEGAL_UPDATED_AT = "4 de outubro de 2026";

/** Idade mínima para ter conta própria. */
export const MIN_AGE = 18;

/** true quando a data (AAAA-MM-DD) indica pelo menos MIN_AGE anos completos. */
export function isAdult(birthDate: string, today = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900) return false;
  const limit = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
  return new Date(y, mo - 1, d) <= limit;
}
