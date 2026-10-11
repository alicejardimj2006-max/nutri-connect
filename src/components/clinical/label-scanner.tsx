// Leitor de rótulos completo (M1): código de barras (câmera ou digitado) → Open Food Facts,
// lupa "ALTO EM" da Anvisa, grupo NOVA, tabela por 100 g/ml, histórico e comparação de dois produtos.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Barcode,
  Camera,
  CameraOff,
  ExternalLink,
  GitCompareArrows,
  ImageUp,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import type { Names } from "@/lib/appearance-data";
import {
  altoEm,
  barcodeFromImage,
  createBarcodeDetector,
  deleteScan,
  fetchProduct,
  hasBarcodeDetector,
  isValidBarcode,
  listScans,
  normalizeBarcode,
  offUrl,
  saveProductScan,
  scanToProduct,
  type AltoEmKey,
  type LabelScan,
  type Nutrients,
  type Product,
} from "@/lib/food-label";
import { useNoNumbers } from "@/lib/no-numbers";
import { cn } from "@/lib/utils";
import { Card, EmptyState, buttonGhost, buttonPrimary, buttonSecondary, inputClass } from "./ui";

const scansKey = ["label-scans"] as const;

// ───────────────────────────── Textos fixos ─────────────────────────────

const SEAL_NAMES: Record<AltoEmKey, Names> = {
  acucar: ["AÇÚCAR ADICIONADO", "ADDED SUGAR", "AZÚCAR AÑADIDO", "SUCRE AJOUTÉ"],
  gordura_saturada: ["GORDURA SATURADA", "SATURATED FAT", "GRASA SATURADA", "GRAISSES SATURÉES"],
  sodio: ["SÓDIO", "SODIUM", "SODIO", "SODIUM"],
};

const NOVA: Record<1 | 2 | 3 | 4, { color: string; title: Names; text: Names }> = {
  1: {
    color: "#3f8f4f",
    title: [
      "In natura ou minimamente processado",
      "Unprocessed or minimally processed",
      "Natural o mínimamente procesado",
      "Brut ou peu transformé",
    ],
    text: [
      "Base de uma alimentação saudável, segundo o Guia Alimentar.",
      "The basis of a healthy diet, according to Brazil's Dietary Guidelines.",
      "Base de una alimentación saludable, según la Guía Alimentaria de Brasil.",
      "La base d'une alimentation saine, selon le Guide alimentaire brésilien.",
    ],
  },
  2: {
    color: "#8a9a2c",
    title: [
      "Ingrediente culinário processado",
      "Processed culinary ingredient",
      "Ingrediente culinario procesado",
      "Ingrédient culinaire transformé",
    ],
    text: [
      "Óleos, sal, açúcar: use com moderação para temperar e cozinhar.",
      "Oils, salt, sugar: use in moderation to season and cook.",
      "Aceites, sal, azúcar: úsalos con moderación para condimentar y cocinar.",
      "Huiles, sel, sucre : à utiliser avec modération pour assaisonner et cuisiner.",
    ],
  },
  3: {
    color: "#d98a1f",
    title: ["Processado", "Processed", "Procesado", "Transformé"],
    text: [
      "Pode fazer parte das refeições, em pequenas quantidades.",
      "Can be part of meals, in small amounts.",
      "Puede formar parte de las comidas, en pequeñas cantidades.",
      "Peut faire partie des repas, en petites quantités.",
    ],
  },
  4: {
    color: "#c2410c",
    title: ["Ultraprocessado", "Ultra-processed", "Ultraprocesado", "Ultra-transformé"],
    text: [
      "Melhor que seja exceção, não rotina. Que tal uma troca por algo menos processado?",
      "Better as an exception, not a routine. How about swapping for something less processed?",
      "Mejor como excepción, no como rutina. ¿Qué tal cambiarlo por algo menos procesado?",
      "Plutôt une exception qu'une habitude. Pourquoi pas un équivalent moins transformé ?",
    ],
  },
};

const NUTRIENT_ROWS: { key: keyof Nutrients; label: Names; unit: string }[] = [
  {
    key: "kcal",
    label: ["Valor energético", "Energy", "Valor energético", "Énergie"],
    unit: "kcal",
  },
  {
    key: "carboidratos",
    label: ["Carboidratos", "Carbohydrates", "Carbohidratos", "Glucides"],
    unit: "g",
  },
  {
    key: "acucares",
    label: ["Açúcares totais", "Total sugars", "Azúcares totales", "Sucres totaux"],
    unit: "g",
  },
  {
    key: "acucares_adicionados",
    label: ["Açúcares adicionados", "Added sugars", "Azúcares añadidos", "Sucres ajoutés"],
    unit: "g",
  },
  { key: "proteinas", label: ["Proteínas", "Protein", "Proteínas", "Protéines"], unit: "g" },
  {
    key: "gorduras",
    label: ["Gorduras totais", "Total fat", "Grasas totales", "Lipides"],
    unit: "g",
  },
  {
    key: "gordura_saturada",
    label: ["Gorduras saturadas", "Saturated fat", "Grasas saturadas", "Graisses saturées"],
    unit: "g",
  },
  {
    key: "gordura_trans",
    label: ["Gorduras trans", "Trans fat", "Grasas trans", "Graisses trans"],
    unit: "g",
  },
  { key: "fibras", label: ["Fibras", "Fiber", "Fibra", "Fibres"], unit: "g" },
  { key: "sodio_mg", label: ["Sódio", "Sodium", "Sodio", "Sodium"], unit: "mg" },
];

const fmt = (v: number | undefined) =>
  v === undefined ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: 1 });

// ───────────────────────────── Peças visuais ─────────────────────────────

/** Lupa "ALTO EM" no estilo do selo da Anvisa (preto e branco). */
export function AltoEmSeal({ product, compact }: { product: Product; compact?: boolean }) {
  const tr = useTr();
  const { altoEm: seals, sugarEstimated } = altoEm(product.nutrients, product.liquid);
  const high = (Object.keys(seals) as AltoEmKey[]).filter((k) => seals[k]);
  const known = Object.keys(seals).length;

  if (known === 0)
    return (
      <p className="text-xs text-muted-foreground">
        {tr([
          "Sem dados suficientes para a lupa da Anvisa.",
          "Not enough data for the Anvisa warning label.",
          "Sin datos suficientes para la lupa de Anvisa.",
          "Données insuffisantes pour la loupe de l'Anvisa.",
        ])}
      </p>
    );

  if (high.length === 0)
    return (
      <p
        className={cn(
          "rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary",
          compact && "px-2 py-1",
        )}
      >
        {tr([
          "Sem lupa “ALTO EM” pelos dados informados.",
          "No “HIGH IN” warning based on the data provided.",
          "Sin lupa “ALTO EN” según los datos informados.",
          "Pas de loupe « ÉLEVÉ EN » d'après les données.",
        ])}
      </p>
    );

  return (
    <div>
      <div
        className={cn(
          "inline-flex items-stretch overflow-hidden rounded-md border-2 border-black bg-white text-black",
          compact ? "text-[9px]" : "text-[11px]",
        )}
        role="img"
        aria-label={`${tr(["Alto em", "High in", "Alto en", "Élevé en"])}: ${high.map((k) => tr(SEAL_NAMES[k])).join(", ")}`}
      >
        <div className="flex flex-col items-center justify-center gap-0.5 bg-black px-2 py-1 font-black text-white">
          <Search className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={3} />
          <span className="leading-none">{tr(["ALTO EM", "HIGH IN", "ALTO EN", "ÉLEVÉ EN"])}</span>
        </div>
        <div className="flex flex-col justify-center divide-y divide-black">
          {high.map((k) => (
            <span key={k} className="px-2 py-0.5 font-black leading-tight tracking-tight">
              {tr(SEAL_NAMES[k])}
            </span>
          ))}
        </div>
      </div>
      {!compact && sugarEstimated && seals.acucar !== undefined && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          {tr([
            "Açúcar estimado pelo total (o rótulo na base não separa o adicionado).",
            "Sugar estimated from the total (the record doesn't separate added sugar).",
            "Azúcar estimado por el total (el registro no separa el añadido).",
            "Sucre estimé à partir du total (la fiche ne distingue pas le sucre ajouté).",
          ])}
        </p>
      )}
    </div>
  );
}

export function NovaBadge({ nova, withText }: { nova: Product["nova"]; withText?: boolean }) {
  const tr = useTr();
  if (!nova)
    return (
      <span className="text-xs text-muted-foreground">
        {tr([
          "Grupo NOVA não informado",
          "NOVA group unknown",
          "Grupo NOVA no informado",
          "Groupe NOVA inconnu",
        ])}
      </span>
    );
  const info = NOVA[nova];
  return (
    <div className="flex items-start gap-2">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-black text-white"
        style={{ background: info.color }}
        aria-hidden
      >
        {nova}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground">
          NOVA {nova} · {tr(info.title)}
        </p>
        {withText && <p className="text-[11px] text-muted-foreground">{tr(info.text)}</p>}
      </div>
    </div>
  );
}

function NutrientTable({ product }: { product: Product }) {
  const tr = useTr();
  const noNumbers = useNoNumbers();
  const [show, setShow] = useState(false);
  const rows = NUTRIENT_ROWS.filter((r) => product.nutrients[r.key] !== undefined);
  if (rows.length === 0)
    return (
      <p className="text-xs text-muted-foreground">
        {tr([
          "A base ainda não tem a tabela nutricional deste produto.",
          "The database doesn't have this product's nutrition facts yet.",
          "La base aún no tiene la tabla nutricional de este producto.",
          "La base n'a pas encore le tableau nutritionnel de ce produit.",
        ])}
      </p>
    );
  // Modo sem números: a tabela fica guardada atrás de um toque.
  if (noNumbers && !show)
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="text-xs font-semibold text-accent hover:underline"
      >
        {tr([
          "Mostrar a tabela nutricional",
          "Show nutrition facts",
          "Mostrar la tabla nutricional",
          "Afficher le tableau nutritionnel",
        ])}
      </button>
    );
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="py-1 text-left font-semibold">
            {tr(["Nutriente", "Nutrient", "Nutriente", "Nutriment"])}
          </th>
          <th className="py-1 text-right font-semibold">{product.liquid ? "100 ml" : "100 g"}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {rows.map((r) => (
          <tr key={r.key}>
            <td className="py-1 text-foreground">{tr(r.label)}</td>
            <td className="py-1 text-right tabular-nums text-foreground">
              {fmt(product.nutrients[r.key])} {r.unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductView({ product, onClose }: { product: Product; onClose: () => void }) {
  const tr = useTr();
  const [showIngredients, setShowIngredients] = useState(false);
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="h-20 w-16 shrink-0 rounded-lg bg-secondary object-contain"
            loading="lazy"
          />
        ) : (
          <span className="grid h-20 w-16 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <Barcode className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {[product.brand, product.quantity].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">{product.barcode}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(buttonGhost, "px-2")}
          aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <AltoEmSeal product={product} />
        <NovaBadge nova={product.nova} withText />
        <NutrientTable product={product} />
        {product.additives > 0 && (
          <p className="text-xs text-muted-foreground">
            {tr([
              `${product.additives} aditivo(s) na lista de ingredientes.`,
              `${product.additives} additive(s) in the ingredient list.`,
              `${product.additives} aditivo(s) en la lista de ingredientes.`,
              `${product.additives} additif(s) dans la liste des ingrédients.`,
            ])}
          </p>
        )}
        {product.ingredients && (
          <div>
            <button
              type="button"
              onClick={() => setShowIngredients((v) => !v)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {showIngredients
                ? tr([
                    "Esconder ingredientes",
                    "Hide ingredients",
                    "Ocultar ingredientes",
                    "Masquer les ingrédients",
                  ])
                : tr([
                    "Ver ingredientes",
                    "See ingredients",
                    "Ver ingredientes",
                    "Voir les ingrédients",
                  ])}
            </button>
            {showIngredients && (
              <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                {product.ingredients}
              </p>
            )}
          </div>
        )}
        <a
          href={offUrl(product.barcode)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          {tr([
            "Dados do Open Food Facts (base colaborativa). Algo errado? Corrija lá.",
            "Data from Open Food Facts (collaborative). Something wrong? Fix it there.",
            "Datos de Open Food Facts (colaborativa). ¿Algo mal? Corrígelo allí.",
            "Données d'Open Food Facts (collaboratif). Une erreur ? Corrigez-la là-bas.",
          ])}
        </a>
      </div>
    </div>
  );
}

// ───────────────────────────── Câmera ─────────────────────────────

function CameraScanner({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const tr = useTr();
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stop = false;
    const detector = createBarcodeDetector();
    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (stop || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        while (!stop && detector && video.current) {
          const found = await detector.detect(video.current).catch(() => []);
          const code = found.map((f) => normalizeBarcode(f.rawValue)).find(isValidBarcode);
          if (code) {
            navigator.vibrate?.(60);
            onCode(code);
            return;
          }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch {
        setError(
          tr([
            "Não deu para abrir a câmera. Libere o acesso ou digite o código.",
            "Couldn't open the camera. Allow access or type the code.",
            "No se pudo abrir la cámara. Permite el acceso o escribe el código.",
            "Impossible d'ouvrir la caméra. Autorisez l'accès ou saisissez le code.",
          ]),
        );
      }
    })();
    return () => {
      stop = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      {error ? (
        <p className="flex items-center gap-2 p-6 text-sm text-white">
          <CameraOff className="h-5 w-5 shrink-0" /> {error}
        </p>
      ) : (
        <>
          <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          <p className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white">
            {tr([
              "Aponte para o código de barras",
              "Point at the barcode",
              "Apunta al código de barras",
              "Visez le code-barres",
            ])}
          </p>
        </>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
        aria-label={tr(["Fechar câmera", "Close camera", "Cerrar cámara", "Fermer la caméra"])}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ───────────────────────────── Comparação ─────────────────────────────

function Compare({ a, b, onClose }: { a: Product; b: Product; onClose: () => void }) {
  const tr = useTr();
  // Menor é melhor nestes; maior é melhor em fibras e proteínas.
  const lowerBetter = new Set<keyof Nutrients>([
    "kcal",
    "acucares",
    "acucares_adicionados",
    "gordura_saturada",
    "gordura_trans",
    "sodio_mg",
  ]);
  const higherBetter = new Set<keyof Nutrients>(["fibras", "proteinas"]);
  const rows = NUTRIENT_ROWS.filter(
    (r) => a.nutrients[r.key] !== undefined || b.nutrients[r.key] !== undefined,
  );
  const better = (k: keyof Nutrients, side: "a" | "b") => {
    const va = a.nutrients[k];
    const vb = b.nutrients[k];
    if (va === undefined || vb === undefined || va === vb) return false;
    const mine = side === "a" ? va : vb;
    const other = side === "a" ? vb : va;
    return lowerBetter.has(k) ? mine < other : higherBetter.has(k) ? mine > other : false;
  };
  const sameBase = a.liquid === b.liquid;

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          {tr(["Comparação", "Comparison", "Comparación", "Comparaison"])}
        </span>
      }
      action={
        <button type="button" onClick={onClose} className={cn(buttonGhost, "px-2")} aria-label="×">
          <X className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((p, i) => (
          <div key={i} className="min-w-0 space-y-2">
            <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
            <AltoEmSeal product={p} compact />
            <NovaBadge nova={p.nova} />
          </div>
        ))}
      </div>
      {!sameBase && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {tr([
            "Atenção: um é por 100 g e o outro por 100 ml.",
            "Note: one is per 100 g and the other per 100 ml.",
            "Atención: uno es por 100 g y el otro por 100 ml.",
            "Attention : l'un est pour 100 g et l'autre pour 100 ml.",
          ])}
        </p>
      )}
      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="py-1 text-left font-semibold">
              {a.liquid && b.liquid ? "100 ml" : "100 g"}
            </th>
            <th className="py-1 text-right font-semibold">A</th>
            <th className="py-1 text-right font-semibold">B</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="py-1 text-foreground">{tr(r.label)}</td>
              {(["a", "b"] as const).map((side) => (
                <td
                  key={side}
                  className={cn(
                    "py-1 text-right tabular-nums",
                    better(r.key, side) ? "font-bold text-primary" : "text-foreground",
                  )}
                >
                  {fmt((side === "a" ? a : b).nutrients[r.key])} {r.unit}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {tr([
          "Em verde, o melhor de cada linha. Olhe o conjunto: nenhum número sozinho define um alimento.",
          "In green, the better one in each row. Look at the whole: no single number defines a food.",
          "En verde, el mejor de cada fila. Mira el conjunto: ningún número solo define un alimento.",
          "En vert, le meilleur de chaque ligne. Regardez l'ensemble : aucun chiffre seul ne définit un aliment.",
        ])}
      </p>
    </Card>
  );
}

// ───────────────────────────── Histórico ─────────────────────────────

function History({
  selected,
  onToggle,
  onOpen,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  onOpen: (scan: LabelScan) => void;
}) {
  const tr = useTr();
  const qc = useQueryClient();
  const scans = useQuery({ queryKey: scansKey, queryFn: () => listScans(50) });
  const remove = useMutation({
    mutationFn: deleteScan,
    onSettled: () => qc.invalidateQueries({ queryKey: scansKey }),
  });
  const list = scans.data ?? [];

  if (!scans.isLoading && list.length === 0)
    return (
      <EmptyState
        icon={Barcode}
        title={tr([
          "Nenhum produto lido ainda",
          "No products scanned yet",
          "Ningún producto leído aún",
          "Aucun produit scanné",
        ])}
        text={tr([
          "Os produtos que você ler aparecem aqui para rever e comparar.",
          "Products you scan show up here to review and compare.",
          "Los productos que leas aparecen aquí para revisar y comparar.",
          "Les produits scannés apparaissent ici pour les revoir et comparer.",
        ])}
      />
    );

  return (
    <ul className="divide-y divide-border/60">
      {list.map((s) => {
        const canCompare = s.source === "codigo";
        const on = selected.includes(s.id);
        return (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            {canCompare && (
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(s.id)}
                aria-label={tr(["Comparar", "Compare", "Comparar", "Comparer"])}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
            )}
            <button
              type="button"
              onClick={() => onOpen(s)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt=""
                  className="h-10 w-8 shrink-0 rounded bg-secondary object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-10 w-8 shrink-0 place-items-center rounded bg-secondary text-muted-foreground">
                  {s.source === "foto" ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <Barcode className="h-4 w-4" />
                  )}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {s.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {[
                    s.brand,
                    s.nova ? `NOVA ${s.nova}` : null,
                    new Date(s.created_at).toLocaleDateString(),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => remove.mutate(s.id)}
              className={cn(buttonGhost, "px-2")}
              aria-label={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ───────────────────────────── Leitor ─────────────────────────────

export function LabelScanner() {
  const tr = useTr();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [camera, setCamera] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [photoSummary, setPhotoSummary] = useState<LabelScan | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);
  const liveCamera = hasBarcodeDetector();

  const lookup = useMutation({
    mutationFn: async (barcode: string) => {
      const p = await fetchProduct(barcode);
      if (p && user) await saveProductScan(user.id, p).catch((e) => console.warn("label_scans", e));
      return { barcode, product: p };
    },
    onSuccess: ({ barcode, product: p }) => {
      if (!p) {
        toast.error(
          tr([
            `O código ${barcode} ainda não está na base. Que tal fotografar o rótulo para a Nina ler?`,
            `Code ${barcode} isn't in the database yet. How about photographing the label for Nina?`,
            `El código ${barcode} aún no está en la base. ¿Y si fotografías la etiqueta para Nina?`,
            `Le code ${barcode} n'est pas encore dans la base. Et si vous photographiiez l'étiquette pour Nina ?`,
          ]),
        );
        return;
      }
      setProduct(p);
      setPhotoSummary(null);
      qc.invalidateQueries({ queryKey: scansKey });
    },
    onError: () =>
      toast.error(
        tr([
          "Não deu para consultar a base agora. Tente de novo em instantes.",
          "Couldn't reach the database now. Try again shortly.",
          "No se pudo consultar la base ahora. Inténtalo en un momento.",
          "Impossible de consulter la base pour le moment. Réessayez bientôt.",
        ]),
      ),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const c = normalizeBarcode(code);
    if (!isValidBarcode(c)) {
      toast.error(
        tr([
          "Digite os números do código de barras (8 a 14 dígitos).",
          "Type the barcode digits (8 to 14).",
          "Escribe los números del código de barras (8 a 14 dígitos).",
          "Saisissez les chiffres du code-barres (8 à 14).",
        ]),
      );
      return;
    }
    lookup.mutate(c);
  };

  const fromPhoto = async (file: File | undefined) => {
    if (photoInput.current) photoInput.current.value = "";
    if (!file) return;
    const c = await barcodeFromImage(file).catch(() => null);
    if (c) {
      setCode(c);
      lookup.mutate(c);
    } else
      toast.error(
        tr([
          "Não encontrei um código de barras na foto. Tente mais de perto ou digite os números.",
          "No barcode found in the photo. Try closer or type the digits.",
          "No encontré un código de barras en la foto. Prueba más cerca o escribe los números.",
          "Aucun code-barres trouvé sur la photo. Rapprochez-vous ou saisissez les chiffres.",
        ]),
      );
  };

  const scans = useQuery({ queryKey: scansKey, queryFn: () => listScans(50) });
  const scansData = scans.data ?? [];
  const pair = selected
    .map((id) => scansData.find((s) => s.id === id))
    .filter((s): s is LabelScan => !!s)
    .map(scanToProduct);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur.slice(-1), id]));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <Card
          title={
            <span className="flex items-center gap-2">
              <Barcode className="h-5 w-5 text-primary" />
              {tr(["Código de barras", "Barcode", "Código de barras", "Code-barres"])}
            </span>
          }
        >
          {camera ? (
            <CameraScanner
              onCode={(c) => {
                setCamera(false);
                setCode(c);
                lookup.mutate(c);
              }}
              onClose={() => setCamera(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {liveCamera && (
                <button type="button" className={buttonPrimary} onClick={() => setCamera(true)}>
                  <Camera className="h-4 w-4" />
                  {tr([
                    "Ler com a câmera",
                    "Scan with camera",
                    "Leer con la cámara",
                    "Scanner avec la caméra",
                  ])}
                </button>
              )}
              {liveCamera && (
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => photoInput.current?.click()}
                >
                  <ImageUp className="h-4 w-4" />
                  {tr(["Foto do código", "Photo of the code", "Foto del código", "Photo du code"])}
                </button>
              )}
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => void fromPhoto(e.target.files?.[0])}
              />
            </div>
          )}

          <form onSubmit={submit} className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder={tr([
                "Ou digite os números (ex.: 7891234567895)",
                "Or type the digits (e.g. 7891234567895)",
                "O escribe los números (ej.: 7891234567895)",
                "Ou saisissez les chiffres (ex. : 7891234567895)",
              ])}
              className={cn(inputClass, "flex-1 tabular-nums")}
            />
            <button type="submit" className={buttonSecondary} disabled={lookup.isPending}>
              <Search className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">
                {tr(["Buscar", "Search", "Buscar", "Chercher"])}
              </span>
            </button>
          </form>
          {!liveCamera && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              {tr([
                "Este navegador não lê códigos pela câmera; digite os números abaixo das barras.",
                "This browser can't read barcodes with the camera; type the digits under the bars.",
                "Este navegador no lee códigos con la cámara; escribe los números bajo las barras.",
                "Ce navigateur ne lit pas les codes avec la caméra ; saisissez les chiffres sous les barres.",
              ])}
            </p>
          )}
          {lookup.isPending && (
            <p className="mt-3 text-sm text-muted-foreground">
              {tr([
                "Buscando o produto…",
                "Looking up the product…",
                "Buscando el producto…",
                "Recherche du produit…",
              ])}
            </p>
          )}
        </Card>

        {product && <ProductView product={product} onClose={() => setProduct(null)} />}
        {photoSummary && (
          <Card
            title={photoSummary.name}
            action={
              <button
                type="button"
                onClick={() => setPhotoSummary(null)}
                className={cn(buttonGhost, "px-2")}
                aria-label="×"
              >
                <X className="h-4 w-4" />
              </button>
            }
          >
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {photoSummary.summary?.replace(/\*\*/g, "")}
            </p>
          </Card>
        )}
        {pair.length === 2 && <Compare a={pair[0]} b={pair[1]} onClose={() => setSelected([])} />}
      </div>

      <Card
        title={tr(["Histórico", "History", "Historial", "Historique"])}
        action={
          selected.length > 0 ? (
            <span className="text-[11px] text-muted-foreground">
              {selected.length === 1
                ? tr([
                    "Marque mais um para comparar",
                    "Tick one more to compare",
                    "Marca uno más para comparar",
                    "Cochez-en un autre pour comparer",
                  ])
                : tr(["Comparando 2", "Comparing 2", "Comparando 2", "Comparaison de 2"])}
            </span>
          ) : undefined
        }
      >
        <History
          selected={selected}
          onToggle={toggle}
          onOpen={(s) => {
            if (s.source === "codigo") {
              setProduct(scanToProduct(s));
              setPhotoSummary(null);
            } else {
              setPhotoSummary(s);
              setProduct(null);
            }
          }}
        />
      </Card>
    </div>
  );
}
