import { IFaceRect } from "./withTracking";

export async function crop(src: string, rect: IFaceRect) {
  const $canvas = document.createElement("canvas");
  const PADDING = 30;

  $canvas.width = rect.width + PADDING * 2;
  $canvas.height = rect.height + PADDING * 2;

  const context = $canvas.getContext("2d") as CanvasRenderingContext2D;
  const image = new Image();

  return new Promise(resolve => {
    image.onload = () => {
      // context.drawImage(image, 0, 0);
      context.drawImage(image, -(rect.x - PADDING), -(rect.y - PADDING));
      resolve($canvas.toDataURL());
    };
    image.src = src;
  });
}
