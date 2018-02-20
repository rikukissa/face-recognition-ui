export function getBestImageFromBuffer(buffer: string[]) {
  return buffer[Math.floor(buffer.length / 2)];
}
