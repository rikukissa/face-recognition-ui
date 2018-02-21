const cloneCanvas = document.createElement("canvas");
const cloneContext = cloneCanvas.getContext("2d") as CanvasRenderingContext2D;

let frame = 0;

export function interferenceFilter(context: CanvasRenderingContext2D) {
  frame = frame + 1;
  const interferenceHeight = context.canvas.height / 5;
  const interferenceOffset = Math.sin(frame * 0.2) * 10;

  // Clone image to new canvas
  cloneCanvas.width = context.canvas.width;
  cloneCanvas.height = context.canvas.height;

  // Modify image
  cloneContext.clearRect(0, 0, cloneCanvas.width, cloneCanvas.height);
  cloneContext.drawImage(context.canvas, 50, 0);
  cloneContext.globalCompositeOperation = "destination-out";

  cloneContext.beginPath();
  cloneContext.moveTo(0, 0);
  cloneContext.lineTo(0, interferenceOffset + context.canvas.height / 3);
  cloneContext.lineTo(
    context.canvas.width,
    interferenceOffset + context.canvas.height / 4
  );
  cloneContext.lineTo(context.canvas.width, 0);
  cloneContext.closePath();
  cloneContext.fill();

  cloneContext.beginPath();
  cloneContext.moveTo(0, context.canvas.height);
  cloneContext.lineTo(
    0,
    interferenceOffset + context.canvas.height / 3 + interferenceHeight
  );
  cloneContext.lineTo(
    context.canvas.width,
    interferenceOffset + context.canvas.height / 4 + interferenceHeight
  );
  cloneContext.lineTo(context.canvas.width, context.canvas.height);
  cloneContext.closePath();
  cloneContext.fill();

  // Clone image back to original canvas
  context.drawImage(
    cloneCanvas,
    -70,
    0,
    context.canvas.width + 70,
    context.canvas.height
  );
}
