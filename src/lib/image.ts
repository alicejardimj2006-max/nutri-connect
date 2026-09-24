import { t } from "./i18n";
/**
 * Lê uma imagem e a reduz (lado maior e qualidade limitados) para caber com folga
 * no armazenamento local do navegador. Retorna uma data URL JPEG.
 */
export function fileToDataUrl(file: File, maxSide = 1280, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(t("err.imgFile")));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(t("err.imgRead")));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(t("err.imgOpen")));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error(t("err.imgProcess")));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
