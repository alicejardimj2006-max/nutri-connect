// Exporta o plano alimentar em PDF (A4) para impressão ou envio ao paciente.

import type { FullMealPlan } from "./records";
import { mainItems, planTotals, substitutesOf } from "./plan";
import { formatDate, formatNumber, shortTime } from "./format";
import { translateClinical, type ClinicalKey, type Vars } from "./i18n";
import type { Locale } from "@/lib/i18n";

const BRAND = [85, 95, 54] as const; // --primary
const ACCENT = [180, 83, 42] as const; // --accent
const MUTED = [109, 99, 85] as const;
const INK = [52, 45, 36] as const;

export async function exportMealPlanPdf(input: {
  plan: FullMealPlan;
  patientName: string;
  professional: { name: string; council?: string; registration?: string; uf?: string };
  locale: Locale;
}) {
  const { jsPDF } = await import("jspdf");
  const { plan, locale } = input;
  const t = (k: ClinicalKey, v?: Vars) => translateClinical(locale, k, v);
  const n = (v: number, d = 0) => formatNumber(v, locale, d);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  let y = 0;

  const ensure = (space: number) => {
    if (y + space > H - 18) {
      doc.addPage();
      y = M;
    }
  };
  const color = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);

  // Cabeçalho
  doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
  doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(252, 251, 247);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("NutriConnect", M, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(t("plan.title"), M, 20);
  doc.setFontSize(9);
  doc.text(formatDate(new Date(), locale), W - M, 13, { align: "right" });
  y = 40;

  color(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(plan.title, M, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  color(MUTED);
  const pro = input.professional;
  const reg = pro.council
    ? ` · ${pro.council} ${pro.registration ?? ""}${pro.uf ? `/${pro.uf}` : ""}`
    : "";
  doc.text(`${t("pdf.patient")}: ${input.patientName}`, M, y);
  y += 5;
  doc.text(`${t("pdf.professional")}: ${pro.name}${reg}`, M, y);
  y += 5;
  if (plan.starts_on) {
    doc.text(
      `${t("pdf.validFrom")}: ${formatDate(plan.starts_on, locale)}${plan.ends_on ? ` — ${formatDate(plan.ends_on, locale)}` : ""}`,
      M,
      y,
    );
    y += 5;
  }

  // Totais x metas
  const totals = planTotals(plan);
  y += 2;
  doc.setDrawColor(230, 225, 214);
  doc.setFillColor(240, 235, 225);
  doc.roundedRect(M, y, W - 2 * M, 14, 2, 2, "F");
  const cells = [
    [
      t("plan.energy"),
      `${n(totals.kcal)}${plan.target_kcal ? ` / ${n(plan.target_kcal)}` : ""} kcal`,
    ],
    [
      t("plan.protein"),
      `${n(totals.protein_g)}${plan.target_protein_g ? ` / ${n(plan.target_protein_g)}` : ""} g`,
    ],
    [
      t("plan.carbs"),
      `${n(totals.carbs_g)}${plan.target_carbs_g ? ` / ${n(plan.target_carbs_g)}` : ""} g`,
    ],
    [t("plan.fat"), `${n(totals.fat_g)}${plan.target_fat_g ? ` / ${n(plan.target_fat_g)}` : ""} g`],
  ];
  const cw = (W - 2 * M) / cells.length;
  cells.forEach(([label, value], i) => {
    const x = M + 4 + i * cw;
    doc.setFontSize(8);
    color(MUTED);
    doc.text(label, x, y + 5.5);
    doc.setFontSize(10);
    color(INK);
    doc.setFont("helvetica", "bold");
    doc.text(value, x, y + 11);
    doc.setFont("helvetica", "normal");
  });
  y += 22;

  // Refeições
  for (const meal of plan.meals) {
    const mains = mainItems(meal.items);
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    color(BRAND);
    doc.text(meal.name, M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    color(MUTED);
    const mealKcal = mains.reduce((a, i) => a + Number(i.kcal), 0);
    doc.text(
      [
        meal.time_of_day ? shortTime(meal.time_of_day) : "",
        mains.length ? `${n(mealKcal)} kcal` : "",
      ]
        .filter(Boolean)
        .join("  ·  "),
      W - M,
      y,
      { align: "right" },
    );
    y += 2;
    doc.setDrawColor(BRAND[0], BRAND[1], BRAND[2]);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 5;

    const itemLine = (label: string, kcal: number, indent: number, prefix?: string) => {
      const lines = doc.splitTextToSize(label, W - 2 * M - indent - 22) as string[];
      ensure(lines.length * 4.6 + 1);
      if (prefix) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        color(ACCENT);
        doc.text(prefix, M + indent - 6, y);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      color(prefix ? MUTED : INK);
      doc.text(lines, M + indent, y);
      doc.setFontSize(9);
      color(MUTED);
      doc.text(`${n(kcal)} kcal`, W - M, y, { align: "right" });
      y += lines.length * 4.6 + 0.8;
    };
    const describe = (i: (typeof mains)[number]) =>
      i.household_measure
        ? `${i.household_measure} ${t("pdf.of")} ${i.food_name} (${n(Number(i.quantity_g))} g)`
        : `${n(Number(i.quantity_g))} g ${t("pdf.of")} ${i.food_name}`;

    if (!mains.length) {
      doc.setFontSize(10);
      color(MUTED);
      doc.text(t("plan.emptyMeal"), M, y);
      y += 5;
    }
    for (const item of mains) {
      itemLine(`• ${describe(item)}`, Number(item.kcal), 0);
      for (const sub of substitutesOf(meal.items, item.id)) {
        itemLine(describe(sub), Number(sub.kcal), 12, t("plan.or").toUpperCase());
      }
    }
    if (meal.notes) {
      const lines = doc.splitTextToSize(meal.notes, W - 2 * M) as string[];
      ensure(lines.length * 4.4 + 2);
      doc.setFontSize(9);
      color(MUTED);
      doc.text(lines, M, y);
      y += lines.length * 4.4;
    }
    y += 5;
  }

  if (plan.guidelines) {
    ensure(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    color(ACCENT);
    doc.text(t("plan.guidelines"), M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    color(INK);
    for (const paragraph of plan.guidelines.split("\n")) {
      const lines = doc.splitTextToSize(paragraph, W - 2 * M) as string[];
      ensure(lines.length * 4.8);
      doc.text(lines, M, y);
      y += lines.length * 4.8 + 1;
    }
  }

  // Rodapé
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    color(MUTED);
    doc.text(t("pdf.footer"), M, H - 8);
    doc.text(`${p}/${pages}`, W - M, H - 8, { align: "right" });
  }

  const safe = `${plan.title}-${input.patientName}`
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  doc.save(`${safe}.pdf`);
}
