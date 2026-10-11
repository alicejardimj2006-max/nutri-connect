import { createFileRoute } from "@tanstack/react-router";
import { LabelReaderCard } from "@/components/clinical/label-reader-card";
import { LabelScanner } from "@/components/clinical/label-scanner";
import { PageHeader } from "@/components/clinical/ui";
import { useTr } from "@/components/settings-ui";

export const Route = createFileRoute("/acompanhamento/rotulos")({
  head: () => ({ meta: [{ title: "Leitor de rótulos — NutriConnect" }] }),
  component: LabelsPage,
});

function LabelsPage() {
  const tr = useTr();
  return (
    <>
      <PageHeader
        title={tr([
          "Leitor de rótulos",
          "Label reader",
          "Lector de etiquetas",
          "Lecteur d'étiquettes",
        ])}
        subtitle={tr([
          "Leia o código de barras para ver a lupa da Anvisa, o grupo NOVA e a tabela; compare dois produtos do histórico.",
          "Scan the barcode to see Anvisa's warning label, the NOVA group and nutrition facts; compare two products from your history.",
          "Lee el código de barras para ver la lupa de Anvisa, el grupo NOVA y la tabla; compara dos productos del historial.",
          "Scannez le code-barres pour voir la loupe de l'Anvisa, le groupe NOVA et le tableau ; comparez deux produits de l'historique.",
        ])}
      />
      <LabelScanner />
      <div className="mt-4 max-w-xl">
        <LabelReaderCard saveToHistory />
      </div>
    </>
  );
}
