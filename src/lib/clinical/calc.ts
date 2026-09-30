// Cálculos antropométricos e energéticos usados no prontuário.
// Referências:
//   IMC — OMS (adultos) e Lipschitz (1994, idosos ≥ 60 anos).
//   Densidade corporal — Jackson & Pollock (1978/1980, 3 e 7 dobras) e
//   Durnin & Womersley (1974, 4 dobras); %G pela equação de Siri (1961).
//   TMB — Harris & Benedict (1919), Mifflin-St Jeor (1990) e FAO/OMS (1985).
//   Risco cardiometabólico — circunferência da cintura (OMS) e RCQ.

export type Sex = "feminino" | "masculino";
export type BodyFatProtocol = "jp3" | "jp7" | "durnin" | "bioimpedancia" | "manual";
export type BmrFormula = "mifflin" | "harris_benedict" | "fao_who";

export type SkinfoldSite =
  | "triceps"
  | "biceps"
  | "subscapular"
  | "suprailiac"
  | "abdominal"
  | "thigh"
  | "chest"
  | "midaxillary";

export type CircumferenceSite =
  "waist" | "hip" | "abdomen" | "arm" | "calf" | "neck" | "chest" | "thigh";

export const CIRCUMFERENCE_SITES: CircumferenceSite[] = [
  "waist",
  "hip",
  "abdomen",
  "arm",
  "calf",
  "neck",
  "chest",
  "thigh",
];

export const ACTIVITY_FACTORS = [
  { value: 1.2, key: "sedentary" },
  { value: 1.375, key: "light" },
  { value: 1.55, key: "moderate" },
  { value: 1.725, key: "intense" },
  { value: 1.9, key: "veryIntense" },
] as const;

/** Dobras exigidas por protocolo (JP3 muda conforme o sexo). */
export function protocolSites(protocol: BodyFatProtocol, sex: Sex | null): SkinfoldSite[] {
  switch (protocol) {
    case "jp3":
      return sex === "masculino"
        ? ["chest", "abdominal", "thigh"]
        : ["triceps", "suprailiac", "thigh"];
    case "jp7":
      return ["chest", "midaxillary", "triceps", "subscapular", "abdominal", "suprailiac", "thigh"];
    case "durnin":
      return ["biceps", "triceps", "subscapular", "suprailiac"];
    default:
      return [];
  }
}

const round = (v: number, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

// ---------------------------------------------------------------------------
// IMC
// ---------------------------------------------------------------------------

export type BmiClass =
  "underweight" | "normal" | "overweight" | "obesity1" | "obesity2" | "obesity3";

export function bmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return round(weightKg / (m * m), 1);
}

export function bmiClass(value: number, age: number | null): BmiClass {
  if (age !== null && age >= 60) {
    if (value < 22) return "underweight";
    if (value <= 27) return "normal";
    return "overweight";
  }
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  if (value < 35) return "obesity1";
  if (value < 40) return "obesity2";
  return "obesity3";
}

// ---------------------------------------------------------------------------
// Composição corporal
// ---------------------------------------------------------------------------

const DURNIN: Record<Sex, { maxAge: number; c: number; m: number }[]> = {
  masculino: [
    { maxAge: 19, c: 1.162, m: 0.063 },
    { maxAge: 29, c: 1.1631, m: 0.0632 },
    { maxAge: 39, c: 1.1422, m: 0.0544 },
    { maxAge: 49, c: 1.162, m: 0.07 },
    { maxAge: Infinity, c: 1.1715, m: 0.0779 },
  ],
  feminino: [
    { maxAge: 19, c: 1.1549, m: 0.0678 },
    { maxAge: 29, c: 1.1599, m: 0.0717 },
    { maxAge: 39, c: 1.1423, m: 0.0632 },
    { maxAge: 49, c: 1.1333, m: 0.0612 },
    { maxAge: Infinity, c: 1.1339, m: 0.0645 },
  ],
};

/** Densidade corporal (g/cm³) pelas dobras; null se faltar alguma medida. */
export function bodyDensity(
  protocol: BodyFatProtocol,
  skinfolds: Partial<Record<SkinfoldSite, number>>,
  sex: Sex | null,
  age: number | null,
): number | null {
  if (!sex || age === null) return null;
  const sites = protocolSites(protocol, sex);
  if (!sites.length) return null;
  const values = sites.map((s) => skinfolds[s]);
  if (values.some((v) => !v || v <= 0)) return null;
  const sum = (values as number[]).reduce((a, b) => a + b, 0);

  switch (protocol) {
    case "jp3":
      return sex === "masculino"
        ? 1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * age
        : 1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * age;
    case "jp7":
      return sex === "masculino"
        ? 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * age
        : 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * age;
    case "durnin": {
      const row = DURNIN[sex].find((r) => age <= r.maxAge)!;
      return row.c - row.m * Math.log10(sum);
    }
    default:
      return null;
  }
}

/** % de gordura pela equação de Siri. */
export function siriBodyFat(density: number): number {
  return round((4.95 / density - 4.5) * 100, 1);
}

export function bodyComposition(weightKg: number, bodyFatPct: number) {
  const fat = round((weightKg * bodyFatPct) / 100, 1);
  return { fatMassKg: fat, leanMassKg: round(weightKg - fat, 1) };
}

// ---------------------------------------------------------------------------
// Gasto energético
// ---------------------------------------------------------------------------

export function bmr(
  formula: BmrFormula,
  weightKg: number,
  heightCm: number | null,
  age: number | null,
  sex: Sex | null,
): number | null {
  if (!weightKg || age === null || !sex) return null;
  const male = sex === "masculino";
  switch (formula) {
    case "mifflin":
      if (!heightCm) return null;
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (male ? 5 : -161));
    case "harris_benedict":
      if (!heightCm) return null;
      return Math.round(
        male
          ? 66.47 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age
          : 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age,
      );
    case "fao_who": {
      const table = male
        ? [
            { max: 17, a: 17.5, b: 651 },
            { max: 29, a: 15.3, b: 679 },
            { max: 59, a: 11.6, b: 879 },
            { max: Infinity, a: 13.5, b: 487 },
          ]
        : [
            { max: 17, a: 12.2, b: 746 },
            { max: 29, a: 14.7, b: 496 },
            { max: 59, a: 8.7, b: 829 },
            { max: Infinity, a: 10.5, b: 596 },
          ];
      const row = table.find((r) => age <= r.max)!;
      return Math.round(row.a * weightKg + row.b);
    }
  }
}

export function tdee(bmrKcal: number | null, activityFactor: number | null): number | null {
  if (!bmrKcal || !activityFactor) return null;
  return Math.round(bmrKcal * activityFactor);
}

// ---------------------------------------------------------------------------
// Risco cardiometabólico
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "high" | "veryHigh";

export function waistRisk(waistCm: number | undefined, sex: Sex | null): RiskLevel | null {
  if (!waistCm || !sex) return null;
  const [high, veryHigh] = sex === "masculino" ? [94, 102] : [80, 88];
  if (waistCm >= veryHigh) return "veryHigh";
  if (waistCm >= high) return "high";
  return "low";
}

export function waistHipRatio(waistCm?: number, hipCm?: number): number | null {
  if (!waistCm || !hipCm) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

export function whrRisk(ratio: number | null, sex: Sex | null): RiskLevel | null {
  if (ratio === null || !sex) return null;
  return ratio > (sex === "masculino" ? 0.9 : 0.85) ? "high" : "low";
}

// ---------------------------------------------------------------------------
// Resumo de uma avaliação (tudo que dá para calcular com o que foi medido)
// ---------------------------------------------------------------------------

export interface AssessmentInput {
  weightKg: number | null;
  heightCm: number | null;
  circumferences: Partial<Record<CircumferenceSite, number>>;
  skinfolds: Partial<Record<SkinfoldSite, number>>;
  protocol: BodyFatProtocol;
  manualBodyFat: number | null;
  activityFactor: number | null;
  bmrFormula: BmrFormula;
  sex: Sex | null;
  age: number | null;
}

export function assess(input: AssessmentInput) {
  const { weightKg, heightCm, sex, age } = input;
  const imc = weightKg && heightCm ? bmi(weightKg, heightCm) : null;
  const density =
    input.protocol === "bioimpedancia" || input.protocol === "manual"
      ? null
      : bodyDensity(input.protocol, input.skinfolds, sex, age);
  const bodyFat =
    input.protocol === "bioimpedancia" || input.protocol === "manual"
      ? input.manualBodyFat
      : density
        ? siriBodyFat(density)
        : null;
  const composition = weightKg && bodyFat ? bodyComposition(weightKg, bodyFat) : null;
  const bmrKcal = weightKg ? bmr(input.bmrFormula, weightKg, heightCm, age, sex) : null;
  const whr = waistHipRatio(input.circumferences.waist, input.circumferences.hip);
  return {
    bmi: imc,
    bmiClass: imc ? bmiClass(imc, age) : null,
    density: density ? Math.round(density * 10000) / 10000 : null,
    bodyFat,
    fatMassKg: composition?.fatMassKg ?? null,
    leanMassKg: composition?.leanMassKg ?? null,
    bmrKcal,
    tdeeKcal: tdee(bmrKcal, input.activityFactor),
    waistRisk: waistRisk(input.circumferences.waist, sex),
    whr,
    whrRisk: whrRisk(whr, sex),
  };
}

// ---------------------------------------------------------------------------
// Nutrientes
// ---------------------------------------------------------------------------

export interface Macros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export const ZERO_MACROS: Macros = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

/** Valores de uma porção a partir dos valores por 100 g. */
export function portion(per100: Macros, grams: number): Macros {
  const f = grams / 100;
  return {
    kcal: round(per100.kcal * f, 1),
    protein_g: round(per100.protein_g * f, 1),
    carbs_g: round(per100.carbs_g * f, 1),
    fat_g: round(per100.fat_g * f, 1),
  };
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (acc, m) => ({
      kcal: round(acc.kcal + Number(m.kcal), 1),
      protein_g: round(acc.protein_g + Number(m.protein_g), 1),
      carbs_g: round(acc.carbs_g + Number(m.carbs_g), 1),
      fat_g: round(acc.fat_g + Number(m.fat_g), 1),
    }),
    ZERO_MACROS,
  );
}

/** Distribuição de energia (%) entre macronutrientes (4/4/9 kcal por grama). */
export function macroSplit(m: Macros) {
  const p = m.protein_g * 4;
  const c = m.carbs_g * 4;
  const f = m.fat_g * 9;
  const total = p + c + f || 1;
  return {
    protein: Math.round((p / total) * 100),
    carbs: Math.round((c / total) * 100),
    fat: Math.round((f / total) * 100),
  };
}
