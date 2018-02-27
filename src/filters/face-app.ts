import { transform } from "../lib/api";

let loading = false;
let loadedImage: null | HTMLImageElement = null;
let startedShowingAt: null | number = null;

function reset() {
  loading = false;
  loadedImage = null;
}

function getImageFromBuffer(input: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = `data:image/png;base64,${input}`;
  });
}

export async function faceAppFilter(context: CanvasRenderingContext2D) {
  if (!loading && !loadedImage) {
    loading = true;
    try {
      const buffer = await transform(context.canvas.toDataURL());
      loadedImage = await getImageFromBuffer(buffer);
      startedShowingAt = Date.now();
    } catch (err) {
      loading = false;
    }
  }

  if (loadedImage && startedShowingAt) {
    context.drawImage(loadedImage, 0, 0);
    if (Date.now() - startedShowingAt > 3000) {
      reset();
    }
  }
}
