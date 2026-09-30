import type { ClinicalKey } from "./i18n";

const KNOWN_METHODS = [
  "pix",
  "dinheiro",
  "cartao",
  "transferencia",
  "credit_card",
  "debit_card",
  "account_money",
  "ticket",
];

/** Nome legível do meio de pagamento (manual ou vindo do Mercado Pago). */
export function methodLabel(method: string, t: (k: ClinicalKey) => string): string {
  return KNOWN_METHODS.includes(method) ? t(`payment.method.${method}` as ClinicalKey) : method;
}
