import { IFaceRect } from "./withTracking";

export function crop(src: ImageData, rect: IFaceRect) {
  const $canvas = document.createElement("canvas");
  const PADDING = 30;

  $canvas.width = rect.width + PADDING * 2;
  $canvas.height = rect.height + PADDING * 2;

  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.putImageData(src, -(rect.x - PADDING), -(rect.y - PADDING));
  return $canvas.toDataURL();
}

export function imageDataToURL(src: ImageData) {
  const $canvas = document.createElement("canvas");
  $canvas.width = src.width;
  $canvas.height = src.height;
  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.putImageData(src, 0, 0);
  return $canvas.toDataURL();
}

export async function imageDataToBlob(
  src: ImageData,
  mime: string
): Promise<Blob> {
  const $canvas = document.createElement("canvas");
  $canvas.width = src.width;
  $canvas.height = src.height;
  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  context.putImageData(src, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    $canvas.toBlob((blob: Blob | null) => {
      if (blob !== null) {
        resolve(blob);
        return;
      }
      reject(new Error("Couldn't create blob"));
    }, mime);
  });
}
